export type Role = 'STUDENT' | 'SCHOOL' | 'EMPLOYER';
export type User = {
    id: string,
    email: string,
    displayName: string,
    role: Role,
    verificationStatus: string,
    studentProfile?: {
        age: number,
        yearLevel: number,
        schoolName: string,
        region: string,
        skillSharingConsent: boolean
    },
    schoolProfile?: { schoolName: string, location: string, contactPerson: string, officialEmail: string },
    employerProfile?: { businessName: string, region: string, contactPerson: string, organisationRole: string }
};
export type Skill = {
    id: string,
    name: string,
    code: string,
    active: boolean,
    subSkills: { id: string, name: string, active: boolean }[]
};
export type Assessment = {
    id: string,
    skillId: string,
    skillName: string,
    subSkillId: string,
    subSkillName: string,
    context: string,
    complexity: 'FOUNDATION' | 'INTERMEDIATE' | 'ADVANCED',
    status: string,
    questions: { questionId: string, type: string, prompt: string, options: string[] }[],
    rawPercent?: number,
    weightedPercent?: number,
    coinAllocationStatus: string,
    createdAt: string,
    completedAt?: string
};
export type Complexity = 'FOUNDATION' | 'INTERMEDIATE' | 'ADVANCED';
export type WalletAttempt = {
    id: string,
    subSkillName: string,
    context: string,
    complexity: Complexity,
    rawPercent?: number,
    weightedPercent?: number,
    completedAt?: string
};
export type WalletSkill = {
    skillId: string,
    skillName: string,
    evidenceScore: number,
    completedAssessments: number,
    coinAllocationStatus: string,
    proofType: string,
    proofValue: string,
    ledgerVerified: boolean,
    bestScore: number,
    latestScore: number,
    firstAssessedAt?: string,
    lastAssessedAt?: string,
    complexitiesAttempted: Complexity[],
    subSkills: { subSkillId: string, subSkillName: string, completedAssessments: number, averageScore: number }[],
    attempts: WalletAttempt[]
};
export type Wallet = {
    student: { displayName: string, yearLevel?: number, schoolName?: string, skillSharingConsent: boolean },
    summary: {
        skillsEvidenced: number,
        completedAssessments: number,
        averageEvidenceScore: number,
        ledgerVerifiedSkills: number,
        lastActivityAt?: string,
        coinAllocationStatus: string
    },
    skills: WalletSkill[]
};
