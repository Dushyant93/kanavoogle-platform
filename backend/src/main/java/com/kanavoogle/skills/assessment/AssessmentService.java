package com.kanavoogle.skills.assessment;

import com.kanavoogle.skills.llm.*;
import com.kanavoogle.skills.security.SecurityUtils;
import com.kanavoogle.skills.taxonomy.*;
import com.kanavoogle.skills.user.*;

import java.time.Instant;
import java.util.*;

import org.springframework.stereotype.Service;

@Service
public class AssessmentService {
    private final AssessmentAttemptRepository attempts;
    private final QuestionRepository questions;
    private final SkillRepository skills;
    private final UserRepository users;
    private final LlmQuestionClient llm;

    public AssessmentService(AssessmentAttemptRepository a, QuestionRepository q, SkillRepository s, UserRepository u, LlmQuestionClient l) {
        attempts = a;
        questions = q;
        skills = s;
        users = u;
        llm = l;
    }

    public record Create(String skillId, String subSkillId, String context, Complexity complexity, int questionCount) {
    }

    public record QView(String questionId, QuestionType type, String prompt, List<String> options) {
    }

    public record View(String id, String skillId, String skillName, String subSkillId, String subSkillName,
                       String context, Complexity complexity, String status, List<QView> questions, Double rawPercent,
                       Double weightedPercent, String coinAllocationStatus, Instant createdAt, Instant completedAt) {
    }

    public record Submit(Map<String, String> responses) {
    }

    public record Result(View assessment, int correctAnswers, int totalQuestions) {
    }

    public View create(Create r) {
        if (r.questionCount() < 3 || r.questionCount() > 15)
            throw new IllegalArgumentException("Question count must be between 3 and 15");
        UserAccount u = student();
        Skill skill = skills.findById(r.skillId()).orElseThrow(() -> new IllegalArgumentException("Unknown skill"));
        Skill.SubSkill sub = skill.getSubSkills().stream().filter(x -> x.getId().equals(r.subSkillId())).findFirst().orElseThrow(() -> new IllegalArgumentException("Unknown sub-skill"));
        var p = u.getStudentProfile();
        Set<String> seen = new HashSet<>();
        for (var a : attempts.findTop10ByStudentIdOrderByCreatedAtDesc(u.getId()))
            for (var q : a.getQuestions()) seen.add(q.getQuestionId());
        List<Question> pool = new ArrayList<>(questions.findBySkillIdAndSubSkillIdAndComplexityAndActiveTrue(skill.getId(), sub.getId(), r.complexity()).stream().filter(q -> q.getAgeMin() <= p.getAge() && q.getAgeMax() >= p.getAge() && q.getYearMin() <= p.getYearLevel() && q.getYearMax() >= p.getYearLevel() && !seen.contains(q.getId())).toList());
        Collections.shuffle(pool);
        if (pool.size() < r.questionCount() && llm.enabled()) {
            int missing = r.questionCount() - pool.size();
            for (var g : llm.generate(new LlmQuestionClient.Request(p.getAge(), p.getYearLevel(), skill.getName(), sub.getName(), context(r.context()), r.complexity(), missing))) {
                if (pool.size() >= r.questionCount()) break;
                try {
                    Question q = validate(g, skill.getId(), sub.getId(), context(r.context()), r.complexity(), p.getAge(), p.getYearLevel());
                    pool.add(questions.save(q));
                } catch (IllegalArgumentException ignored) {
                }
            }
        }
        if (pool.size() < r.questionCount()) {
            for (Question q : questions.findBySkillIdAndSubSkillIdAndComplexityAndActiveTrue(skill.getId(), sub.getId(), r.complexity()))
                if (pool.stream().noneMatch(x -> Objects.equals(x.getId(), q.getId()))) pool.add(q);
        }
        if (pool.size() < r.questionCount())
            throw new IllegalStateException("Not enough approved questions for this configuration. Enable LLM integration or add question-bank content.");
        AssessmentAttempt a = new AssessmentAttempt();
        a.setStudentId(u.getId());
        a.setSkillId(skill.getId());
        a.setSkillName(skill.getName());
        a.setSubSkillId(sub.getId());
        a.setSubSkillName(sub.getName());
        a.setContext(context(r.context()));
        a.setComplexity(r.complexity());
        a.setCreatedAt(Instant.now());
        a.setQuestions(pool.stream().limit(r.questionCount()).map(AssessmentAttempt.QuestionSnapshot::from).toList());
        return view(attempts.save(a));
    }

    public View get(String id) {
        return view(owned(id));
    }

    public List<View> recent() {
        return attempts.findTop10ByStudentIdOrderByCreatedAtDesc(SecurityUtils.current().userId()).stream().map(this::view).toList();
    }

    public Result submit(String id, Submit r) {
        AssessmentAttempt a = owned(id);
        if ("COMPLETED".equals(a.getStatus())) throw new IllegalStateException("Assessment already completed");
        if (r.responses() == null) throw new IllegalArgumentException("Responses are required");
        int correct = 0;
        double earned = 0, possible = 0;
        Map<String, String> clean = new LinkedHashMap<>();
        for (var q : a.getQuestions()) {
            String ans = Optional.ofNullable(r.responses().get(q.getQuestionId())).orElse("").trim();
            if (ans.isBlank()) throw new IllegalArgumentException("Every question must be answered");
            if (ans.length() > 500) ans = ans.substring(0, 500);
            clean.put(q.getQuestionId(), ans);
            double w = weight(q.getComplexity());
            possible += w;
            if (q.getCorrectAnswer().equalsIgnoreCase(ans)) {
                correct++;
                earned += w;
            }
        }
        a.setResponses(clean);
        a.setRawPercent(round(correct * 100.0 / a.getQuestions().size()));
        a.setWeightedPercent(round(earned * 100.0 / possible));
        a.setStatus("COMPLETED");
        a.setCompletedAt(Instant.now());
        a = attempts.save(a);
        return new Result(view(a), correct, a.getQuestions().size());
    }

    private UserAccount student() {
        UserAccount u = users.findById(SecurityUtils.current().userId()).orElseThrow();
        if (u.getRole() != Role.STUDENT) throw new SecurityException("Student role required");
        return u;
    }

    private AssessmentAttempt owned(String id) {
        AssessmentAttempt a = attempts.findById(id).orElseThrow(() -> new IllegalArgumentException("Assessment not found"));
        if (!a.getStudentId().equals(SecurityUtils.current().userId())) throw new SecurityException("Access denied");
        return a;
    }

    private View view(AssessmentAttempt a) {
        return new View(a.getId(), a.getSkillId(), a.getSkillName(), a.getSubSkillId(), a.getSubSkillName(), a.getContext(), a.getComplexity(), a.getStatus(), a.getQuestions().stream().map(q -> new QView(q.getQuestionId(), q.getType(), q.getPrompt(), q.getOptions())).toList(), a.getRawPercent(), a.getWeightedPercent(), a.getCoinAllocationStatus(), a.getCreatedAt(), a.getCompletedAt());
    }

    private Question validate(LlmQuestionClient.GeneratedQuestion g, String skill, String sub, String ctx, Complexity c, int age, int year) {
        QuestionType type;
        try {
            type = QuestionType.valueOf(g.type());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid LLM question type");
        }
        String prompt = bounded(g.prompt(), 10, 700), answer = bounded(g.correctAnswer(), 1, 300), explanation = bounded(g.explanation(), 1, 700);
        List<String> opts = g.options() == null ? List.of() : g.options().stream().map(String::trim).filter(x -> !x.isBlank()).toList();
        if (type == QuestionType.MULTIPLE_CHOICE && (opts.size() != 4 || !opts.contains(answer)))
            throw new IllegalArgumentException("Invalid LLM MCQ");
        Question q = new Question();
        q.setSkillId(skill);
        q.setSubSkillId(sub);
        q.setContext(ctx);
        q.setComplexity(c);
        q.setAgeMin(Math.max(13, age - 1));
        q.setAgeMax(Math.min(19, age + 1));
        q.setYearMin(Math.max(7, year - 1));
        q.setYearMax(Math.min(12, year + 1));
        q.setType(type);
        q.setPrompt(prompt);
        q.setOptions(opts);
        q.setCorrectAnswer(answer);
        q.setExplanation(explanation);
        q.setSource("LLM_VALIDATED");
        q.setCreatedAt(Instant.now());
        return q;
    }

    private String bounded(String v, int min, int max) {
        if (v == null) throw new IllegalArgumentException("Missing LLM field");
        String x = v.trim();
        if (x.length() < min || x.length() > max) throw new IllegalArgumentException("Invalid LLM field length");
        return x;
    }

    private String context(String v) {
        String x = (v == null ? "General" : v).replaceAll("[^A-Za-z0-9 &/()'.,+-]", "").trim();
        if (x.isBlank()) x = "General";
        return x.substring(0, Math.min(80, x.length()));
    }

    private double weight(Complexity c) {
        return switch (c) {
            case FOUNDATION -> 1;
            case INTERMEDIATE -> 1.25;
            case ADVANCED -> 1.5;
        };
    }

    private double round(double d) {
        return Math.round(d * 10) / 10.0;
    }
}
