import type { StudentProfile } from './student'

export type Role = 'STUDENT' | 'SCHOOL' | 'EMPLOYER'

export type VerificationStatus = 'NOT_REQUIRED' | 'PENDING' | 'VERIFIED' | 'REJECTED'

export type SchoolProfile = {
  schoolName: string
  location: string
  contactPerson: string
  officialEmail: string
}

export type EmployerProfile = {
  businessName: string
  region: string
  contactPerson: string
  organisationRole: string
}

export type User = {
  id: string
  email: string
  displayName: string
  role: Role
  verificationStatus: VerificationStatus
  studentProfile?: StudentProfile
  schoolProfile?: SchoolProfile
  employerProfile?: EmployerProfile
  createdAt?: string
}

export type LoginRequest = {
  email: string
  password: string
}
