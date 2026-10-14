package com.kanavoogle.skills.wallet;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(name = "app.fabric.enabled", havingValue = "false", matchIfMissing = true)
public class LocalHashCredentialProofService implements CredentialProofService {
    public Proof create(String studentId, String skillId, double score) {
        try {
            byte[] d = MessageDigest.getInstance("SHA-256").digest((studentId + "|" + skillId + "|" + score).getBytes(StandardCharsets.UTF_8));
            return new Proof("LOCAL_SHA256_POC", HexFormat.of().formatHex(d));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
