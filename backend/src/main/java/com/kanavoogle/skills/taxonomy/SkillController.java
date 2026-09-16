package com.kanavoogle.skills.taxonomy;

import java.util.*;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/skills")
public class SkillController {
    private final SkillRepository repo;

    public SkillController(SkillRepository r) {
        repo = r;
    }

    @GetMapping
    @Cacheable("skills")
    public List<Skill> list() {
        return repo.findByActiveTrueOrderByNameAsc();
    }

    @GetMapping("/{id}")
    @Cacheable(value = "skillById", key = "#id")
    public Skill get(@PathVariable String id) {
        return repo.findById(id).filter(Skill::isActive).orElseThrow(() -> new IllegalArgumentException("Unknown skill"));
    }
}
