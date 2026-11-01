export type WalletSkill = {
  skillId: string
  skillName: string
  evidenceScore: number
  completedAssessments: number
  coinAllocationStatus: string
  proofType: string
  proofValue: string
}

export type Wallet = {
  skills: WalletSkill[]
}
