package com.kanavoogle.skills.dashboard;

import com.kanavoogle.skills.assessment.*;
import com.kanavoogle.skills.security.SecurityUtils;
import com.kanavoogle.skills.user.*;

import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final UserRepository users;
    private final AssessmentAttemptRepository attempts;

    public DashboardController(UserRepository u, AssessmentAttemptRepository a) {
        users = u;
        attempts = a;
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public Map<String, Object> student() {
        String id = SecurityUtils.current().userId();
        UserAccount u = users.findById(id).orElseThrow();
        u.setPasswordHash(null);
        return Map.of("user", u, "recentAssessments", attempts.findTop10ByStudentIdOrderByCreatedAtDesc(id));
    }

    @GetMapping("/school")
    @PreAuthorize("hasRole('SCHOOL')")
    public Map<String, Object> school() {
        UserAccount u = users.findById(SecurityUtils.current().userId()).orElseThrow();
        u.setPasswordHash(null);
        return Map.of("user", u, "message", "School cohort dashboards, assessment assignments and visual analytics are planned for Phase 2.");
    }

    @GetMapping("/employer")
    @PreAuthorize("hasRole('EMPLOYER')")
    public Map<String, Object> employer() {
        UserAccount u = users.findById(SecurityUtils.current().userId()).orElseThrow();
        u.setPasswordHash(null);
        return Map.of("user", u, "message", "Consent-aware skill discovery, filters, visual insights and credential verification are planned for Phase 2.");
    }
}
