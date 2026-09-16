package com.kanavoogle.skills.taxonomy;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface SkillRepository extends MongoRepository<Skill, String> {
    List<Skill> findByActiveTrueOrderByNameAsc();
}
