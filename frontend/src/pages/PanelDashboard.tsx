// AIModified:2026-01-11T12:35:29Z
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { apiService } from '@/services/api'
import type { Skill, AvailabilitySlot, Interview } from '@/types'
import { formatDate, getMinDateTime, isFutureDateTime } from '@/utils/dateUtils'

export const PanelDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // All available skills (from API)
  const [allAvailableSkills, setAllAvailableSkills] = useState<Skill[]>([])
  // Skills selected by the panel member
  const [mySkills, setMySkills] = useState<Skill[]>([])
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isAddSkillDropdownOpen, setIsAddSkillDropdownOpen] = useState(false)
  const [skillSearchQuery, setSkillSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsAddSkillDropdownOpen(false)
      }
    }

    if (isAddSkillDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAddSkillDropdownOpen])
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([])
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([])
  const [pastInterviews, setPastInterviews] = useState<Interview[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming')

  // Cancel confirmation modal state
  const [cancelConfirmModal, setCancelConfirmModal] = useState<{
    isOpen: boolean
    interviewId: number | null
    candidateName: string
  }>({
    isOpen: false,
    interviewId: null,
    candidateName: '',
  })

  // New availability slot form state
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
  })

  // Memoize min date/time to avoid recalculation on every render
  const minDateTime = useMemo(() => getMinDateTime(), [])

  // Load profile and data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!user?.interviewerProfileId) {
        setError('Interviewer profile not found')
        setIsLoadingProfile(false)
        setIsLoadingData(false)
        return
      }

      try {
        setIsLoadingProfile(true)
        setIsLoadingData(true)
        
        // Load all skills, profile, availability, and interviews in parallel
        const [skillsData, profileData, availabilityData, interviewsData] = await Promise.all([
          apiService.getSkills(),
          apiService.getInterviewerProfile(user.interviewerProfileId),
          apiService.getAvailability(user.interviewerProfileId),
          apiService.getInterviewerSchedule(user.interviewerProfileId),
        ])

        setAllAvailableSkills(skillsData)
        
        // Set my skills from profile
        const primarySkills = profileData.primarySkills.map(s => ({ ...s, type: 'PRIMARY' as const }))
        const secondarySkills = profileData.secondarySkills.map(s => ({ ...s, type: 'SECONDARY' as const }))
        setMySkills([...primarySkills, ...secondarySkills])

        setAvailabilitySlots(availabilityData)

        // Separate upcoming and past interviews based on scheduled date and time
        const now = new Date()
        now.setSeconds(0, 0)
        now.setMilliseconds(0)
        
        const upcoming = interviewsData.filter(i => {
          if (!i.scheduledDate || !i.startTime) return false
          
          try {
            // Create date-time from scheduledDate (YYYY-MM-DD) and startTime (HH:mm)
            const [year, month, day] = i.scheduledDate.split('-').map(Number)
            const [hours, minutes] = i.startTime.split(':').map(Number)
            
            if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
              return false
            }
            
            const interviewDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0)
            
            // Upcoming: interview is in the future AND status is "Scheduled" (not completed/cancelled)
            const isFuture = interviewDateTime >= now
            // Only include interviews with status "Scheduled" (case-insensitive check)
            const isActive = i.status?.toUpperCase() === 'SCHEDULED'
            return isFuture && isActive
          } catch (error) {
            console.error('Error processing interview:', i, error)
            return false
          }
        })
        
        const past = interviewsData.filter(i => {
          if (!i.scheduledDate || !i.startTime) return false
          
          try {
            // Create date-time from scheduledDate (YYYY-MM-DD) and startTime (HH:mm)
            const [year, month, day] = i.scheduledDate.split('-').map(Number)
            const [hours, minutes] = i.startTime.split(':').map(Number)
            
            if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
              return false
            }
            
            const interviewDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0)
            
            // History: interview is in the past OR completed/cancelled
            const isPast = interviewDateTime < now
            // Check for completed or cancelled status (case-insensitive)
            const statusUpper = i.status?.toUpperCase() || ''
            const isCompletedOrCancelled = statusUpper === 'COMPLETED' || statusUpper === 'CANCELLED'
            return isPast || isCompletedOrCancelled
          } catch (error) {
            console.error('Error processing interview:', i, error)
            return false
          }
        })
        
        setUpcomingInterviews(upcoming)
        setPastInterviews(past)
      } catch (err: any) {
        setError('Failed to load data: ' + (err.message || 'Unknown error'))
      } finally {
        setIsLoadingProfile(false)
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [user?.interviewerProfileId])

  // Memoize available skills to add based on search query
  const availableSkillsToAdd = useMemo(() => {
    const query = skillSearchQuery.toLowerCase()
    return allAvailableSkills.filter(
      (skill) =>
        !mySkills.find((s) => s.id === skill.id) &&
        skill.name.toLowerCase().includes(query)
    )
  }, [allAvailableSkills, mySkills, skillSearchQuery])

  // Memoize current interviews list based on active tab
  const currentInterviews = useMemo(() => {
    return activeTab === 'upcoming' ? upcomingInterviews : pastInterviews
  }, [activeTab, upcomingInterviews, pastInterviews])

  const handleLogout = useCallback(async () => {
    await logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  const saveProfile = useCallback(async (updatedSkills: Skill[]) => {
    if (!user?.interviewerProfileId) return

    try {
      const primarySkills = updatedSkills.filter(s => s.type === 'PRIMARY').map(s => ({ id: s.id, name: s.name }))
      const secondarySkills = updatedSkills.filter(s => s.type === 'SECONDARY').map(s => ({ id: s.id, name: s.name }))
      
      await apiService.updateInterviewerProfile(user.interviewerProfileId, {
        primarySkills,
        secondarySkills,
      })
    } catch (err: any) {
      setError('Failed to save profile: ' + (err.message || 'Unknown error'))
      throw err // Re-throw to allow caller to handle
    }
  }, [user?.interviewerProfileId])

  const handleAddSkill = useCallback(
    async (skill: Skill) => {
      // Add skill to mySkills if not already present
      if (!mySkills.find((s) => s.id === skill.id)) {
        const updatedSkills = [...mySkills, { ...skill, type: 'PRIMARY' as const }]
        setMySkills(updatedSkills)
        setIsAddSkillDropdownOpen(false)
        setSkillSearchQuery('')
        // Save to backend
        try {
          await saveProfile(updatedSkills)
        } catch {
          // Error already handled in saveProfile
          setMySkills(mySkills) // Revert on error
        }
      }
    },
    [mySkills, saveProfile]
  )

  const handleDeleteSkill = useCallback(async (skillId: number | string) => {
    const updatedSkills = mySkills.filter((skill) => skill.id !== skillId)
    const previousSkills = mySkills
    setMySkills(updatedSkills)
    // Save to backend
    try {
      await saveProfile(updatedSkills)
    } catch {
      // Error already handled in saveProfile
      setMySkills(previousSkills) // Revert on error
    }
  }, [mySkills, saveProfile])

  const handleToggleSkillType = useCallback(async (skillId: number | string) => {
    const updatedSkills = mySkills.map((skill) =>
      skill.id === skillId
        ? { ...skill, type: skill.type === 'PRIMARY' ? 'SECONDARY' as const : 'PRIMARY' as const }
        : skill
    )
    const previousSkills = mySkills
    setMySkills(updatedSkills)
    // Save to backend
    try {
      await saveProfile(updatedSkills)
    } catch {
      // Error already handled in saveProfile
      setMySkills(previousSkills) // Revert on error
    }
  }, [mySkills, saveProfile])

  const handleAddAvailabilitySlot = useCallback(async () => {
    if (!user?.interviewerProfileId) {
      setError('Interviewer profile not found')
      return
    }

    if (newSlot.date && newSlot.startTime && newSlot.endTime) {
      if (isFutureDateTime(newSlot.date, newSlot.startTime)) {
        try {
          const slot = await apiService.createAvailability(user.interviewerProfileId, {
            date: newSlot.date,
            startTime: newSlot.startTime,
            endTime: newSlot.endTime,
          })
          setAvailabilitySlots((prev) => [...prev, slot])
          setNewSlot({ date: '', startTime: '', endTime: '' })
        } catch (err: any) {
          setError('Failed to add availability slot: ' + (err.message || 'Unknown error'))
        }
      } else {
        setError('Please select a future date and time')
      }
    }
  }, [newSlot, user?.interviewerProfileId])

  const handleRemoveAvailabilitySlot = useCallback(async (id: number) => {
    try {
      await apiService.deleteAvailability(id)
      setAvailabilitySlots((prev) => prev.filter((slot) => slot.id !== id))
    } catch (err: any) {
      setError('Failed to remove availability slot: ' + (err.message || 'Unknown error'))
    }
  }, [])

  const handleCancelInterview = useCallback((id: number, candidateName: string) => {
    setCancelConfirmModal({
      isOpen: true,
      interviewId: id,
      candidateName,
    })
  }, [])

  const handleConfirmCancel = useCallback(async (interviewId?: number) => {
    // Use the passed interviewId or fall back to modal state
    const idToCancel = interviewId ?? cancelConfirmModal.interviewId
    if (!idToCancel) {
      console.error('No interview ID provided or in cancel modal', { interviewId, cancelConfirmModal })
      return
    }

    console.log('Attempting to cancel interview:', idToCancel)
    
    // Close modal immediately to prevent UI freeze
    setCancelConfirmModal({ isOpen: false, interviewId: null, candidateName: '' })

    try {
      console.log('Calling cancelInterview API for interview:', idToCancel)
      await apiService.cancelInterview(idToCancel)
      console.log('Interview cancelled successfully')
      
      // Reload interviews to get updated status
      if (user?.interviewerProfileId) {
        console.log('Reloading interviews for profile:', user.interviewerProfileId)
        const interviewsData = await apiService.getInterviewerSchedule(user.interviewerProfileId)
        const now = new Date()
        now.setSeconds(0, 0)
        now.setMilliseconds(0)
        
        const upcoming = interviewsData.filter(i => {
          if (!i.scheduledDate || !i.startTime) return false
          try {
            const [year, month, day] = i.scheduledDate.split('-').map(Number)
            const [hours, minutes] = i.startTime.split(':').map(Number)
            if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
              return false
            }
            const interviewDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0)
            const isFuture = interviewDateTime >= now
            const isActive = i.status?.toUpperCase() === 'SCHEDULED'
            return isFuture && isActive
          } catch (error) {
            return false
          }
        })
        
        const past = interviewsData.filter(i => {
          if (!i.scheduledDate || !i.startTime) return false
          try {
            const [year, month, day] = i.scheduledDate.split('-').map(Number)
            const [hours, minutes] = i.startTime.split(':').map(Number)
            if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
              return false
            }
            const interviewDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0)
            const isPast = interviewDateTime < now
            const statusUpper = i.status?.toUpperCase() || ''
            const isCompletedOrCancelled = statusUpper === 'COMPLETED' || statusUpper === 'CANCELLED'
            return isPast || isCompletedOrCancelled
          } catch (error) {
            return false
          }
        })
        
        setUpcomingInterviews(upcoming)
        setPastInterviews(past)
        console.log('Interviews reloaded. Upcoming:', upcoming.length, 'Past:', past.length)
      }
    } catch (err: any) {
      console.error('Error cancelling interview:', err)
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
      })
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error'
      setError('Failed to cancel interview: ' + errorMessage)
    }
  }, [user?.interviewerProfileId])

  const handleCancelCancel = useCallback(() => {
    setCancelConfirmModal({ isOpen: false, interviewId: null, candidateName: '' })
  }, [])

  return (
    <div style={styles.container}>
      {/* Error notification */}
      {error && (
        <div style={styles.errorBanner} className="fade-in">
          <span style={styles.errorIcon}>⚠️</span>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={styles.errorClose}
            aria-label="Close error"
          >
            ✕
          </button>
        </div>
      )}
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerTitle}>XIS - Interview Scheduler</span>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.profileContainer}>
            <div style={styles.profileImage} className="profile-image-hover">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={styles.userNameContainer}>
              <span style={styles.userName}>{user?.name}</span>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <div style={styles.layout}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <span style={styles.sidebarTitle}>Panel Dashboard</span>
          </div>
          <nav style={styles.nav}>
            <div style={styles.navSection}>
              <div style={styles.navItemActive}>
                <span style={styles.navIcon}>🏠</span>
                <span>Home</span>
              </div>
              {/* Example inactive items - can be removed or used as template */}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={styles.main}>
          <div style={styles.contentWrapper}>
            <div style={styles.greeting}>
              <h1 style={styles.greetingTitle}>Hi, {user?.name}</h1>
              <p style={styles.greetingSubtitle}>Welcome to XIS Panel Dashboard</p>
            </div>

            {/* Skill Selection Section */}
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>My Skills</h2>
                <div style={styles.addSkillContainer} ref={dropdownRef}>
                  <button
                    onClick={() => {
                      setIsAddSkillDropdownOpen(!isAddSkillDropdownOpen)
                      setSkillSearchQuery('')
                    }}
                    style={styles.addSkillButton}
                    className="button-hover"
                  >
                    <span style={styles.addIcon}>+</span>
                    Add Skill
                  </button>
                  {isAddSkillDropdownOpen && (
                    <div style={styles.skillDropdown} className="fade-in">
                      <div style={styles.skillDropdownHeader}>
                        <span style={styles.searchIcon}>🔍</span>
                        <input
                          type="text"
                          placeholder="Search skills..."
                          value={skillSearchQuery}
                          onChange={(e) => setSkillSearchQuery(e.target.value)}
                          style={styles.skillSearchInput}
                          className="input-focus"
                          autoFocus
                        />
                      </div>
                      <div style={styles.skillDropdownList}>
                        {availableSkillsToAdd.length > 0 ? (
                          availableSkillsToAdd.map((skill, index) => (
                            <div
                              key={skill.id}
                              onClick={() => handleAddSkill(skill)}
                              style={{
                                ...styles.skillDropdownItem,
                                ...(index === availableSkillsToAdd.length - 1
                                  ? { borderBottom: 'none' }
                                  : {}),
                              }}
                              className="button-hover"
                            >
                              <span style={styles.skillDropdownItemIcon}>✓</span>
                              <span>{skill.name}</span>
                            </div>
                          ))
                        ) : (
                          <div style={styles.skillDropdownEmpty}>
                            {skillSearchQuery
                              ? 'No skills found matching your search'
                              : 'No more skills available'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div style={styles.skillsContainer}>
                {mySkills.length > 0 ? (
                  mySkills.map((skill, index) => (
                    <div
                      key={skill.id}
                      style={{
                        ...styles.skillCard,
                        animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
                      }}
                      className="fade-in-up card-hover"
                    >
                      <div style={styles.skillCardContent}>
                        <span style={styles.skillBadge}>{skill.name}</span>
                        <div style={styles.skillActions}>
                          <div style={styles.toggleContainer}>
                            <span style={{
                              ...styles.toggleLabel,
                              ...(skill.type === 'PRIMARY' ? styles.toggleLabelActive : {})
                            }}>Primary</span>
                            <label style={styles.toggleSwitch}>
                              <input
                                type="checkbox"
                                checked={skill.type === 'PRIMARY'}
                                onChange={() => handleToggleSkillType(skill.id)}
                                style={styles.toggleInput}
                              />
                              <span
                                style={{
                                  ...styles.toggleSlider,
                                  ...(skill.type === 'PRIMARY'
                                    ? styles.toggleSliderActive
                                    : {}),
                                }}
                              >
                                <span
                                  style={{
                                    ...styles.toggleSliderThumb,
                                    ...(skill.type === 'PRIMARY'
                                      ? styles.toggleSliderThumbActive
                                      : {}),
                                  }}
                                />
                              </span>
                            </label>
                            <span style={{
                              ...styles.toggleLabel,
                              ...(skill.type === 'SECONDARY' ? styles.toggleLabelActive : {})
                            }}>Secondary</span>
                          </div>
                          <button
                            onClick={() => handleDeleteSkill(skill.id)}
                            style={styles.deleteSkillButton}
                            title="Delete skill"
                            className="button-hover"
                          >
                            <span style={styles.deleteIcon}>✕</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={styles.emptyStateCard}>
                    <span style={styles.emptyStateIcon}>💼</span>
                    <p style={styles.emptyStateTitle}>No skills added yet</p>
                    <p style={styles.emptyStateMessage}>Click "Add Skill" to get started and showcase your expertise</p>
                  </div>
                )}
              </div>
            </section>

            {/* Availability Management Section */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Availability Slots</h2>
              <div style={styles.availabilityCard}>
                <div style={styles.availabilityForm}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>📅 Date</label>
                    <input
                      type="date"
                      value={newSlot.date}
                      min={minDateTime.date}
                      onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                      style={styles.dateInput}
                      className="input-focus"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>🕐 Start Time</label>
                    <input
                      type="time"
                      value={newSlot.startTime}
                      min={
                        newSlot.date === minDateTime.date
                          ? minDateTime.time
                          : undefined
                      }
                      onChange={(e) =>
                        setNewSlot({ ...newSlot, startTime: e.target.value })
                      }
                      style={styles.timeInput}
                      className="input-focus"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>🕐 End Time</label>
                    <input
                      type="time"
                      value={newSlot.endTime}
                      min={newSlot.startTime || undefined}
                      onChange={(e) =>
                        setNewSlot({ ...newSlot, endTime: e.target.value })
                      }
                      style={styles.timeInput}
                      className="input-focus"
                    />
                  </div>
                  <button
                    onClick={handleAddAvailabilitySlot}
                    style={styles.addButton}
                    className="button-hover"
                    disabled={!newSlot.date || !newSlot.startTime || !newSlot.endTime}
                  >
                    <span style={styles.addIcon}>+</span>
                    Add Slot
                  </button>
                </div>
                <div style={styles.slotsList}>
                  {availabilitySlots.length > 0 ? (
                    availabilitySlots.map((slot) => (
                      <div key={slot.id} style={styles.slotItem} className="fade-in-up card-hover">
                        <div style={styles.slotInfo}>
                          <div style={styles.slotDateContainer}>
                            <span style={styles.slotIcon}>📅</span>
                            <span style={styles.slotDate}>{formatDate(slot.date)}</span>
                          </div>
                          <div style={styles.slotTimeContainer}>
                            <span style={styles.slotTimeIcon}>🕐</span>
                            <span style={styles.slotTime}>
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveAvailabilitySlot(slot.id)}
                          style={styles.removeButton}
                          className="button-hover"
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={styles.emptyStateCard}>
                      <span style={styles.emptyStateIcon}>⏰</span>
                      <p style={styles.emptyStateTitle}>No availability slots</p>
                      <p style={styles.emptyStateMessage}>Add your available time slots to start receiving interview requests</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Interviews Section */}
            <section style={styles.section}>
              <div style={styles.interviewsHeader}>
                <h2 style={styles.sectionTitle}>Interviews</h2>
                <div style={styles.tabs}>
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    style={{
                      ...styles.tabButton,
                      ...(activeTab === 'upcoming' ? styles.tabButtonActive : {}),
                    }}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    style={{
                      ...styles.tabButton,
                      ...(activeTab === 'history' ? styles.tabButtonActive : {}),
                    }}
                  >
                    History
                  </button>
                </div>
              </div>

              <div style={styles.interviewsList}>
                {currentInterviews.length > 0 ? (
                  currentInterviews.map(
                    (interview, index) => (
                      <div
                        key={interview.id}
                        style={{
                          ...styles.interviewCard,
                          animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`,
                        }}
                        className="fade-in-up card-hover"
                      >
                        <div style={styles.interviewInfo}>
                          <div style={styles.interviewHeader}>
                            <div>
                              <h3 style={styles.interviewCandidateName}>
                                {interview.candidateName}
                              </h3>
                              <p style={styles.interviewEmail}>{interview.candidateEmail}</p>
                            </div>
                            {activeTab === 'history' && (
                              <span style={{
                                ...styles.interviewStatusBadge,
                                ...(interview.status === 'COMPLETED' 
                                  ? styles.statusCompleted 
                                  : styles.statusCancelled)
                              }}>
                                {interview.status}
                              </span>
                            )}
                          </div>
                          <div style={styles.interviewDetails}>
                            <div style={styles.interviewDetailItem}>
                              <span style={styles.detailIcon}>📅</span>
                              <span style={styles.interviewDate}>
                                {formatDate(interview.scheduledDate)}
                              </span>
                            </div>
                            <div style={styles.interviewDetailItem}>
                              <span style={styles.detailIcon}>🕐</span>
                              <span style={styles.interviewTime}>
                                {interview.startTime} - {interview.endTime}
                              </span>
                            </div>
                          </div>
                          <div style={styles.interviewSkills}>
                            {interview.skills.map((skill, idx) => (
                              <span key={idx} style={styles.skillTag}>
                                {skill}
                              </span>
                            ))}
                          </div>
                          {interview.hrName && (
                            <div style={styles.hrInfo}>
                              <span style={styles.hrIcon}>👤</span>
                              <div style={styles.hrDetails}>
                                <span style={styles.hrLabel}>Scheduled by:</span>
                                <span style={styles.hrName}>{interview.hrName}</span>
                                {interview.hrEmail && (
                                  <span style={styles.hrEmail}>({interview.hrEmail})</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        {activeTab === 'upcoming' && (
                          <button
                            onClick={() => handleCancelInterview(interview.id, interview.candidateName || '')}
                            style={styles.cancelButton}
                            className="button-hover"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    )
                  )
                ) : (
                  <div style={styles.emptyStateCard}>
                    <span style={styles.emptyStateIcon}>
                      {activeTab === 'upcoming' ? '📋' : '📚'}
                    </span>
                    <p style={styles.emptyStateTitle}>
                      No {activeTab === 'upcoming' ? 'upcoming' : 'past'} interviews
                    </p>
                    <p style={styles.emptyStateMessage}>
                      {activeTab === 'upcoming'
                        ? "You don't have any scheduled interviews yet"
                        : 'Your interview history will appear here'}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelConfirmModal.isOpen && (
        <div style={styles.modalOverlay} onClick={handleCancelCancel}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Cancel Interview</h2>
              <button
                onClick={handleCancelCancel}
                style={styles.modalCloseButton}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div style={styles.modalBody}>
              <p style={styles.modalMessage}>
                Are you sure you want to cancel the interview with{' '}
                <strong>{cancelConfirmModal.candidateName}</strong>?
              </p>
              <p style={styles.modalSubMessage}>
                This action cannot be undone.
              </p>
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={handleCancelCancel}
                style={styles.modalCancelButton}
                className="button-hover"
                type="button"
              >
                No, Keep It
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const interviewId = cancelConfirmModal.interviewId
                  console.log('Yes, Cancel Interview button clicked', {
                    interviewId,
                    candidateName: cancelConfirmModal.candidateName,
                    isOpen: cancelConfirmModal.isOpen
                  })
                  // Pass interviewId directly to avoid closure issues
                  if (interviewId) {
                    handleConfirmCancel(interviewId)
                  } else {
                    console.error('No interview ID available when button clicked')
                  }
                }}
                style={styles.modalConfirmButton}
                className="button-hover"
                type="button"
              >
                Yes, Cancel Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Color palette matching the exact design system from image
const primaryPurple = '#5F256E' // Deep rich purple - primary brand color
const activeSidebarBg = '#F5EEF7' // Very light lavender for active sidebar items
const white = '#FFFFFF' // Main background white
const textDark = '#333333' // Primary dark text
const textLight = '#666666' // Secondary medium-dark text
const borderGray = '#E0E0E0' // Light gray for borders/dividers
const placeholderGray = '#999999' // Lighter gray for placeholder text
const lightGray = '#f5f5f5' // Light gray background (for main content area if needed)

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: white,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 50,
    maxWidth: '100vw',
    height: '3.5rem', // h-14 = 56px
    flex: 'none',
    backgroundColor: primaryPurple,
    color: white,
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    fontSize: '0.875rem', // text-sm
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    letterSpacing: '0.01em',
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  layout: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  sidebar: {
    width: '250px',
    backgroundColor: white,
    borderRight: `1px solid ${borderGray}`,
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    backgroundColor: primaryPurple,
    color: white,
    padding: '1.5rem 1rem',
  },
  sidebarTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  nav: {
    flex: 1,
    padding: '1rem 0',
  },
  navSection: {
    padding: '0 1rem',
  },
  navItemActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: '4px',
    backgroundColor: activeSidebarBg,
    color: primaryPurple,
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  navItemInactive: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: textDark,
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  navIcon: {
    fontSize: '1rem',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: white,
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  greeting: {
    marginBottom: '2rem',
  },
  greetingTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: textDark,
    marginBottom: '0.5rem',
  },
  greetingSubtitle: {
    fontSize: '1rem',
    color: textLight,
  },
  section: {
    marginBottom: '3rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: textDark,
    marginBottom: '1.5rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  addSkillContainer: {
    position: 'relative',
  },
  addSkillButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: primaryPurple,
    color: white,
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(95, 37, 110, 0.2)',
  },
  addIcon: {
    fontSize: '1.125rem',
    fontWeight: 'bold',
    lineHeight: 1,
  },
  searchIcon: {
    fontSize: '1rem',
    marginRight: '0.5rem',
  },
  skillDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.5rem',
    backgroundColor: 'white',
    border: `1px solid ${borderGray}`,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    minWidth: '280px',
    maxHeight: '400px',
    overflow: 'hidden',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
  },
  skillDropdownHeader: {
    padding: '0.75rem',
    borderBottom: `1px solid ${borderGray}`,
    backgroundColor: white,
    display: 'flex',
    alignItems: 'center',
  },
  skillSearchInput: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    border: `1px solid ${borderGray}`,
    borderRadius: '6px',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: white,
    color: textDark,
  },
  skillSearchInputPlaceholder: {
    color: placeholderGray,
  },
  skillDropdownList: {
    maxHeight: '300px',
    overflowY: 'auto',
  },
  skillDropdownItem: {
    padding: '0.875rem 1rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: textDark,
    borderBottom: `1px solid ${borderGray}`,
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  skillDropdownItemHover: {
    backgroundColor: lightGray,
  },
  skillDropdownItemIcon: {
    color: primaryPurple,
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  skillDropdownEmpty: {
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    color: textLight,
    textAlign: 'center',
  },
  skillsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  },
  skillCard: {
    backgroundColor: white,
    padding: '1.25rem',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${borderGray}`,
    transition: 'all 0.2s',
    cursor: 'default',
  },
  skillCardContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  skillBadge: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: primaryPurple,
    padding: '0.5rem 1rem',
    backgroundColor: activeSidebarBg,
    borderRadius: '20px',
    display: 'inline-block',
  },
  skillActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  toggleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  toggleLabel: {
    fontSize: '0.75rem',
    color: textLight,
    fontWeight: '500',
    transition: 'color 0.2s',
  },
  toggleLabelActive: {
    color: primaryPurple,
    fontWeight: '600',
  },
  toggleSwitch: {
    position: 'relative',
    display: 'inline-block',
    width: '48px',
    height: '26px',
    cursor: 'pointer',
  },
  toggleInput: {
    opacity: 0,
    width: 0,
    height: 0,
  },
  toggleSlider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#d1d5db',
    transition: '0.3s',
    borderRadius: '26px',
  },
  toggleSliderActive: {
    backgroundColor: primaryPurple,
  },
  toggleSliderThumb: {
    position: 'absolute',
    height: '20px',
    width: '20px',
    left: '3px',
    bottom: '3px',
    backgroundColor: 'white',
    transition: '0.3s',
    borderRadius: '50%',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  toggleSliderThumbActive: {
    transform: 'translateX(22px)',
  },
  deleteSkillButton: {
    padding: '0.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'all 0.2s',
    width: '32px',
    height: '32px',
  },
  deleteIcon: {
    fontSize: '1.25rem',
    color: '#dc3545',
    fontWeight: 'bold',
    lineHeight: 1,
    transition: 'transform 0.2s',
  },
  profileContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
  },
  userNameContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  profileImage: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '700',
    border: '2px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  availabilityCard: {
    backgroundColor: white,
    padding: '1.75rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${borderGray}`,
  },
  availabilityForm: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    paddingBottom: '1.5rem',
    borderBottom: `1px solid ${borderGray}`,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
    minWidth: '150px',
  },
  formLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: textDark,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  dateInput: {
    padding: '0.625rem 0.75rem',
    border: `1px solid ${borderGray}`,
    borderRadius: '6px',
    fontSize: '0.875rem',
    backgroundColor: white,
    color: textDark,
    transition: 'all 0.2s',
  },
  timeInput: {
    padding: '0.625rem 0.75rem',
    border: `1px solid ${borderGray}`,
    borderRadius: '6px',
    fontSize: '0.875rem',
    backgroundColor: white,
    color: textDark,
    transition: 'all 0.2s',
  },
  addButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: primaryPurple,
    color: white,
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 2px 4px rgba(95, 37, 110, 0.2)',
    alignSelf: 'flex-end',
  },
  slotsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  slotItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    backgroundColor: white,
    border: `1px solid ${borderGray}`,
    borderRadius: '8px',
    transition: 'all 0.2s',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  slotInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  slotDateContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  slotTimeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  slotIcon: {
    fontSize: '1rem',
  },
  slotTimeIcon: {
    fontSize: '1rem',
  },
  slotDate: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: textDark,
  },
  slotTime: {
    fontSize: '0.875rem',
    color: textLight,
    fontWeight: '500',
  },
  removeButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 1px 3px rgba(220, 53, 69, 0.2)',
  },
  interviewsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    backgroundColor: white,
    padding: '0.25rem',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    border: `1px solid ${borderGray}`,
  },
  tabButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    color: textLight,
  },
  tabButtonActive: {
    backgroundColor: primaryPurple,
    color: white,
  },
  interviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  interviewCard: {
    backgroundColor: white,
    padding: '1.75rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    transition: 'all 0.2s',
    border: `1px solid ${borderGray}`,
    gap: '1.5rem',
  },
  interviewInfo: {
    flex: 1,
  },
  interviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    gap: '1rem',
  },
  interviewCandidateName: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: textDark,
    marginBottom: '0.375rem',
  },
  interviewEmail: {
    fontSize: '0.875rem',
    color: textLight,
  },
  interviewStatusBadge: {
    padding: '0.375rem 0.75rem',
    backgroundColor: primaryPurple,
    color: white,
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
  },
  statusCompleted: {
    backgroundColor: '#10b981',
  },
  statusCancelled: {
    backgroundColor: '#ef4444',
  },
  interviewDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  interviewDetailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  detailIcon: {
    fontSize: '0.875rem',
  },
  interviewDate: {
    fontSize: '0.875rem',
    color: textDark,
    fontWeight: '500',
  },
  interviewTime: {
    fontSize: '0.875rem',
    color: textDark,
    fontWeight: '500',
  },
  interviewSkills: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  skillTag: {
    padding: '0.25rem 0.75rem',
    backgroundColor: activeSidebarBg,
    borderRadius: '12px',
    fontSize: '0.75rem',
    color: primaryPurple,
  },
  cancelButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(220, 53, 69, 0.2)',
    whiteSpace: 'nowrap',
  },
  emptyMessage: {
    textAlign: 'center',
    color: textLight,
    padding: '2rem',
    fontSize: '0.875rem',
  },
  emptyStateCard: {
    textAlign: 'center',
    padding: '3rem 2rem',
    backgroundColor: white,
    borderRadius: '12px',
    border: `2px dashed ${borderGray}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  },
  emptyStateIcon: {
    fontSize: '3rem',
    opacity: 0.5,
  },
  emptyStateTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: textDark,
    margin: 0,
  },
  emptyStateMessage: {
    fontSize: '0.875rem',
    color: textLight,
    margin: 0,
    maxWidth: '400px',
  },
  hrInfo: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: `1px solid ${borderGray}`,
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  hrIcon: {
    fontSize: '1rem',
    marginTop: '0.125rem',
  },
  hrDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    flex: 1,
  },
  hrLabel: {
    fontSize: '0.75rem',
    color: textLight,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  hrName: {
    fontSize: '0.8125rem',
    color: textDark,
    fontWeight: '600',
  },
  hrEmail: {
    fontSize: '0.75rem',
    color: textLight,
  },
  errorBanner: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: '#fee',
    color: '#dc3545',
    padding: '0.75rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderBottom: '1px solid #fcc',
    fontSize: '0.875rem',
  },
  errorIcon: {
    fontSize: '1rem',
  },
  errorClose: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '1.25rem',
    padding: '0',
    width: '1.5rem',
    height: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: white,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: '1.5rem',
    borderBottom: `1px solid ${borderGray}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: textDark,
    margin: 0,
  },
  modalCloseButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: textLight,
    cursor: 'pointer',
    fontSize: '1.5rem',
    padding: '0.25rem',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  modalMessage: {
    fontSize: '1rem',
    color: textDark,
    margin: 0,
    lineHeight: 1.5,
  },
  modalSubMessage: {
    fontSize: '0.875rem',
    color: textLight,
    margin: 0,
  },
  modalFooter: {
    padding: '1.5rem',
    borderTop: `1px solid ${borderGray}`,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  },
  modalCancelButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    color: textDark,
    border: `1px solid ${borderGray}`,
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s, border-color 0.2s',
  },
  modalConfirmButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#dc3545',
    color: white,
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
}
