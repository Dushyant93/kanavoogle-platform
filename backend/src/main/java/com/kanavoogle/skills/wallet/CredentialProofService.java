package com.kanavoogle.skills.wallet;

public interface CredentialProofService {
    Proof create(String studentId, String skillId, double score);

    record Proof(String proofType, String proofValue) {
    }
}
