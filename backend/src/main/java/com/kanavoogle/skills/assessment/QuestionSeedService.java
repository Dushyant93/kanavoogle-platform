package com.kanavoogle.skills.assessment;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;

@Service
public class QuestionSeedService {

    private final QuestionRepository questionRepository;
    private final ObjectMapper objectMapper;

    public QuestionSeedService(
            QuestionRepository questionRepository,
            ObjectMapper objectMapper) {
        this.questionRepository = questionRepository;
        this.objectMapper = objectMapper;
    }

    public SeedResult seedQuestions() throws IOException {
        Resource resource =
                new ClassPathResource("seed/questions.json");

        List<Question> questions;

        try (InputStream inputStream = resource.getInputStream()) {
            questions = objectMapper.readValue(
                    inputStream,
                    new TypeReference<List<Question>>() {}
            );
        }

        int inserted = 0;
        int updated = 0;

        for (Question question : questions) {
            Optional<Question> existing =
                    questionRepository.findById(question.getId());

            if (existing.isPresent()) {
                updated++;
            } else {
                inserted++;
            }

            questionRepository.save(question);
        }

        return new SeedResult(
                questions.size(),
                inserted,
                updated
        );
    }

    public record SeedResult(
            int total,
            int inserted,
            int updated
    ) {}
}