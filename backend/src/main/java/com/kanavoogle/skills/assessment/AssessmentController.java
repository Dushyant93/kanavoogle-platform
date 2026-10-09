package com.kanavoogle.skills.assessment;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assessments")
@PreAuthorize("hasRole('STUDENT')")
public class AssessmentController {
    private final AssessmentService s;

    public AssessmentController(AssessmentService s) {
        this.s = s;
    }

    @PostMapping
    public AssessmentService.View create(@RequestBody AssessmentService.Create r) {
        return s.create(r);
    }

    @GetMapping("/{id}")
    public AssessmentService.View get(@PathVariable String id) {
        return s.get(id);
    }

    @GetMapping("/recent")
    public List<AssessmentService.View> recent() {
        return s.recent();
    }

    @PostMapping("/{id}/submit")
    public AssessmentService.Result submit(@PathVariable String id, @RequestBody AssessmentService.Submit r) {
        return s.submit(id, r);
    }

    @GetMapping("/{id}/result")
    public AssessmentService.Result result(@PathVariable String id) {
        return s.result(id);
    }
}
