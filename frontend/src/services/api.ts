// AIModified:2026-01-11T17:32:40Z
import axios, { AxiosInstance, AxiosError } from 'axios'
import type {
  AuthResponse,
  LoginCredentials,
  BackendLoginResponse,
  Skill,
  AvailabilitySlot,
  Interview,
  MatchedPanel,
  InterviewType,
  Interviewee,
  OpenPosition,
  InterviewScheduleDto,
} from '@/types'

// Backend URL - matches backend launchSettings.json (http://localhost:5268)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5268'

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear token and redirect to login
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Send only email and password - role will be determined by backend from user table
    const response = await this.client.post<BackendLoginResponse>('/api/auth/login', {
      email: credentials.email,
      password: credentials.password,
    })
    const backendResponse = response.data
    
    // Transform backend response to frontend format
    let userRole: 'HR' | 'PANEL' | 'ADMIN'
    if (backendResponse.role === 'HR Manager') {
      userRole = 'HR'
    } else if (backendResponse.role === 'Admin') {
      userRole = 'ADMIN'
    } else {
      userRole = 'PANEL'
    }
    
    // Get user name based on role
    let userName = backendResponse.email.split('@')[0] || 'User'
    if (backendResponse.role === 'HR Manager') {
      userName = 'HR Manager'
    } else if (backendResponse.role === 'Admin') {
      userName = 'Admin'
    } else if (backendResponse.role === 'Interviewer' && backendResponse.interviewerProfileId) {
      try {
        const profile = await this.getInterviewerProfile(backendResponse.interviewerProfileId)
        userName = profile.name || backendResponse.email.split('@')[0] || 'Interviewer'
      } catch (error) {
        // Fallback to email username if profile fetch fails
        userName = backendResponse.email.split('@')[0] || 'Interviewer'
      }
    }
    
    return {
      user: {
        id: backendResponse.userId.toString(), // Use userId from backend
        email: backendResponse.email,
        name: userName,
        role: userRole,
        interviewerProfileId: backendResponse.interviewerProfileId,
      },
      token: backendResponse.token,
    }
  }

  async logout(): Promise<void> {
    // Backend doesn't have logout endpoint, just clear local storage
    // No API call needed
  }

  // Skills API
  async getSkills(): Promise<Skill[]> {
    const response = await this.client.get<Skill[]>('/api/skills')
    return response.data
  }

  // Interview Types API
  async getInterviewTypes(): Promise<InterviewType[]> {
    const response = await this.client.get<InterviewType[]>('/api/interviewtypes')
    return response.data
  }

  // Positions API
  async getPositions(): Promise<OpenPosition[]> {
    const response = await this.client.get<OpenPosition[]>('/api/positions')
    return response.data
  }

  // Interviewees API
  async getInterviewees(positionId?: number): Promise<Interviewee[]> {
    const params = positionId ? { positionId } : {}
    const response = await this.client.get<Interviewee[]>('/api/interviewees', { params })
    return response.data
  }

  async createInterviewee(interviewee: Partial<Interviewee>): Promise<Interviewee> {
    const response = await this.client.post<Interviewee>('/api/interviewees', interviewee)
    return response.data
  }

  // Interviewer Profile API
  async getInterviewerProfile(profileId: number): Promise<any> {
    const response = await this.client.get(`/api/interviewerprofile/${profileId}`)
    return response.data
  }

  async updateInterviewerProfile(profileId: number, profile: any): Promise<void> {
    await this.client.put(`/api/interviewerprofile/${profileId}`, profile)
  }

  // Availability API
  async getAvailability(interviewerId: number): Promise<AvailabilitySlot[]> {
    const response = await this.client.get<AvailabilitySlot[]>(`/api/availability/interviewer/${interviewerId}`)
    // Transform TimeSpan to string format
    return response.data.map(slot => ({
      ...slot,
      date: typeof slot.date === 'string' ? slot.date : new Date(slot.date).toISOString().split('T')[0],
      startTime: this.formatTimeSpan(slot.startTime),
      endTime: this.formatTimeSpan(slot.endTime),
    }))
  }

  async createAvailability(interviewerId: number, slot: {
    date: string
    startTime: string
    endTime: string
  }): Promise<AvailabilitySlot> {
    const response = await this.client.post<AvailabilitySlot>(`/api/availability/interviewer/${interviewerId}`, {
      date: slot.date,
      startTime: this.parseTimeToTimeSpan(slot.startTime),
      endTime: this.parseTimeToTimeSpan(slot.endTime),
    })
    return {
      ...response.data,
      date: typeof response.data.date === 'string' ? response.data.date : new Date(response.data.date).toISOString().split('T')[0],
      startTime: this.formatTimeSpan(response.data.startTime),
      endTime: this.formatTimeSpan(response.data.endTime),
    }
  }

  async deleteAvailability(slotId: number): Promise<void> {
    await this.client.delete(`/api/availability/${slotId}`)
  }

  // Schedule API
  async getInterviewerSchedule(interviewerId: number): Promise<Interview[]> {
    const response = await this.client.get<any[]>(`/api/schedule/interviewer/${interviewerId}`)
    return response.data.map(interview => {
      // Handle scheduledDate - extract date part if it's a full ISO datetime string
      let scheduledDateStr = ''
      if (typeof interview.scheduledDate === 'string') {
        // If it's already in YYYY-MM-DD format, use it
        if (interview.scheduledDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          scheduledDateStr = interview.scheduledDate
        } else {
          // If it's an ISO datetime string, extract just the date part
          scheduledDateStr = interview.scheduledDate.split('T')[0]
        }
      } else {
        scheduledDateStr = new Date(interview.scheduledDate).toISOString().split('T')[0]
      }
      
      // Backend now returns optimized DTO with flat structure including HR details
      // Map hrName and hrEmail - handle both null and empty string cases
      const hrName = interview.hrName && interview.hrName.trim() !== '' ? interview.hrName : null
      const hrEmail = interview.hrEmail && interview.hrEmail.trim() !== '' ? interview.hrEmail : null
      
      return {
        id: interview.id,
        interviewerProfileId: interview.interviewerProfileId,
        intervieweeId: interview.intervieweeId,
        interviewTypeId: interview.interviewTypeId,
        scheduledDate: scheduledDateStr,
        startTime: this.formatTimeSpan(interview.startTime),
        endTime: this.formatTimeSpan(interview.endTime),
        status: interview.status,
        candidateName: interview.candidateName || '',
        candidateEmail: interview.candidateEmail || '',
        interviewType: interview.interviewTypeName || '',
        skills: interview.skills || [],
        hrName: hrName,
        hrEmail: hrEmail,
      }
    })
  }

  async searchAvailableInterviewers(searchParams: {
    primarySkillIds?: number[]
    secondarySkillIds?: number[]
    interviewTypeId?: number
    interviewDate?: string
    positionId?: number
    intervieweeId?: number
  }): Promise<MatchedPanel[]> {
    const response = await this.client.post<any[]>('/api/schedule/search', {
      primarySkillIds: searchParams.primarySkillIds || [],
      secondarySkillIds: searchParams.secondarySkillIds || [],
      interviewTypeId: searchParams.interviewTypeId,
      interviewDate: searchParams.interviewDate ? new Date(searchParams.interviewDate).toISOString() : null,
      positionId: searchParams.positionId,
      intervieweeId: searchParams.intervieweeId,
    })
    return response.data.map(panel => ({
      ...panel,
      availableTimeSlots: panel.availableTimeSlots.map((slot: any) => ({
        date: typeof slot.date === 'string' 
          ? slot.date 
          : new Date(slot.date).toISOString().split('T')[0],
        startTime: this.formatTimeSpan(slot.startTime),
        endTime: this.formatTimeSpan(slot.endTime),
      })),
    }))
  }

  async getAllScheduledInterviews(): Promise<any[]> {
    const response = await this.client.get<any[]>('/api/schedule/all')
    return response.data.map(interview => {
      // Backend returns ScheduledInterviewDto with camelCase properties (via JSON serialization)
      let scheduledDateStr = ''
      if (typeof interview.scheduledDate === 'string') {
        if (interview.scheduledDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          scheduledDateStr = interview.scheduledDate
        } else {
          scheduledDateStr = interview.scheduledDate.split('T')[0]
        }
      } else {
        scheduledDateStr = new Date(interview.scheduledDate).toISOString().split('T')[0]
      }
      
      return {
        id: interview.id,
        candidateName: interview.candidateName || '',
        candidateEmail: interview.candidateEmail || '',
        panelName: interview.panelName || 'Unknown',
        panelEmail: interview.panelEmail || '',
        level: interview.level || '',
        scheduledDate: scheduledDateStr,
        startTime: this.formatTimeSpan(interview.startTime),
        endTime: this.formatTimeSpan(interview.endTime),
        skills: interview.skills || [],
        status: interview.status || 'SCHEDULED',
      }
    })
  }

  async createInterview(schedule: InterviewScheduleDto): Promise<Interview> {
    const response = await this.client.post<Interview>('/api/schedule/create', {
      interviewerProfileId: schedule.interviewerProfileId,
      intervieweeId: schedule.intervieweeId,
      interviewTypeId: schedule.interviewTypeId,
      scheduledDate: schedule.scheduledDate,
      startTime: this.parseTimeToTimeSpan(schedule.startTime),
      endTime: this.parseTimeToTimeSpan(schedule.endTime),
      primarySkillIds: schedule.primarySkillIds || [],
      secondarySkillIds: schedule.secondarySkillIds || [],
      createdByUserId: schedule.createdByUserId,
    })
    return {
      ...response.data,
      scheduledDate: typeof response.data.scheduledDate === 'string' 
        ? response.data.scheduledDate 
        : new Date(response.data.scheduledDate).toISOString().split('T')[0],
      startTime: this.formatTimeSpan(response.data.startTime),
      endTime: this.formatTimeSpan(response.data.endTime),
    }
  }

  async cancelInterview(interviewId: number): Promise<void> {
    try {
      console.log('API: Cancelling interview', interviewId)
      const response = await this.client.put(`/api/schedule/cancel/${interviewId}`)
      console.log('API: Cancel response', response.status, response.statusText)
      // NoContent (204) response is expected, but we handle it gracefully
      return
    } catch (error: any) {
      console.error('API: Cancel interview error', error)
      throw error
    }
  }

  // Helper methods for TimeSpan conversion
  private formatTimeSpan(timeSpan: any): string {
    if (typeof timeSpan === 'string') {
      // Already formatted or in HH:mm format
      if (timeSpan.includes(':')) {
        return timeSpan.length === 5 ? timeSpan : timeSpan.substring(0, 5)
      }
      return timeSpan
    }
    // TimeSpan object from backend (format: "HH:mm:ss" or "HH:mm:ss.fffffff")
    const timeStr = timeSpan.toString()
    return timeStr.substring(0, 5) // Extract HH:mm
  }

  private parseTimeToTimeSpan(timeStr: string): string {
    // Convert "HH:mm" to "HH:mm:00" format for TimeSpan
    return timeStr.length === 5 ? `${timeStr}:00` : timeStr
  }

  // Admin API
  async onboardHr(request: { name: string; email: string; initialPassword: string }): Promise<any> {
    const response = await this.client.post('/api/admin/onboard-hr', request)
    return response.data
  }

  async getPanelRequests(): Promise<any[]> {
    const response = await this.client.get('/api/admin/panel-requests')
    return response.data
  }

  async createPanel(request: { panelRequestId: number; initialPassword: string }): Promise<any> {
    const response = await this.client.post('/api/admin/create-panel', request)
    return response.data
  }

  async rejectPanelRequest(requestId: number): Promise<void> {
    await this.client.post(`/api/admin/reject-panel-request/${requestId}`)
  }

  // Panel Request API (for HR)
  async requestPanel(request: { panelName: string; panelEmail: string; notes?: string }): Promise<any> {
    const response = await this.client.post('/api/panelrequest/request-panel', request)
    return response.data
  }

  async getMyPanelRequests(): Promise<any[]> {
    const response = await this.client.get('/api/panelrequest/my-requests')
    return response.data
  }

  // Change Password API
  async changePassword(request: { currentPassword: string; newPassword: string }): Promise<void> {
    await this.client.post('/api/auth/change-password', request)
  }

  getClient(): AxiosInstance {
    return this.client
  }
}

export const apiService = new ApiService()
