package com.kanavoogle.skills.llm;

import com.kanavoogle.skills.assessment.Complexity;

import java.util.List;

public interface LlmQuestionClient {
    boolean enabled();

    List<GeneratedQuestion> generate(Request r);

    record Request(int age, int yearLevel, String skillName, String subSkillName, String context, Complexity complexity,
                   int count) {
    }

    record GeneratedQuestion(String type, String prompt, List<String> options, String correctAnswer,
                             String explanation) {
    }
}
