package com.kanavoogle.skills;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching
@SpringBootApplication
public class SkillsPlatformApplication {
    public static void main(String[] args) {
        SpringApplication.run(SkillsPlatformApplication.class, args);
    }
}
