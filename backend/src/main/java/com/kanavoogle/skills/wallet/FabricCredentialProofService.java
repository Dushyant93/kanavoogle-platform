package com.kanavoogle.skills.wallet;

import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

import org.hyperledger.fabric.client.Contract;
import org.hyperledger.fabric.client.Gateway;
import org.hyperledger.fabric.client.identity.Identities;
import org.hyperledger.fabric.client.identity.Signers;
import org.hyperledger.fabric.client.identity.X509Identity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import io.grpc.Grpc;
import io.grpc.ManagedChannel;
import io.grpc.TlsChannelCredentials;
import jakarta.annotation.PreDestroy;

/**
 * Hyperledger Fabric adapter for credential proofs (Phase 2 item 5).
 *
 * Only a SHA-256 proof hash and a pseudonymous student reference are written to the
 * ledger. The raw student id, answers and score stay in MongoDB (privacy by design).
 * Enabled with app.fabric.enabled=true; otherwise LocalHashCredentialProofService is used.
 */
@Service
@ConditionalOnProperty(name = "app.fabric.enabled", havingValue = "true")
public class FabricCredentialProofService implements CredentialProofService {

    private static final Logger log = LoggerFactory.getLogger(FabricCredentialProofService.class);

    private final String peerEndpoint;
    private final String overrideAuthority;
    private final String mspId;
    private final String channelName;
    private final String chaincodeName;
    private final Path tlsCertPath;
    private final Path certDir;
    private final Path keyDir;

    private ManagedChannel grpcChannel;
    private Gateway gateway;
    private Contract contract;

    public FabricCredentialProofService(
            @Value("${app.fabric.peer-endpoint}") String peerEndpoint,
            @Value("${app.fabric.override-authority}") String overrideAuthority,
            @Value("${app.fabric.msp-id}") String mspId,
            @Value("${app.fabric.channel}") String channelName,
            @Value("${app.fabric.chaincode}") String chaincodeName,
            @Value("${app.fabric.tls-cert-path}") String tlsCertPath,
            @Value("${app.fabric.cert-dir}") String certDir,
            @Value("${app.fabric.key-dir}") String keyDir) {
        this.peerEndpoint = peerEndpoint;
        this.overrideAuthority = overrideAuthority;
        this.mspId = mspId;
        this.channelName = channelName;
        this.chaincodeName = chaincodeName;
        this.tlsCertPath = Paths.get(tlsCertPath);
        this.certDir = Paths.get(certDir);
        this.keyDir = Paths.get(keyDir);
    }

    @Override
    public Proof create(String studentId, String skillId, double score) {
        // Same hash as the local service, so results are comparable.
        String proofHash = sha256(studentId + "|" + skillId + "|" + score);
        // Pseudonymous reference: the real student id never goes on-chain.
        String studentRef = sha256("student|" + studentId);
        // Deterministic id: re-opening the wallet does not create duplicates.
        String credentialId = proofHash;

        try {
            Contract c = contract();
            if (!exists(c, credentialId)) {
                try {
                    c.submitTransaction("IssueCredential",
                            credentialId, studentRef, skillId, proofHash, Instant.now().toString());
                    log.info("Issued credential {} for skill {} on Fabric", credentialId, skillId);
                } catch (Exception | LinkageError e) {
                    // Another request may have issued it at the same moment.
                    if (!exists(c, credentialId)) {
                        throw e;
                    }
                }
            }
            return new Proof("HYPERLEDGER_FABRIC", proofHash);
        } catch (Exception | LinkageError e) {
            // Keep the wallet usable if the ledger is down, but label the proof honestly.
            log.warn("Fabric unavailable, returning local proof only: {}", e.getMessage());
            return new Proof("LOCAL_SHA256_FALLBACK", proofHash);
        }
    }

    private boolean exists(Contract c, String credentialId) throws Exception {
        byte[] result = c.evaluateTransaction("CredentialExists", credentialId);
        return Boolean.parseBoolean(new String(result, StandardCharsets.UTF_8).trim());
    }

    private synchronized Contract contract() throws Exception {
        if (contract != null) {
            return contract;
        }
        grpcChannel = Grpc.newChannelBuilder(peerEndpoint,
                        TlsChannelCredentials.newBuilder().trustManager(tlsCertPath.toFile()).build())
                .overrideAuthority(overrideAuthority)
                .build();

        X509Identity identity;
        try (Reader r = Files.newBufferedReader(firstFile(certDir))) {
            identity = new X509Identity(mspId, Identities.readX509Certificate(r));
        }
        java.security.PrivateKey privateKey;
        try (Reader r = Files.newBufferedReader(firstFile(keyDir))) {
            privateKey = Identities.readPrivateKey(r);
        }

        gateway = Gateway.newInstance()
                .identity(identity)
                .signer(Signers.newPrivateKeySigner(privateKey))
                .connection(grpcChannel)
                .evaluateOptions(o -> o.withDeadlineAfter(5, TimeUnit.SECONDS))
                .endorseOptions(o -> o.withDeadlineAfter(15, TimeUnit.SECONDS))
                .submitOptions(o -> o.withDeadlineAfter(5, TimeUnit.SECONDS))
                .commitStatusOptions(o -> o.withDeadlineAfter(1, TimeUnit.MINUTES))
                .connect();

        contract = gateway.getNetwork(channelName).getContract(chaincodeName);
        log.info("Connected to Fabric peer {} (channel {}, chaincode {})", peerEndpoint, channelName, chaincodeName);
        return contract;
    }

    private static Path firstFile(Path dir) throws IOException {
        try (Stream<Path> files = Files.list(dir)) {
            return files.filter(Files::isRegularFile).findFirst()
                    .orElseThrow(() -> new IOException("No file found in " + dir));
        }
    }

    private static String sha256(String input) {
        try {
            byte[] d = MessageDigest.getInstance("SHA-256").digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(d);
        } catch (Exception | LinkageError e) {
            throw new IllegalStateException(e);
        }
    }

    @PreDestroy
    public synchronized void close() {
        if (gateway != null) {
            gateway.close();
        }
        if (grpcChannel != null) {
            grpcChannel.shutdownNow();
        }
    }
}
