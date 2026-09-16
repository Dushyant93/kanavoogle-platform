package com.kanavoogle.skills.bootstrap;

import com.kanavoogle.skills.assessment.*;
import com.kanavoogle.skills.taxonomy.*;

import java.time.Instant;
import java.util.*;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private final SkillRepository skills;
    private final QuestionRepository questions;

    public DataSeeder(SkillRepository s, QuestionRepository q) {
        skills = s;
        questions = q;
    }

    public void run(String... a) {
        if (skills.count() == 0) skills.saveAll(buildSkills());
        if (questions.count() == 0) questions.saveAll(seedQuestions());
    }

    private List<Skill> buildSkills() {
        return List.of(skill("creativity-innovation", "CREATIVITY_INNOVATION", "Creativity & Innovation", List.of("Design Thinking", "Gamification", "Pitching Ideas", "Storyboarding for Apps", "UX/UI Wireframing", "Brainstorming Techniques", "Visual/Graphic Design Basics", "Iteration & Prototyping")), skill("time-management", "TIME_MANAGEMENT", "Time Management", List.of("Prioritization Techniques", "Deadline Planning & Scheduling", "Procrastination Management", "Task Duration Estimation", "Calendar & Planning Tool Usage", "Balancing Multiple Deadlines")), skill("problem-solving-critical-thinking", "PROBLEM_SOLVING_CRITICAL_THINKING", "Problem Solving Critical Thinking", List.of("Algorithms & Flow Charts", "Cyber Security", "Data Interpretation", "Debugging Challenges", "Ethical Dilemmas in Tech", "Logic Puzzles", "Systems Thinking", "Root Cause Analysis", "Trade-off Evaluation", "Constraint-Based Problem Solving")), skill("communication", "COMMUNICATION", "Communication", List.of("Active Listening", "Constructive Feedback Exchange", "Cross-Functional Teamwork", "Oral Presentation Skills", "Team Conflict Resolution", "Written Communication & Reports")), skill("verbal-written-communication", "VERBAL_WRITTEN_COMMUNICATION", "Verbal & Written Communication", List.of("Reading Comprehension", "Verbal Reasoning & Argument Evaluation", "Email / Message Writing", "Vocabulary in Context", "Persuasive Writing", "Summarizing Information")), skill("digital-use", "DIGITAL_USE", "Digital Use", List.of("Cloud Computing Basics", "Data Ethics", "Digital Literacy", "Engaged Learning", "Online Safety & Privacy", "Productivity Principles", "UX/UI Principle", "App/Software Navigation", "Digital Footprint Awareness", "AI Tool Literacy")), skill("collaboration-teamwork", "COLLABORATION_TEAMWORK", "Collaboration & Teamwork", List.of("Team Role Awareness", "Conflict Resolution", "Peer Feedback", "Shared Goal Setting", "Remote Collaboration Tools", "Delegation & Accountability")));
    }

    private Skill skill(String id, String code, String name, List<String> subs) {
        Skill s = new Skill();
        s.setId(id);
        s.setCode(code);
        s.setName(name);
        s.setDescription("Stakeholder-provided skill family");
        s.setSubSkills(subs.stream().map(n -> new Skill.SubSkill(slug(n), n)).toList());
        return s;
    }

    private String slug(String n) {
        return n.toLowerCase(Locale.ROOT).replace("&", "and").replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }

    private List<Question> seedQuestions() {
        return List.of(q("problem-solving-critical-thinking", "data-interpretation", Complexity.FOUNDATION, "A survey shows 40 students prefer buses, 25 trains and 15 cycling. Which option is most popular?", List.of("Bus", "Train", "Cycling", "All are equal"), "Bus", "40 is the largest count."), q("problem-solving-critical-thinking", "data-interpretation", Complexity.FOUNDATION, "App use falls from 80 minutes to 60 minutes per day. What is the decrease?", List.of("10 minutes", "20 minutes", "25 minutes", "40 minutes"), "20 minutes", "80 minus 60 equals 20."), q("problem-solving-critical-thinking", "data-interpretation", Complexity.INTERMEDIATE, "A class has averages of 62, 68 and 76 across three terms. Which statement is supported?", List.of("Performance improved each term", "Performance stayed the same", "Performance fell each term", "No trend"), "Performance improved each term", "The average rises each term."), q("problem-solving-critical-thinking", "data-interpretation", Complexity.INTERMEDIATE, "A site receives 1,000 visits and 250 users complete a task. What is the completion rate?", List.of("20%", "25%", "40%", "75%"), "25%", "250 / 1000 = 25%."), q("problem-solving-critical-thinking", "data-interpretation", Complexity.ADVANCED, "Two groups both average 70, but one has much wider scores. Which measure best shows this difference?", List.of("Median only", "Range or standard deviation", "Total score", "Question count"), "Range or standard deviation", "Spread measures reveal variability."), q("digital-use", "ai-tool-literacy", Complexity.FOUNDATION, "What is the safest way to use an AI tool for a school assignment?", List.of("Submit without checking", "Verify important claims and follow assignment rules", "Share your password", "Assume every citation is real"), "Verify important claims and follow assignment rules", "AI output can be wrong and must be checked."), q("digital-use", "ai-tool-literacy", Complexity.INTERMEDIATE, "An AI answer gives a confident statistic but no source. What should you do first?", List.of("Use it", "Verify it with a reliable source", "Change it slightly", "Ignore the issue"), "Verify it with a reliable source", "Confidence is not evidence."), q("digital-use", "online-safety-and-privacy", Complexity.FOUNDATION, "Which password practice is strongest?", List.of("Reuse a short password", "Use a unique long password and MFA", "Share passwords", "Use name and birth year"), "Use a unique long password and MFA", "Unique passwords and MFA reduce account risk."));
    }

    private Question q(String skill, String sub, Complexity c, String prompt, List<String> opts, String ans, String exp) {
        Question q = new Question();
        q.setSkillId(skill);
        q.setSubSkillId(sub);
        q.setContext("General");
        q.setComplexity(c);
        q.setType(QuestionType.MULTIPLE_CHOICE);
        q.setPrompt(prompt);
        q.setOptions(opts);
        q.setCorrectAnswer(ans);
        q.setExplanation(exp);
        q.setSource("SEEDED_APPROVED");
        q.setCreatedAt(Instant.now());
        return q;
    }
}
