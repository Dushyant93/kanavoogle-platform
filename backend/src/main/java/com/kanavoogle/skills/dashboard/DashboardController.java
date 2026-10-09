package com.kanavoogle.skills.dashboard;

import com.kanavoogle.skills.assessment.*;
import com.kanavoogle.skills.security.SecurityUtils;
import com.kanavoogle.skills.user.*;

import java.util.*;

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
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("user", u);
        body.put("recentAssessments", attempts.findTop10ByStudentIdOrderByCreatedAtDesc(id));
        Map<String, Object> standing = standing(id);
        if (standing != null) body.put("standing", standing);
        return body;
    }

    private Map<String, Object> standing(String studentId) {
        Map<String, double[]> totals = new HashMap<>();
        for (var attempt : attempts.findByStatus("COMPLETED")) {
            if (attempt.getWeightedPercent() == null || attempt.getStudentId() == null) continue;
            double[] row = totals.computeIfAbsent(attempt.getStudentId(), key -> new double[2]);
            row[0] += attempt.getWeightedPercent();
            row[1] += 1;
        }
        if (!totals.containsKey(studentId)) return null;
        List<Map.Entry<String, Double>> scores = new ArrayList<>();
        for (var entry : totals.entrySet()) {
            double[] row = entry.getValue();
            scores.add(Map.entry(entry.getKey(), row[0] / row[1]));
        }
        scores.sort((left, right) -> Double.compare(right.getValue(), left.getValue()));
        double mine = scores.stream().filter(item -> item.getKey().equals(studentId)).findFirst().orElseThrow().getValue();
        int place = 1;
        for (var score : scores) {
            if (score.getValue() > mine) place++;
        }
        int atOrBelow = (int) scores.stream().filter(score -> score.getValue() <= mine).count();
        int percentile = (int) Math.round(atOrBelow * 100.0 / scores.size());
        Map<String, Object> standing = new LinkedHashMap<>();
        standing.put("place", place);
        standing.put("total", scores.size());
        standing.put("percentile", percentile);
        return standing;
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
