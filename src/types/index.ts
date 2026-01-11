// AIModified:2026-01-11T06:08:23Z
export type UserRole = 'HR' | 'PANEL'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}

// Panel Dashboard Types
export type SkillType = 'PRIMARY' | 'SECONDARY'

export interface Skill {
  id: string
  name: string
  type: SkillType
}

export interface AvailabilitySlot {
  id: string
  date: string // ISO date string
  startTime: string // HH:mm format
  endTime: string // HH:mm format
}

export interface Interview {
  id: string
  candidateName: string
  candidateEmail: string
  date: string // ISO date string
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  skills: string[] // Skill names
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  hrName?: string // HR who scheduled the interview
  hrEmail?: string // HR email
}

// HR Dashboard Types
export type InterviewLevel = 'L1' | 'L2'

export interface MatchedPanel {
  id: string
  name: string
  email: string
  matchPercentage: number // 0-100
  matchedSkills: string[] // Skill names that match
  panelSkills: Skill[] // All skills of the panel member
  availabilitySlots: AvailabilitySlot[] // Available time slots
}

export interface ScheduledInterview {
  id: string
  candidateName: string
  candidateEmail: string
  panelName: string
  panelEmail: string
  level: InterviewLevel
  date: string // ISO date string
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  skills: string[] // Skill names
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  hrName?: string // HR who scheduled the interview
  hrEmail?: string // HR email
}
