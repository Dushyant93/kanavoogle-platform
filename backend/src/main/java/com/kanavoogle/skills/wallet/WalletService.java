package com.kanavoogle.skills.wallet;

import com.kanavoogle.skills.assessment.AssessmentAttempt;
import com.kanavoogle.skills.assessment.AssessmentAttemptRepository;
import com.kanavoogle.skills.assessment.Complexity;
import com.kanavoogle.skills.user.UserAccount;
import com.kanavoogle.skills.user.UserRepository;

import java.time.Instant;
import java.util.*;

import org.springframework.stereotype.Service;

/**
 * Builds the Digital Skills Wallet view for a student from their completed assessment attempts.
 * Everything the wallet screen shows is derived here, so the frontend holds no hard-coded wallet data.
 */
@Service
public class WalletService {
    /** Proof type written by the Hyperledger Fabric adapter when the ledger accepted the credential. */
    static final String LEDGER_PROOF_TYPE = "HYPERLEDGER_FABRIC";

    private final AssessmentAttemptRepository attempts;
    private final UserRepository users;
    private final CredentialProofService proofs;

    public WalletService(AssessmentAttemptRepository attempts, UserRepository users, CredentialProofService proofs) {
        this.attempts = attempts;
        this.users = users;
        this.proofs = proofs;
    }

    public record StudentInfo(String displayName, Integer yearLevel, String schoolName, boolean skillSharingConsent) {
    }

    public record Summary(int skillsEvidenced, int completedAssessments, double averageEvidenceScore,
                          int ledgerVerifiedSkills, Instant lastActivityAt, String coinAllocationStatus) {
    }

    public record SubSkillItem(String subSkillId, String subSkillName, int completedAssessments, double averageScore) {
    }

    public record AttemptItem(String id, String subSkillName, String context, Complexity complexity,
                              Double rawPercent, Double weightedPercent, Instant completedAt) {
    }

    /**
     * The first seven fields keep the original /api/wallet/me contract unchanged.
     */
    public record SkillItem(String skillId, String skillName, double evidenceScore, int completedAssessments,
                            String coinAllocationStatus, String proofType, String proofValue,
                            boolean ledgerVerified, double bestScore, double latestScore,
                            Instant firstAssessedAt, Instant lastAssessedAt, List<Complexity> complexitiesAttempted,
                            List<SubSkillItem> subSkills, List<AttemptItem> attempts) {
    }

    public record Wallet(StudentInfo student, Summary summary, List<SkillItem> skills) {
    }

    public Wallet forStudent(String studentId) {
        UserAccount user = users.findById(studentId).orElseThrow(() -> new IllegalStateException("Student not found"));
        var profile = user.getStudentProfile();
        StudentInfo student = new StudentInfo(user.getDisplayName(),
                profile == null ? null : profile.getYearLevel(),
                profile == null ? null : profile.getSchoolName(),
                profile != null && profile.isSkillSharingConsent());

        Map<String, List<AssessmentAttempt>> bySkill = new LinkedHashMap<>();
        for (var a : attempts.findByStudentIdAndStatus(studentId, "COMPLETED"))
            bySkill.computeIfAbsent(a.getSkillId(), k -> new ArrayList<>()).add(a);

        List<SkillItem> skills = new ArrayList<>();
        for (var list : bySkill.values()) skills.add(skillItem(studentId, list));
        skills.sort(Comparator.comparing(SkillItem::lastAssessedAt, Comparator.nullsLast(Comparator.reverseOrder())));

        int completed = skills.stream().mapToInt(SkillItem::completedAssessments).sum();
        double overall = round(skills.stream().mapToDouble(SkillItem::evidenceScore).average().orElse(0));
        int verified = (int) skills.stream().filter(SkillItem::ledgerVerified).count();
        Instant last = skills.stream().map(SkillItem::lastAssessedAt).filter(Objects::nonNull).max(Comparator.naturalOrder()).orElse(null);
        String coinStatus = skills.stream().map(SkillItem::coinAllocationStatus).filter(Objects::nonNull).findFirst().orElse("PENDING_STAKEHOLDER_RULES");

        return new Wallet(student, new Summary(skills.size(), completed, overall, verified, last, coinStatus), skills);
    }

    private SkillItem skillItem(String studentId, List<AssessmentAttempt> list) {
        list.sort(Comparator.comparing(WalletService::finishedAt, Comparator.nullsFirst(Comparator.naturalOrder())));
        AssessmentAttempt first = list.get(0), latest = list.get(list.size() - 1);

        double avg = scores(list).average().orElse(0);
        double best = scores(list).max().orElse(0);
        double latestScore = latest.getWeightedPercent() == null ? 0 : latest.getWeightedPercent();

        // Same proof input as before (student, skill, average score) so existing proofs stay comparable.
        var proof = proofs.create(studentId, first.getSkillId(), avg);

        Map<String, List<AssessmentAttempt>> bySub = new LinkedHashMap<>();
        for (var a : list) bySub.computeIfAbsent(a.getSubSkillId(), k -> new ArrayList<>()).add(a);
        List<SubSkillItem> subs = bySub.values().stream()
                .map(s -> new SubSkillItem(s.get(0).getSubSkillId(), s.get(0).getSubSkillName(), s.size(), round(scores(s).average().orElse(0))))
                .sorted(Comparator.comparing(SubSkillItem::averageScore).reversed())
                .toList();

        List<Complexity> complexities = list.stream().map(AssessmentAttempt::getComplexity).filter(Objects::nonNull).distinct().sorted().toList();

        List<AttemptItem> history = new ArrayList<>();
        for (int i = list.size() - 1; i >= 0; i--) {
            var a = list.get(i);
            history.add(new AttemptItem(a.getId(), a.getSubSkillName(), a.getContext(), a.getComplexity(), a.getRawPercent(), a.getWeightedPercent(), finishedAt(a)));
        }

        return new SkillItem(first.getSkillId(), first.getSkillName(), round(avg), list.size(),
                latest.getCoinAllocationStatus(), proof.proofType(), proof.proofValue(),
                LEDGER_PROOF_TYPE.equals(proof.proofType()), round(best), round(latestScore),
                finishedAt(first), finishedAt(latest), complexities, subs, history);
    }

    private static Instant finishedAt(AssessmentAttempt a) {
        return a.getCompletedAt() != null ? a.getCompletedAt() : a.getCreatedAt();
    }

    private static java.util.stream.DoubleStream scores(List<AssessmentAttempt> list) {
        return list.stream().map(AssessmentAttempt::getWeightedPercent).filter(Objects::nonNull).mapToDouble(Double::doubleValue);
    }

    private static double round(double d) {
        return Math.round(d * 10) / 10.0;
    }
}
