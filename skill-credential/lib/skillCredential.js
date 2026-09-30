'use strict';

const { Contract } = require('fabric-contract-api');

class SkillCredential extends Contract {

    // Write a credential proof to the ledger.
    // Only the hash goes on-chain — raw responses stay in MongoDB.
    async IssueCredential(ctx, credentialId, studentRef, skillId, proofHash, issuedAt) {
        const exists = await this.CredentialExists(ctx, credentialId);
        if (exists) {
            throw new Error(`Credential ${credentialId} already exists`);
        }

        const credential = {
            docType: 'skillCredential',
            credentialId,
            studentRef,
            skillId,
            proofHash,
            issuedAt,
            issuer: ctx.clientIdentity.getMSPID(),
        };

        await ctx.stub.putState(
            credentialId,
            Buffer.from(JSON.stringify(credential))
        );
        return JSON.stringify(credential);
    }

    // Read a credential back.
    async ReadCredential(ctx, credentialId) {
        const data = await ctx.stub.getState(credentialId);
        if (!data || data.length === 0) {
            throw new Error(`Credential ${credentialId} does not exist`);
        }
        return data.toString();
    }

    // Verify a submitted hash matches what was recorded.
    async VerifyCredential(ctx, credentialId, proofHash) {
        const data = await ctx.stub.getState(credentialId);
        if (!data || data.length === 0) {
            return JSON.stringify({ valid: false, reason: 'NOT_FOUND' });
        }
        const credential = JSON.parse(data.toString());
        const valid = credential.proofHash === proofHash;
        return JSON.stringify({
            valid,
            reason: valid ? 'MATCH' : 'HASH_MISMATCH',
            skillId: credential.skillId,
            issuedAt: credential.issuedAt,
        });
    }

    async CredentialExists(ctx, credentialId) {
        const data = await ctx.stub.getState(credentialId);
        return data && data.length > 0;
    }
}

module.exports = SkillCredential;

