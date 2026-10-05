package com.kanavoogle.skills.wallet;

import com.kanavoogle.skills.assessment.*;
import com.kanavoogle.skills.security.SecurityUtils;

import java.util.*;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/my-vault")
@PreAuthorize("hasRole('STUDENT')")
public class WalletController {
    private final AssessmentAttemptRepository attempts;
    private final CredentialProofService proofs;

    public WalletController(AssessmentAttemptRepository a, CredentialProofService p) {
        attempts = a;
        proofs = p;
    }

    public record SkillItem(String skillId, String skillName, double evidenceScore, int completedAssessments,
                            String coinAllocationStatus, String proofType, String proofValue) {
    }

    @GetMapping("/me")
    public Map<String, Object> me() {
        String id = SecurityUtils.current().userId();
        Map<String, List<AssessmentAttempt>> g = new LinkedHashMap<>();
        for (var a : attempts.findByStudentIdAndStatus(id, "COMPLETED"))
            g.computeIfAbsent(a.getSkillId(), k -> new ArrayList<>()).add(a);
        List<SkillItem> items = new ArrayList<>();
        for (var list : g.values()) {
            var first = list.get(0);
            double avg = list.stream().map(AssessmentAttempt::getWeightedPercent).filter(Objects::nonNull).mapToDouble(Double::doubleValue).average().orElse(0);
            var pr = proofs.create(id, first.getSkillId(), avg);
            items.add(new SkillItem(first.getSkillId(), first.getSkillName(), Math.round(avg * 10) / 10.0, list.size(), "PENDING_STAKEHOLDER_RULES", pr.proofType(), pr.proofValue()));
        }
        return Map.of("skills", items);
    }
}
