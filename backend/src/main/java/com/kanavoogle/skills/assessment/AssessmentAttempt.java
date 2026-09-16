package com.kanavoogle.skills.assessment;

import java.time.Instant;
import java.util.*;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("assessment_attempts")
public class AssessmentAttempt {
    @Id
    private String id;
    private String studentId, skillId, skillName, subSkillId, subSkillName, context, status = "IN_PROGRESS", coinAllocationStatus = "PENDING_STAKEHOLDER_RULES";
    private Complexity complexity;
    private List<QuestionSnapshot> questions = new ArrayList<>();
    private Map<String, String> responses = new LinkedHashMap<>();
    private Double rawPercent, weightedPercent;
    private Instant createdAt, completedAt;

    public static class QuestionSnapshot {
        private String questionId, prompt, correctAnswer, explanation;
        private QuestionType type;
        private Complexity complexity;
        private List<String> options;

        public static QuestionSnapshot from(Question q) {
            QuestionSnapshot s = new QuestionSnapshot();
            s.questionId = q.getId();
            s.prompt = q.getPrompt();
            s.correctAnswer = q.getCorrectAnswer();
            s.explanation = q.getExplanation();
            s.type = q.getType();
            s.complexity = q.getComplexity();
            s.options = q.getOptions();
            return s;
        }

        public String getQuestionId() {
            return questionId;
        }

        public String getPrompt() {
            return prompt;
        }

        public String getCorrectAnswer() {
            return correctAnswer;
        }

        public String getExplanation() {
            return explanation;
        }

        public QuestionType getType() {
            return type;
        }

        public Complexity getComplexity() {
            return complexity;
        }

        public List<String> getOptions() {
            return options;
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String v) {
        id = v;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String v) {
        studentId = v;
    }

    public String getSkillId() {
        return skillId;
    }

    public void setSkillId(String v) {
        skillId = v;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String v) {
        skillName = v;
    }

    public String getSubSkillId() {
        return subSkillId;
    }

    public void setSubSkillId(String v) {
        subSkillId = v;
    }

    public String getSubSkillName() {
        return subSkillName;
    }

    public void setSubSkillName(String v) {
        subSkillName = v;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String v) {
        context = v;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String v) {
        status = v;
    }

    public String getCoinAllocationStatus() {
        return coinAllocationStatus;
    }

    public void setCoinAllocationStatus(String v) {
        coinAllocationStatus = v;
    }

    public Complexity getComplexity() {
        return complexity;
    }

    public void setComplexity(Complexity v) {
        complexity = v;
    }

    public List<QuestionSnapshot> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionSnapshot> v) {
        questions = v;
    }

    public Map<String, String> getResponses() {
        return responses;
    }

    public void setResponses(Map<String, String> v) {
        responses = v;
    }

    public Double getRawPercent() {
        return rawPercent;
    }

    public void setRawPercent(Double v) {
        rawPercent = v;
    }

    public Double getWeightedPercent() {
        return weightedPercent;
    }

    public void setWeightedPercent(Double v) {
        weightedPercent = v;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant v) {
        createdAt = v;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant v) {
        completedAt = v;
    }
}
