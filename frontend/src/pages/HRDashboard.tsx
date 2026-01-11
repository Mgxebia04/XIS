// AIModified:2026-01-11T19:25:50Z
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { apiService } from '@/services/api'
import type {
  Skill,
  MatchedPanel,
  ScheduledInterview,
  AvailableTimeSlot,
  InterviewType,
  Interviewee,
  OpenPosition,
} from '@/types'
import { formatDate, getMinDateTime, isFutureDateTime } from '@/utils/dateUtils'

export const HRDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Form state
  const [selectedPositionId, setSelectedPositionId] = useState<number | ''>('')
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | ''>('')
  const [selectedInterviewTypeId, setSelectedInterviewTypeId] = useState<number | ''>('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewTime, setInterviewTime] = useState('')

  // Booking state
  const [isBooking, setIsBooking] = useState(false)

  // Available skills (from API)
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([])
  const [interviewTypes, setInterviewTypes] = useState<InterviewType[]>([])
  const [positions, setPositions] = useState<OpenPosition[]>([])
  const [interviewees, setInterviewees] = useState<Interviewee[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<Interviewee[]>([])
  const [isLoadingSkills, setIsLoadingSkills] = useState(true)
  const [isSearching, setIsSearching] = useState(false)

  // Matched panels (mock data - will be replaced with API call)
  const [matchedPanels, setMatchedPanels] = useState<MatchedPanel[]>([])
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false)
  const [skillSearchQuery, setSkillSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const skillDropdownRef = useRef<HTMLDivElement>(null)

  // Scheduled interviews
  const [scheduledInterviews, setScheduledInterviews] = useState<
    ScheduledInterview[]
  >([])
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(false)


  // Load skills and interview types on mount - use ref to prevent double calls in StrictMode
  const hasLoadedInitialData = useRef(false)
  useEffect(() => {
    // Prevent double calls in React StrictMode
    if (hasLoadedInitialData.current) return
    hasLoadedInitialData.current = true

    const loadInitialData = async () => {
      try {
        setIsLoadingSkills(true)
        const [skillsData, typesData, positionsData] = await Promise.all([
          apiService.getSkills(),
          apiService.getInterviewTypes(),
          apiService.getPositions(),
        ])
        setAvailableSkills(skillsData)
        setInterviewTypes(typesData)
        setPositions(positionsData)
      } catch (err: any) {
        setError('Failed to load initial data: ' + (err.message || 'Unknown error'))
        hasLoadedInitialData.current = false // Reset on error to allow retry
      } finally {
        setIsLoadingSkills(false)
      }
    }
    loadInitialData()
  }, [])

  // Load scheduled interviews on mount - use ref to prevent double calls in StrictMode
  const hasLoadedInterviews = useRef(false)
  useEffect(() => {
    // Prevent double calls in React StrictMode
    if (hasLoadedInterviews.current) return
    hasLoadedInterviews.current = true

    const loadScheduledInterviews = async () => {
      try {
        setIsLoadingInterviews(true)
        setError(null) // Clear any previous errors
        const interviewsData = await apiService.getAllScheduledInterviews()
        // Filter out cancelled interviews for HR dashboard
        const activeInterviews = interviewsData.filter((interview: any) => {
          const statusUpper = (interview.status || '').toUpperCase()
          return statusUpper === 'SCHEDULED'
        })
        const formattedInterviews: ScheduledInterview[] = activeInterviews.map((interview: any) => ({
          id: interview.id,
          positionTitle: interview.positionTitle || null,
          candidateName: interview.candidateName,
          candidateEmail: interview.candidateEmail,
          panelName: interview.panelName,
          panelEmail: interview.panelEmail,
          level: interview.level, // Now contains InterviewType.Name (e.g., "L1 - Initial Screening")
          date: interview.date || interview.scheduledDate,
          startTime: interview.startTime,
          endTime: interview.endTime,
          skills: interview.skills || [],
          status: interview.status || 'SCHEDULED',
        }))
        setScheduledInterviews(formattedInterviews)
      } catch (err: any) {
        console.error('Error loading scheduled interviews:', err)
        setError('Failed to load scheduled interviews: ' + (err.response?.data?.message || err.message || 'Unknown error'))
        hasLoadedInterviews.current = false // Reset on error to allow retry
      } finally {
        setIsLoadingInterviews(false)
      }
    }
    loadScheduledInterviews()
  }, [])


  // Close skill dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        skillDropdownRef.current &&
        !skillDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSkillDropdownOpen(false)
      }
    }

    if (isSkillDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSkillDropdownOpen])

  // Load candidates when position changes
  useEffect(() => {
    const loadCandidates = async () => {
      if (!selectedPositionId) {
        setFilteredCandidates([])
        setSelectedCandidateId('')
        return
      }
      
      try {
        const candidatesData = await apiService.getInterviewees(Number(selectedPositionId))
        setFilteredCandidates(candidatesData)
        setInterviewees(candidatesData) // Also update main interviewees list
        // Reset candidate selection if current selection is not in filtered list
        if (selectedCandidateId && !candidatesData.find(c => c.id === Number(selectedCandidateId))) {
          setSelectedCandidateId('')
        }
      } catch (err: any) {
        setError('Failed to load candidates: ' + (err.message || 'Unknown error'))
      }
    }
    loadCandidates()
  }, [selectedPositionId])

  // Memoize min date/time
  const minDateTime = useMemo(() => getMinDateTime(), [])

  // Memoize filtered skills based on search query
  const filteredSkills = useMemo(() => {
    const query = skillSearchQuery.toLowerCase()
    return availableSkills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(query) &&
        !selectedSkills.includes(skill.id.toString())
    )
  }, [availableSkills, skillSearchQuery, selectedSkills])

  // Handle form submission to find matching panels
  const handleSubmitForm = useCallback(async () => {
    if (!selectedInterviewTypeId) {
      setError('Please select an interview level')
      return
    }
    if (selectedSkills.length === 0) {
      setError('Please select at least one skill')
      return
    }
    setError(null)
    setIsSearching(true)

    try {
      const primarySkillIds = selectedSkills.map(id => parseInt(id)).filter(id => !isNaN(id))
      
      const searchParams = {
        primarySkillIds,
        secondarySkillIds: [],
        interviewTypeId: Number(selectedInterviewTypeId),
        interviewDate: interviewDate || undefined,
        positionId: selectedPositionId ? Number(selectedPositionId) : undefined,
        intervieweeId: selectedCandidateId ? Number(selectedCandidateId) : undefined,
      }

      const matchedPanelsData = await apiService.searchAvailableInterviewers(searchParams)
      
      // Calculate match percentage and matched skills
      const selectedSkillNames = selectedSkills
        .map(id => availableSkills.find(s => s.id.toString() === id)?.name)
        .filter(Boolean) as string[]

      const enrichedPanels: MatchedPanel[] = matchedPanelsData.map(panel => {
        const matchedSkills = panel.skills.filter(skill => selectedSkillNames.includes(skill))
        const matchPercentage = selectedSkillNames.length > 0
          ? Math.round((matchedSkills.length / selectedSkillNames.length) * 100)
          : 0

        return {
          ...panel,
          matchPercentage,
          matchedSkills,
        }
      })

      setMatchedPanels(enrichedPanels)
    } catch (err: any) {
      setError('Failed to search for available interviewers: ' + (err.response?.data?.message || err.message || 'Unknown error'))
    } finally {
      setIsSearching(false)
    }
  }, [selectedSkills, interviewDate, interviewTime, selectedInterviewTypeId, availableSkills, selectedPositionId, selectedCandidateId])

  const handleLogout = useCallback(async () => {
    await logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  const toggleSkill = useCallback((skillId: string | number) => {
    const idStr = skillId.toString()
    setSelectedSkills((prev) =>
      prev.includes(idStr)
        ? prev.filter((id) => id !== idStr)
        : [...prev, idStr]
    )
  }, [])

  // Handle booking directly using selected candidate
  const handleBookInterview = useCallback(
    async (panelId: number, slot?: AvailableTimeSlot) => {
      // Validate that a candidate is selected
      if (!selectedCandidateId) {
        setError('Please select a candidate from the dropdown before booking')
        return
      }

      const candidate = filteredCandidates.find(c => c.id === Number(selectedCandidateId))
      if (!candidate) {
        setError('Selected candidate not found')
        return
      }

      const panel = matchedPanels.find((p) => p.interviewerProfileId === panelId)
      if (!panel) {
        setError('Panel not found')
        return
      }

      // Use provided slot or first available slot
      const selectedSlot = slot || panel.availableTimeSlots?.[0]
      if (!selectedSlot) {
        setError('No availability slot selected')
        return
      }

      setError(null)
      setIsBooking(true)

      try {
        if (!selectedInterviewTypeId) {
          setError('Interview level not selected')
          setIsBooking(false)
          return
        }

        const selectedInterviewType = interviewTypes.find(t => t.id === Number(selectedInterviewTypeId))
        if (!selectedInterviewType) {
          setError('Interview type not found')
          setIsBooking(false)
          return
        }

        // Get selected skill IDs
        const primarySkillIds = selectedSkills
          .map(id => availableSkills.find(s => s.id.toString() === id)?.id)
          .filter((id): id is number => id !== undefined)

        // Create interview
        // Get HR user ID from auth context (user.id is a string, convert to number if needed)
        const hrUserId = user?.id ? parseInt(user.id) : undefined
        
        const interview = await apiService.createInterview({
          interviewerProfileId: panelId,
          intervieweeId: candidate.id,
          interviewTypeId: Number(selectedInterviewTypeId),
          scheduledDate: selectedSlot.date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          primarySkillIds,
          secondarySkillIds: [],
          createdByUserId: hrUserId,
        })

        // Use the full interview type name for level (e.g., "L1 - Initial Screening")
        const level = selectedInterviewType.name

        // Get position title for the candidate
        const positionTitle = candidate.positionId 
          ? positions.find(p => p.id === candidate.positionId)?.title || null
          : null

        // Add to scheduled interviews list
        const newInterview: ScheduledInterview = {
          id: interview.id,
          positionTitle: positionTitle,
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          panelName: panel.name,
          level: level, // Full InterviewType.Name (e.g., "L1 - Initial Screening")
          date: selectedSlot.date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          skills: selectedSkills.map(
            (id) => availableSkills.find((s) => s.id.toString() === id)?.name || ''
          ).filter(Boolean),
          status: interview.status || 'SCHEDULED',
        }

        setScheduledInterviews((prev) => [...prev, newInterview])
        
        // Reset form after successful booking
        setSelectedSkills([])
        setInterviewDate('')
        setInterviewTime('')
        setMatchedPanels([])
        setSelectedCandidateId('')
        setSelectedPositionId('')
        setSelectedInterviewTypeId('')
      } catch (err: any) {
        setError('Failed to schedule interview: ' + (err.response?.data?.message || err.message || 'Unknown error'))
      } finally {
        setIsBooking(false)
      }
    },
    [
      selectedCandidateId,
      filteredCandidates,
      matchedPanels,
      selectedSkills,
      selectedInterviewTypeId,
      availableSkills,
      interviewTypes,
    ]
  )

  const handleCancelInterview = useCallback(async (interviewId: number) => {
    try {
      await apiService.cancelInterview(interviewId)
      // Reload scheduled interviews to get updated status
      const interviewsData = await apiService.getAllScheduledInterviews()
      // Filter out cancelled interviews for HR dashboard
      const activeInterviews = interviewsData.filter((interview: any) => {
        const statusUpper = (interview.status || '').toUpperCase()
        return statusUpper === 'SCHEDULED'
      })
      const formattedInterviews: ScheduledInterview[] = activeInterviews.map((interview: any) => ({
        id: interview.id,
        positionTitle: interview.positionTitle || null,
        candidateName: interview.candidateName,
        candidateEmail: interview.candidateEmail,
        panelName: interview.panelName,
        panelEmail: interview.panelEmail,
        level: interview.level, // Now contains InterviewType.Name (e.g., "L1 - Initial Screening")
        date: interview.date || interview.scheduledDate,
        startTime: interview.startTime,
        endTime: interview.endTime,
        skills: interview.skills || [],
        status: interview.status || 'SCHEDULED',
      }))
      setScheduledInterviews(formattedInterviews)
    } catch (err: any) {
      setError('Failed to cancel interview: ' + (err.message || 'Unknown error'))
    }
  }, [])

  // Memoize selected skill names
  const selectedSkillNames = useMemo(
    () =>
      selectedSkills
        .map((id) => availableSkills.find((s) => s.id.toString() === id)?.name)
        .filter((name): name is string => Boolean(name)),
    [selectedSkills, availableSkills]
  )

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
          <span style={styles.headerTitle}>
            <span style={styles.headerTitleX}>X</span>
            <span style={styles.headerTitleText}> Interview Scheduler</span>
          </span>
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
            <span style={styles.sidebarTitle}>
              <span style={styles.sidebarTitleIcon}>📊</span>
              HR Dashboard
            </span>
          </div>
          <nav style={styles.nav}>
            <div style={styles.navSection}>
              <div style={styles.navItemActive}>
                <span style={styles.navIcon}>🏠</span>
                <span>Home</span>
              </div>
              <div
                style={styles.navItem}
                onClick={() => navigate('/interviewers')}
                className="nav-item-hover"
              >
                <span style={styles.navIcon}>👥</span>
                <span style={styles.navItemText}>Interviewers</span>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={styles.main}>
          <div style={styles.contentWrapper}>
            <div style={styles.greeting}>
              <h1 style={styles.greetingTitle}>Hi, {user?.name}</h1>
              <p style={styles.greetingSubtitle}>
                Schedule interviews and manage candidates
              </p>
            </div>

            {/* Schedule Interview Form */}
            <section style={styles.section} className="fade-in-up">
              <h2 style={styles.sectionTitle}>Schedule New Interview</h2>
              <div style={styles.formCard} className="fade-in-up">
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Open Position
                    </label>
                    <select
                      value={selectedPositionId}
                      onChange={(e) => {
                        setSelectedPositionId(e.target.value ? Number(e.target.value) : '')
                        setSelectedCandidateId('') // Reset candidate when position changes
                      }}
                      style={styles.select}
                      className="input-focus"
                    >
                      <option value="">Select position</option>
                      {positions.map((position) => (
                        <option key={position.id} value={position.id}>
                          {position.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Candidate
                    </label>
                    <select
                      value={selectedCandidateId}
                      onChange={(e) => setSelectedCandidateId(e.target.value ? Number(e.target.value) : '')}
                      style={{
                        ...styles.select,
                        ...(!selectedPositionId ? { opacity: 0.6, cursor: 'not-allowed' } : {})
                      }}
                      className="input-focus"
                      disabled={!selectedPositionId}
                    >
                      <option value="">Select candidate</option>
                      {filteredCandidates.map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.name} ({candidate.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Interview Level <span style={styles.required}>*</span>
                    </label>
                    <select
                      value={selectedInterviewTypeId}
                      onChange={(e) =>
                        setSelectedInterviewTypeId(e.target.value ? Number(e.target.value) : '')
                      }
                      style={styles.select}
                      className="input-focus"
                    >
                      <option value="">Select interview level</option>
                      {interviewTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Skills <span style={styles.required}>*</span>
                    </label>
                    <div style={styles.skillSelectContainer} ref={skillDropdownRef}>
                      <div
                        onClick={() => setIsSkillDropdownOpen(!isSkillDropdownOpen)}
                        style={styles.skillSelectButton}
                        className="input-focus"
                      >
                        {selectedSkillNames.length > 0
                          ? `${selectedSkillNames.length} skill(s) selected`
                          : 'Select skills'}
                        <span style={styles.dropdownArrow}>
                          {isSkillDropdownOpen ? '▲' : '▼'}
                        </span>
                      </div>
                      {isSkillDropdownOpen && (
                        <div style={styles.skillDropdown}>
                          <div style={styles.skillDropdownHeader}>
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
                            {filteredSkills.map((skill) => (
                              <div
                                key={skill.id}
                                onClick={() => toggleSkill(skill.id.toString())}
                                style={styles.skillDropdownItem}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedSkills.includes(skill.id.toString())}
                                  onChange={() => toggleSkill(skill.id.toString())}
                                  style={styles.checkbox}
                                />
                                <span>{skill.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedSkillNames.length > 0 && (
                      <div style={styles.selectedSkills}>
                        {selectedSkillNames.map((name, idx) => (
                          <span key={idx} style={styles.skillTag}>
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Date (Optional)</label>
                    <input
                      type="date"
                      value={interviewDate}
                      min={minDateTime.date}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      style={styles.input}
                      className="input-focus"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Time (Optional)</label>
                    <input
                      type="time"
                      value={interviewTime}
                      min={
                        interviewDate === minDateTime.date
                          ? minDateTime.time
                          : undefined
                      }
                      onChange={(e) => setInterviewTime(e.target.value)}
                      style={styles.input}
                      className="input-focus"
                    />
                  </div>
                </div>
                <div style={styles.formActions}>
                  <button
                    onClick={handleSubmitForm}
                    style={styles.submitButton}
                    className="button-hover"
                  >
                    Find Matching Panels
                  </button>
                </div>
              </div>
            </section>

            {/* Matched Panels Table */}
            {matchedPanels.length > 0 && (
              <section style={styles.section} className="fade-in-up">
                <h2 style={styles.sectionTitle}>Matched Panels</h2>
                <div style={styles.tableCard} className="fade-in-up">
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Panel Name</th>
                        <th style={styles.tableHeader}>Match %</th>
                        <th style={styles.tableHeader}>Panel Skills</th>
                        <th style={styles.tableHeader}>Available Slots</th>
                        <th style={styles.tableHeader}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matchedPanels.map((panel, index) => (
                        <tr
                          key={panel.interviewerProfileId}
                          style={{
                            ...styles.tableRow,
                            animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both`,
                          }}
                          className="fade-in-up"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9f9f9'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          <td style={styles.tableCell}>
                            <div>
                              <div style={styles.panelName}>{panel.name}</div>
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.progressContainer}>
                              <div style={styles.progressBar}>
                                <div
                                  style={{
                                    ...styles.progressFill,
                                    width: `${panel.matchPercentage}%`,
                                  }}
                                />
                              </div>
                              <span style={styles.progressText}>
                                {panel.matchPercentage}%
                              </span>
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.matchedSkills}>
                              {panel.skills?.map((skill, idx) => (
                                <span key={idx} style={styles.skillTag}>
                                  {skill}
                                </span>
                              )) || []}
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.slotsContainer}>
                              {panel.availableTimeSlots.map((slot, idx) => (
                                <div key={idx} style={styles.slotBadge}>
                                  {formatDate(slot.date)} • {slot.startTime} - {slot.endTime}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            {panel.availableTimeSlots.length === 1 ? (
                              <button
                                onClick={() => handleBookInterview(panel.interviewerProfileId, panel.availableTimeSlots?.[0])}
                                style={styles.bookButton}
                                className="button-hover"
                                disabled={!selectedCandidateId || isBooking}
                              >
                                {isBooking ? 'Booking...' : 'Book'}
                              </button>
                            ) : (
                              <div style={styles.bookButtonsContainer}>
                                {panel.availableTimeSlots.map((slot, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleBookInterview(panel.interviewerProfileId, slot)}
                                    style={styles.bookSlotButton}
                                    className="button-hover"
                                    disabled={!selectedCandidateId || isBooking}
                                  >
                                    {isBooking ? 'Booking...' : `Book ${formatDate(slot.date).split(',')[0]} ${slot.startTime}`}
                                  </button>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}


            {/* Scheduled Interviews */}
            <section style={styles.section} className="fade-in-up">
              <h2 style={styles.sectionTitle}>Scheduled Interviews</h2>
              {scheduledInterviews.length > 0 ? (
                <div style={styles.tableCard} className="fade-in-up">
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Open Position</th>
                        <th style={styles.tableHeader}>Candidate</th>
                        <th style={styles.tableHeader}>Panel</th>
                        <th style={styles.tableHeader}>Level</th>
                        <th style={styles.tableHeader}>Date & Time</th>
                        <th style={styles.tableHeader}>Skills</th>
                        <th style={styles.tableHeader}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduledInterviews.map((interview, index) => (
                        <tr
                          key={interview.id}
                          style={{
                            ...styles.tableRow,
                            animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both`,
                          }}
                          className="fade-in-up"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f9f9f9'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          <td style={styles.tableCell}>
                            <span style={styles.positionBadge}>
                              {interview.positionTitle || 'N/A'}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            <div>
                              <div style={styles.candidateName}>
                                {interview.candidateName}
                              </div>
                              <div style={styles.candidateEmail}>
                                {interview.candidateEmail}
                              </div>
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <div>
                              <div style={styles.panelName}>
                                {interview.panelName}
                              </div>
                              <div style={styles.panelEmail}>
                                {interview.panelEmail}
                              </div>
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.levelBadge}>
                              {interview.level}
                            </span>
                          </td>
                          <td style={styles.tableCell}>
                            {formatDate(interview.date)} • {interview.startTime} -{' '}
                            {interview.endTime}
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.matchedSkills}>
                              {interview.skills.map((skill, idx) => (
                                <span key={idx} style={styles.skillTag}>
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <button
                              onClick={() => handleCancelInterview(interview.id)}
                              style={styles.cancelButton}
                              className="button-hover"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={styles.emptyMessage}>No scheduled interviews</p>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

// Color palette matching the exact design system
const primaryPurple = '#4a1e47'
const activeSidebarBg = '#F5EEF7'
const white = '#FFFFFF'
const textDark = '#333333'
const textLight = '#666666'
const borderGray = '#E0E0E0'
const placeholderGray = '#999999'

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
    height: '3.5rem',
    flex: 'none',
    backgroundColor: primaryPurple,
    color: white,
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    fontSize: '0.875rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '0.875rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
  },
  headerTitleX: {
    fontSize: '1.5rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  headerTitleText: {
    fontSize: '0.875rem',
    fontWeight: '500',
    marginLeft: '0.25rem',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
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
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: white,
    fontSize: '0.875rem',
    fontWeight: '600',
    border: '2px solid rgba(255, 255, 255, 0.5)',
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    letterSpacing: '0.01em',
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: white,
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
    backgroundColor: white,
    color: primaryPurple,
    padding: '1.5rem 1rem',
    borderBottom: `1px solid ${borderGray}`,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
    position: 'relative',
  },
  sidebarTitle: {
    fontSize: '0.875rem',
    fontWeight: '700',
    letterSpacing: '0.02em',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  sidebarTitleIcon: {
    fontSize: '1rem',
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: white,
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    position: 'relative',
    borderLeft: '3px solid #E91E63',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: '4px',
    color: textDark,
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    backgroundColor: white,
  },
  navItemText: {
    color: textDark,
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
  formCard: {
    backgroundColor: white,
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    border: `1px solid ${borderGray}`,
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: textDark,
  },
  required: {
    color: '#dc3545',
  },
  input: {
    padding: '0.5rem 0.75rem',
    border: `1px solid ${borderGray}`,
    borderRadius: '4px',
    fontSize: '0.875rem',
    backgroundColor: white,
    color: textDark,
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  select: {
    padding: '0.5rem 0.75rem',
    border: `1px solid ${borderGray}`,
    borderRadius: '4px',
    fontSize: '0.875rem',
    backgroundColor: white,
    color: textDark,
    outline: 'none',
    cursor: 'pointer',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  skillSelectContainer: {
    position: 'relative',
  },
  skillSelectButton: {
    padding: '0.5rem 0.75rem',
    border: `1px solid ${borderGray}`,
    borderRadius: '4px',
    fontSize: '0.875rem',
    backgroundColor: white,
    color: textDark,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownArrow: {
    fontSize: '0.75rem',
    color: textLight,
  },
  skillDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '0.25rem',
    backgroundColor: white,
    border: `1px solid ${borderGray}`,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '300px',
  },
  skillDropdownHeader: {
    padding: '0.75rem',
    borderBottom: `1px solid ${borderGray}`,
    backgroundColor: white,
  },
  skillSearchInput: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: `1px solid ${borderGray}`,
    borderRadius: '6px',
    fontSize: '0.875rem',
    outline: 'none',
    backgroundColor: white,
    color: textDark,
  },
  skillDropdownList: {
    maxHeight: '250px',
    overflowY: 'auto',
  },
  skillDropdownItem: {
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: textDark,
    borderBottom: `1px solid ${borderGray}`,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    transition: 'background-color 0.2s',
  },
  checkbox: {
    cursor: 'pointer',
  },
  selectedSkills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  skillTag: {
    padding: '0.25rem 0.75rem',
    backgroundColor: activeSidebarBg,
    borderRadius: '12px',
    fontSize: '0.75rem',
    color: primaryPurple,
    fontWeight: '500',
  },
  tableCard: {
    backgroundColor: white,
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    border: `1px solid ${borderGray}`,
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    padding: '1rem',
    textAlign: 'left',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: textDark,
    backgroundColor: '#f9f9f9',
    borderBottom: `1px solid ${borderGray}`,
  },
  tableRow: {
    borderBottom: `1px solid ${borderGray}`,
    transition: 'background-color 0.2s',
  },
  tableRowLast: {
    borderBottom: 'none',
  },
  tableCell: {
    padding: '1rem',
    fontSize: '0.875rem',
    color: textDark,
  },
  panelName: {
    fontWeight: '500',
    color: textDark,
    marginBottom: '0.25rem',
  },
  panelEmail: {
    fontSize: '0.75rem',
    color: textLight,
  },
  candidateName: {
    fontWeight: '500',
    color: textDark,
    marginBottom: '0.25rem',
  },
  candidateEmail: {
    fontSize: '0.75rem',
    color: textLight,
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  progressBar: {
    flex: 1,
    height: '8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: primaryPurple,
    transition: 'width 0.3s',
  },
  progressText: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: textDark,
    minWidth: '40px',
    textAlign: 'right',
  },
  matchedSkills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: `1px solid ${borderGray}`,
  },
  submitButton: {
    padding: '0.75rem 2rem',
    backgroundColor: primaryPurple,
    color: white,
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
  },
  slotsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  slotBadge: {
    padding: '0.5rem 0.75rem',
    backgroundColor: activeSidebarBg,
    borderRadius: '4px',
    fontSize: '0.75rem',
    color: primaryPurple,
    fontWeight: '500',
  },
  bookButton: {
    padding: '0.5rem 1rem',
    backgroundColor: primaryPurple,
    color: white,
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
  },
  bookButtonsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  bookSlotButton: {
    padding: '0.5rem 0.75rem',
    backgroundColor: primaryPurple,
    color: white,
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    whiteSpace: 'nowrap',
  },
  levelBadge: {
    padding: '0.25rem 0.75rem',
    backgroundColor: activeSidebarBg,
    color: primaryPurple,
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: white,
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  emptyMessage: {
    textAlign: 'center',
    color: textLight,
    padding: '2rem',
    fontSize: '0.875rem',
  },
  errorBanner: {
    position: 'sticky',
    top: '3.5rem',
    zIndex: 40,
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
    backgroundColor: 'transparent',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '1.125rem',
    padding: '0.25rem',
    lineHeight: 1,
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
    backgroundColor: primaryPurple,
    color: white,
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
  },
  positionBadge: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#e8f4f8',
    color: '#0066cc',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  experienceBadge: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#f0f8e8',
    color: '#006600',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  countBadge: {
    padding: '0.25rem 0.75rem',
    backgroundColor: primaryPurple,
    color: white,
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: '600',
    display: 'inline-block',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    gap: '1rem',
  },
  loader: {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderLeftColor: primaryPurple,
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '1rem',
    color: textLight,
    fontWeight: '500',
  },
}
