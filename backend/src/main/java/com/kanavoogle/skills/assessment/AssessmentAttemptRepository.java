package com.kanavoogle.skills.assessment;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface AssessmentAttemptRepository extends MongoRepository<AssessmentAttempt, String> {
    List<AssessmentAttempt> findTop10ByStudentIdOrderByCreatedAtDesc(String studentId);

    List<AssessmentAttempt> findByStudentIdAndStatus(String studentId, String status);
}
