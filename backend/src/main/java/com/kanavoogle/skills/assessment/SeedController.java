package com.kanavoogle.skills.assessment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/admin/seed")
public class SeedController {

    private static final Logger log = LoggerFactory.getLogger(SeedController.class);
    private final QuestionSeedService questionSeedService;

    @Value("${app.seed.key}")
    private String seedKey;

    public SeedController(QuestionSeedService questionSeedService) {
        this.questionSeedService = questionSeedService;
    }

    @PostMapping("/questions")
    public ResponseEntity<?> seedQuestions(
            @RequestHeader("X-SEED-KEY") String providedKey)
            throws IOException {

//        if (!seedKey.equals(providedKey)) {
//            return ResponseEntity.status(HttpStatus.FORBIDDEN)
//                    .body("Invalid seed key");
//        }
        log.info("sedd received : " + providedKey + ", actual seed: " + seedKey);

        return ResponseEntity.ok(
                questionSeedService.seedQuestions()
        );
    }
}