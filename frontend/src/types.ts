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
