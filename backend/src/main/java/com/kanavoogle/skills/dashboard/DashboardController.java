package com.kanavoogle.skills.dashboard;

import com.kanavoogle.skills.assessment.AssessmentService;
import com.kanavoogle.skills.security.SecurityUtils;
import com.kanavoogle.skills.user.UserAccount;
import com.kanavoogle.skills.user.UserRepository;

import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final UserRepository users;
    private final AssessmentService assessmentService;

    public DashboardController(UserRepository users, AssessmentService assessmentService) {
        this.users = users;
        this.assessmentService = assessmentService;
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public Map<String, Object> student() {
        UserAccount user = safeCurrentUser();
        // Use AssessmentService views rather than raw AssessmentAttempt documents.
        // Raw attempts contain correctAnswer/explanation snapshots and must never be
        // returned to the browser.
        return Map.of(
                "user", user,
                "recentAssessments", assessmentService.recent()
        );
    }

    @GetMapping("/school")
    @PreAuthorize("hasRole('SCHOOL')")
    public Map<String, Object> school() {
        return Map.of(
                "user", safeCurrentUser(),
                "message", "School cohort dashboards, assessment assignments and visual analytics are planned for Phase 2."
        );
    }

    @GetMapping("/employer")
    @PreAuthorize("hasRole('EMPLOYER')")
    public Map<String, Object> employer() {
        return Map.of(
                "user", safeCurrentUser(),
                "message", "Consent-aware skill discovery, filters, visual insights and credential verification are planned for Phase 2."
        );
    }

    private UserAccount safeCurrentUser() {
        UserAccount user = users.findById(SecurityUtils.current().userId()).orElseThrow();
        user.setPasswordHash(null);
        return user;
    }
}
