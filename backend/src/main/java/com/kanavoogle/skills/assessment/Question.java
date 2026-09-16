package com.kanavoogle.skills.assessment;

import java.time.Instant;
import java.util.*;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("questions")
public class Question {
    @Id
    private String id;
    private String skillId, subSkillId, context, prompt, correctAnswer, explanation, source;
    private Complexity complexity;
    private int ageMin = 13, ageMax = 19, yearMin = 7, yearMax = 12;
    private QuestionType type;
    private List<String> options = new ArrayList<>();
    private boolean active = true;
    private Instant createdAt;

    public String getId() {
        return id;
    }

    public void setId(String v) {
        id = v;
    }

    public String getSkillId() {
        return skillId;
    }

    public void setSkillId(String v) {
        skillId = v;
    }

    public String getSubSkillId() {
        return subSkillId;
    }

    public void setSubSkillId(String v) {
        subSkillId = v;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String v) {
        context = v;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String v) {
        prompt = v;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String v) {
        correctAnswer = v;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String v) {
        explanation = v;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String v) {
        source = v;
    }

    public Complexity getComplexity() {
        return complexity;
    }

    public void setComplexity(Complexity v) {
        complexity = v;
    }

    public int getAgeMin() {
        return ageMin;
    }

    public void setAgeMin(int v) {
        ageMin = v;
    }

    public int getAgeMax() {
        return ageMax;
    }

    public void setAgeMax(int v) {
        ageMax = v;
    }

    public int getYearMin() {
        return yearMin;
    }

    public void setYearMin(int v) {
        yearMin = v;
    }

    public int getYearMax() {
        return yearMax;
    }

    public void setYearMax(int v) {
        yearMax = v;
    }

    public QuestionType getType() {
        return type;
    }

    public void setType(QuestionType v) {
        type = v;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> v) {
        options = v;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean v) {
        active = v;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant v) {
        createdAt = v;
    }
}
