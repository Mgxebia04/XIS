// AIModified:2026-01-11T16:22:15Z
export type UserRole = 'HR' | 'PANEL' | 'ADMIN'
export type BackendRole = 'HR Manager' | 'Interviewer' | 'Admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  interviewerProfileId?: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface BackendLoginResponse {
  userId: number
  token: string
  email: string
  role: BackendRole
  interviewerProfileId?: number
}

export interface AuthResponse {
  user: User
  token: string
}

// Panel Dashboard Types
export type SkillType = 'PRIMARY' | 'SECONDARY'

export interface Skill {
  id: number
  name: string
  type?: SkillType // Optional, used for display purposes
}

export interface AvailabilitySlot {
  id: number
  date: string // ISO date string
  startTime: string // HH:mm format (from TimeSpan)
  endTime: string // HH:mm format (from TimeSpan)
  isAvailable?: boolean
}

export interface Interview {
  id: number
  interviewerProfileId: number
  intervieweeId: number
  interviewTypeId: number
  scheduledDate: string // ISO date string
  startTime: string // HH:mm format (from TimeSpan)
  endTime: string // HH:mm format (from TimeSpan)
  status: string
  candidateName?: string // From Interviewee
  candidateEmail?: string // From Interviewee
  interviewType?: string // From InterviewType
  skills?: string[] // Skill names from InterviewRequirements
  hrName?: string | null // HR user who scheduled the interview
  hrEmail?: string | null // HR user email who scheduled the interview
}

// HR Dashboard Types
export type InterviewLevel = 'L1' | 'L2' | 'L3'

export interface InterviewType {
  id: number
  name: string
  description?: string
}

export interface OpenPosition {
  id: number
  title: string
  description?: string
  department?: string
  isActive: boolean
}

export interface Interviewee {
  id: number
  name: string
  email: string
  primarySkill?: string
  positionId?: number
}

export interface AvailableTimeSlot {
  date: string // ISO date string
  startTime: string // HH:mm format
  endTime: string // HH:mm format
}

export interface MatchedPanel {
  interviewerProfileId: number
  name: string
  profilePictureUrl?: string
  level?: string
  skills: string[] // Skill names
  availableTimeSlots: AvailableTimeSlot[] // Time slots with date and time
  matchPercentage?: number // Calculated on frontend
  matchedSkills?: string[] // Calculated on frontend
}

export interface ScheduledInterview {
  id: number
  candidateName: string
  candidateEmail: string
  panelName: string
  panelEmail?: string
  level: string
  date: string // ISO date string
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  skills: string[] // Skill names
  status: string
}

export interface InterviewScheduleDto {
  interviewerProfileId: number
  intervieweeId: number
  interviewTypeId: number
  scheduledDate: string
  startTime: string
  endTime: string
  primarySkillIds: number[]
  secondarySkillIds: number[]
  createdByUserId?: number // HR user who scheduled the interview
}
