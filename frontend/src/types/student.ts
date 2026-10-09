export type StudentProfile = {
  age: number
  yearLevel: number
  schoolName: string
  region: string
  skillSharingConsent: boolean
  bio?: string | null
  degree?: string | null
  cohort?: string | null
  expectedGraduation?: string | null
  publicProfile?: boolean
  photo?: string | null
}

export type StudentRegistration = {
  displayName: string
  email: string
  password: string
  age: number
  yearLevel: number
  schoolName: string
  region: string
  skillSharingConsent: boolean
}
