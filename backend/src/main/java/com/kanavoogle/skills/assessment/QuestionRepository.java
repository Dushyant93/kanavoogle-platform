package com.kanavoogle.skills.assessment;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface QuestionRepository extends MongoRepository<Question, String> {
    List<Question> findBySkillIdAndSubSkillIdAndComplexityAndActiveTrue(String skillId, String subSkillId, Complexity complexity);
}
