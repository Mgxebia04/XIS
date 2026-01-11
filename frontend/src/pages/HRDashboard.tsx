import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import type {
  Skill,
  InterviewLevel,
  MatchedPanel,
  ScheduledInterview,
  AvailabilitySlot,
} from '@/types'
import { formatDate, getMinDateTime, isFutureDateTime } from '@/utils/dateUtils'

export const HRDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Form state
  const [candidateName, setCandidateName] = useState('')
  const [candidateEmail, setCandidateEmail] = useState('')
  const [interviewLevel, setInterviewLevel] = useState<InterviewLevel>('L1')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewTime, setInterviewTime] = useState('')

  // Available skills (from API/master list)
  const [availableSkills] = useState<Skill[]>([
    { id: '1', name: 'React', type: 'PRIMARY' },
    { id: '2', name: 'TypeScript', type: 'PRIMARY' },
    { id: '3', name: 'Node.js', type: 'PRIMARY' },
    { id: '4', name: 'Python', type: 'SECONDARY' },
    { id: '5', name: 'Java', type: 'SECONDARY' },
    { id: '6', name: 'AWS', type: 'SECONDARY' },
    { id: '7', name: 'Docker', type: 'PRIMARY' },
    { id: '8', name: 'Kubernetes', type: 'SECONDARY' },
    { id: '9', name: 'MongoDB', type: 'SECONDARY' },
    { id: '10', name: 'PostgreSQL', type: 'SECONDARY' },
  ])

  // Matched panels (mock data - will be replaced with API call)
  const [matchedPanels, setMatchedPanels] = useState<MatchedPanel[]>([])
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false)
  const [skillSearchQuery, setSkillSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const skillDropdownRef = useRef<HTMLDivElement>(null)

  // Scheduled interviews
  const [scheduledInterviews, setScheduledInterviews] = useState<
    ScheduledInterview[]
  >([
    {
      id: '1',
      candidateName: 'John Doe',
      candidateEmail: 'john.doe@example.com',
      panelName: 'Jane Smith',
      panelEmail: 'jane.smith@example.com',
      level: 'L1',
      date: '2024-01-20',
      startTime: '10:00',
      endTime: '11:00',
      skills: ['React', 'TypeScript'],
      status: 'SCHEDULED',
    },
  ])

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

  // Memoize min date/time
  const minDateTime = useMemo(() => getMinDateTime(), [])

  // Memoize filtered skills based on search query
  const filteredSkills = useMemo(() => {
    const query = skillSearchQuery.toLowerCase()
    return availableSkills.filter(
      (skill) =>
        skill.name.toLowerCase().includes(query) &&
        !selectedSkills.includes(skill.id)
    )
  }, [availableSkills, skillSearchQuery, selectedSkills])

  // Handle form submission to find matching panels
  const handleSubmitForm = useCallback(() => {
    if (!candidateName || !candidateEmail || selectedSkills.length === 0) {
      setError('Please fill in candidate name, email, and select at least one skill')
      setTimeout(() => setError(null), 5000)
      return
    }
    setError(null)

    // Mock API call - will be replaced with actual API
    // This simulates getting matched panels with availability slots
    const mockMatchedPanels: MatchedPanel[] = [
      {
        id: '1',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        matchPercentage: 85,
        matchedSkills: ['React', 'TypeScript'],
        panelSkills: [
          { id: '1', name: 'React', type: 'PRIMARY' },
          { id: '2', name: 'TypeScript', type: 'PRIMARY' },
          { id: '3', name: 'Node.js', type: 'PRIMARY' },
        ],
        availabilitySlots: interviewDate && interviewTime
          ? [
              // If date/time provided, show slots matching that time
              (() => {
                const [hours, minutes] = interviewTime.split(':')
                const endHour = String(parseInt(hours) + 1).padStart(2, '0')
                return { id: '1', date: interviewDate, startTime: interviewTime, endTime: `${endHour}:${minutes}` }
              })(),
            ]
          : [
              // If no date/time, show all available slots
              { id: '1', date: '2024-01-20', startTime: '09:00', endTime: '10:00' },
              { id: '2', date: '2024-01-20', startTime: '14:00', endTime: '15:00' },
              { id: '3', date: '2024-01-21', startTime: '10:00', endTime: '11:00' },
            ],
      },
      {
        id: '2',
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        matchPercentage: 70,
        matchedSkills: ['React', 'Node.js'],
        panelSkills: [
          { id: '1', name: 'React', type: 'PRIMARY' },
          { id: '3', name: 'Node.js', type: 'PRIMARY' },
          { id: '4', name: 'Python', type: 'SECONDARY' },
        ],
        availabilitySlots: interviewDate && interviewTime
          ? [
              (() => {
                const [hours, minutes] = interviewTime.split(':')
                const endHour = String(parseInt(hours) + 1).padStart(2, '0')
                return { id: '1', date: interviewDate, startTime: interviewTime, endTime: `${endHour}:${minutes}` }
              })(),
            ]
          : [
              { id: '1', date: '2024-01-20', startTime: '11:00', endTime: '12:00' },
              { id: '2', date: '2024-01-22', startTime: '15:00', endTime: '16:00' },
            ],
      },
      {
        id: '3',
        name: 'Alice Williams',
        email: 'alice.williams@example.com',
        matchPercentage: 60,
        matchedSkills: ['TypeScript'],
        panelSkills: [
          { id: '2', name: 'TypeScript', type: 'PRIMARY' },
          { id: '5', name: 'Java', type: 'SECONDARY' },
        ],
        availabilitySlots: interviewDate && interviewTime
          ? [
              (() => {
                const [hours, minutes] = interviewTime.split(':')
                const endHour = String(parseInt(hours) + 1).padStart(2, '0')
                return { id: '1', date: interviewDate, startTime: interviewTime, endTime: `${endHour}:${minutes}` }
              })(),
            ]
          : [
              { id: '1', date: '2024-01-21', startTime: '09:00', endTime: '10:00' },
              { id: '2', date: '2024-01-23', startTime: '13:00', endTime: '14:00' },
            ],
      },
    ]
    
    // Update matched panels - this will trigger re-render
    setMatchedPanels(mockMatchedPanels)
  }, [candidateName, candidateEmail, selectedSkills, interviewDate, interviewTime, interviewLevel])

  const handleLogout = useCallback(async () => {
    await logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  const toggleSkill = useCallback((skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId]
    )
  }, [])

  const handleBookInterview = useCallback(
    (panelId: string, slot?: AvailabilitySlot) => {
      if (!candidateName || !candidateEmail) {
        setError('Please fill in candidate name and email')
        setTimeout(() => setError(null), 5000)
        return
      }

      const panel = matchedPanels.find((p) => p.id === panelId)
      if (!panel) {
        setError('Panel not found')
        setTimeout(() => setError(null), 5000)
        return
      }

      // Use provided slot or first available slot
      const selectedSlot = slot || panel.availabilitySlots[0]
      if (!selectedSlot) {
        setError('No availability slot selected')
        setTimeout(() => setError(null), 5000)
        return
      }
      setError(null)

    const newInterview: ScheduledInterview = {
      id: Date.now().toString(),
      candidateName,
      candidateEmail,
      panelName: panel.name,
      panelEmail: panel.email,
      level: interviewLevel,
      date: selectedSlot.date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      skills: selectedSkills.map(
        (id) => availableSkills.find((s) => s.id === id)?.name || ''
      ),
      status: 'SCHEDULED',
      hrName: user?.name || '',
      hrEmail: user?.email || '',
    }

      setScheduledInterviews((prev) => [...prev, newInterview])
      // Reset form
      setCandidateName('')
      setCandidateEmail('')
      setSelectedSkills([])
      setInterviewDate('')
      setInterviewTime('')
      setMatchedPanels([])
    },
    [
      candidateName,
      candidateEmail,
      selectedSkills,
      interviewLevel,
      matchedPanels,
      user,
      availableSkills,
    ]
  )

  const handleCancelInterview = useCallback((interviewId: string) => {
    setScheduledInterviews((prev) =>
      prev.filter((interview) => interview.id !== interviewId)
    )
  }, [])

  // Memoize selected skill names
  const selectedSkillNames = useMemo(
    () =>
      selectedSkills
        .map((id) => availableSkills.find((s) => s.id === id)?.name)
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
            <span style={styles.sidebarTitle}>HR Dashboard</span>
          </div>
          <nav style={styles.nav}>
            <div style={styles.navSection}>
              <div style={styles.navItemActive}>
                <span style={styles.navIcon}>🏠</span>
                <span>Home</span>
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
                      Candidate Name <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="Enter candidate name"
                      style={styles.input}
                      className="input-focus"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Candidate Email <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="email"
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      placeholder="Enter candidate email"
                      style={styles.input}
                      className="input-focus"
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Interview Level <span style={styles.required}>*</span>
                    </label>
                    <select
                      value={interviewLevel}
                      onChange={(e) =>
                        setInterviewLevel(e.target.value as InterviewLevel)
                      }
                      style={styles.select}
                      className="input-focus"
                    >
                      <option value="L1">L1</option>
                      <option value="L2">L2</option>
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
                                onClick={() => toggleSkill(skill.id)}
                                style={styles.skillDropdownItem}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedSkills.includes(skill.id)}
                                  onChange={() => toggleSkill(skill.id)}
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
                          key={panel.id}
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
                              <div style={styles.panelEmail}>{panel.email}</div>
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
                              {panel.panelSkills.map((skill, idx) => (
                                <span key={idx} style={styles.skillTag}>
                                  {skill.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.slotsContainer}>
                              {panel.availabilitySlots.map((slot, idx) => (
                                <div key={idx} style={styles.slotBadge}>
                                  {formatDate(slot.date)} • {slot.startTime} - {slot.endTime}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            {panel.availabilitySlots.length === 1 ? (
                              <button
                                onClick={() => handleBookInterview(panel.id, panel.availabilitySlots[0])}
                                style={styles.bookButton}
                                className="button-hover"
                              >
                                Book
                              </button>
                            ) : (
                              <div style={styles.bookButtonsContainer}>
                                {panel.availabilitySlots.map((slot, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleBookInterview(panel.id, slot)}
                                    style={styles.bookSlotButton}
                                    className="button-hover"
                                  >
                                    Book {formatDate(slot.date).split(',')[0]} {slot.startTime}
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
const primaryPurple = '#5F256E'
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
}
