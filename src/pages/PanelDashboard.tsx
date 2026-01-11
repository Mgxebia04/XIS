import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import type { Skill, AvailabilitySlot, Interview, SkillType } from '@/types'

export const PanelDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // All available skills (from API/master list)
  const [allAvailableSkills] = useState<Skill[]>([
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

  // Skills selected by the panel member
  const [mySkills, setMySkills] = useState<Skill[]>([
    { id: '1', name: 'React', type: 'PRIMARY' },
    { id: '2', name: 'TypeScript', type: 'PRIMARY' },
  ])

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
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([
    { id: '1', date: '2024-01-15', startTime: '09:00', endTime: '10:00' },
    { id: '2', date: '2024-01-15', startTime: '14:00', endTime: '15:00' },
  ])
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([
    {
      id: '1',
      candidateName: 'John Doe',
      candidateEmail: 'john.doe@example.com',
      date: '2024-01-16',
      startTime: '10:00',
      endTime: '11:00',
      skills: ['React', 'TypeScript'],
      status: 'SCHEDULED',
      hrName: 'Sarah Johnson',
      hrEmail: 'sarah.johnson@example.com',
    },
    {
      id: '2',
      candidateName: 'Jane Smith',
      candidateEmail: 'jane.smith@example.com',
      date: '2024-01-17',
      startTime: '14:00',
      endTime: '15:00',
      skills: ['Node.js', 'TypeScript'],
      status: 'SCHEDULED',
      hrName: 'Mike Williams',
      hrEmail: 'mike.williams@example.com',
    },
  ])
  const [pastInterviews, setPastInterviews] = useState<Interview[]>([
    {
      id: '3',
      candidateName: 'Bob Johnson',
      candidateEmail: 'bob.johnson@example.com',
      date: '2024-01-10',
      startTime: '10:00',
      endTime: '11:00',
      skills: ['React'],
      status: 'COMPLETED',
      hrName: 'Sarah Johnson',
      hrEmail: 'sarah.johnson@example.com',
    },
  ])
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming')

  // New availability slot form state
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
  })

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleAddSkill = (skill: Skill) => {
    // Add skill to mySkills if not already present
    if (!mySkills.find((s) => s.id === skill.id)) {
      setMySkills([...mySkills, { ...skill, type: 'PRIMARY' }])
    }
    setIsAddSkillDropdownOpen(false)
  }

  const handleDeleteSkill = (skillId: string) => {
    setMySkills(mySkills.filter((skill) => skill.id !== skillId))
  }

  const handleToggleSkillType = (skillId: string) => {
    setMySkills(
      mySkills.map((skill) =>
        skill.id === skillId
          ? { ...skill, type: skill.type === 'PRIMARY' ? 'SECONDARY' : 'PRIMARY' }
          : skill
      )
    )
  }

  // Get skills available to add (not already in mySkills, filtered by search)
  const availableSkillsToAdd = allAvailableSkills.filter(
    (skill) =>
      !mySkills.find((s) => s.id === skill.id) &&
      skill.name.toLowerCase().includes(skillSearchQuery.toLowerCase())
  )

  const handleAddAvailabilitySlot = () => {
    if (newSlot.date && newSlot.startTime && newSlot.endTime) {
      const slotDateTime = new Date(`${newSlot.date}T${newSlot.startTime}`)
      const now = new Date()
      
      // Only allow future timestamps
      if (slotDateTime > now) {
        const slot: AvailabilitySlot = {
          id: Date.now().toString(),
          date: newSlot.date,
          startTime: newSlot.startTime,
          endTime: newSlot.endTime,
        }
        setAvailabilitySlots([...availabilitySlots, slot])
        setNewSlot({ date: '', startTime: '', endTime: '' })
      }
    }
  }

  // Get minimum date/time for availability inputs (current date/time)
  const getMinDateTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
    }
  }

  const handleRemoveAvailabilitySlot = (id: string) => {
    setAvailabilitySlots(availabilitySlots.filter((slot) => slot.id !== id))
  }

  const handleCancelInterview = (id: string) => {
    setUpcomingInterviews(
      upcomingInterviews.filter((interview) => interview.id !== id)
    )
    // API call would go here
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div style={styles.container}>
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
              <div style={styles.skillsHeader}>
                <h2 style={styles.sectionTitle}>My Skills</h2>
                <div style={styles.addSkillContainer} ref={dropdownRef}>
                  <button
                    onClick={() => {
                      setIsAddSkillDropdownOpen(!isAddSkillDropdownOpen)
                      setSkillSearchQuery('')
                    }}
                    style={styles.addSkillButton}
                  >
                    + Add Skill
                  </button>
                  {isAddSkillDropdownOpen && (
                    <div style={styles.skillDropdown}>
                      <div style={styles.skillDropdownHeader}>
                        <input
                          type="text"
                          placeholder="Search skills..."
                          value={skillSearchQuery}
                          onChange={(e) => setSkillSearchQuery(e.target.value)}
                          style={{
                            ...styles.skillSearchInput,
                            ...(skillSearchQuery === '' ? { color: placeholderGray } : {}),
                          }}
                          autoFocus
                        />
                      </div>
                      <div style={styles.skillDropdownList}>
                        {availableSkillsToAdd.length > 0 ? (
                          availableSkillsToAdd.map((skill, index) => (
                            <div
                              key={skill.id}
                              onClick={() => handleAddSkill(skill)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = lightGray
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white'
                              }}
                              style={{
                                ...styles.skillDropdownItem,
                                ...(index === availableSkillsToAdd.length - 1
                                  ? { borderBottom: 'none' }
                                  : {}),
                              }}
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
                      className="fade-in-up"
                    >
                      <span style={styles.skillName}>{skill.name}</span>
                      <div style={styles.skillActions}>
                        <div style={styles.toggleContainer}>
                          <span style={styles.toggleLabel}>Primary</span>
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
                          <span style={styles.toggleLabel}>Secondary</span>
                        </div>
                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#fee'
                            e.currentTarget.style.transform = 'scale(1.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.transform = 'scale(1)'
                          }}
                          style={styles.deleteSkillButton}
                          title="Delete skill"
                          className="button-hover"
                        >
                          <span style={styles.deleteIcon}>✕</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={styles.emptyMessage}>No skills added yet. Click "Add Skill" to get started.</p>
                )}
              </div>
            </section>

            {/* Availability Management Section */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Availability Slots</h2>
              <div style={styles.availabilityCard}>
                <div style={styles.availabilityForm}>
                  <input
                    type="date"
                    value={newSlot.date}
                    min={getMinDateTime().date}
                    onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                    style={styles.dateInput}
                  />
                  <input
                    type="time"
                    value={newSlot.startTime}
                    min={
                      newSlot.date === getMinDateTime().date
                        ? getMinDateTime().time
                        : undefined
                    }
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, startTime: e.target.value })
                    }
                    style={styles.timeInput}
                  />
                  <span style={styles.timeSeparator}>to</span>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    min={newSlot.startTime || undefined}
                    onChange={(e) =>
                      setNewSlot({ ...newSlot, endTime: e.target.value })
                    }
                    style={styles.timeInput}
                  />
                  <button
                    onClick={handleAddAvailabilitySlot}
                    style={styles.addButton}
                    className="button-hover"
                  >
                    + Add Slot
                  </button>
                </div>
                <div style={styles.slotsList}>
                  {availabilitySlots.map((slot) => (
                    <div key={slot.id} style={styles.slotItem}>
                      <div style={styles.slotInfo}>
                        <span style={styles.slotDate}>{formatDate(slot.date)}</span>
                        <span style={styles.slotTime}>
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveAvailabilitySlot(slot.id)}
                        style={styles.removeButton}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {availabilitySlots.length === 0 && (
                    <p style={styles.emptyMessage}>No availability slots added</p>
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
                {(activeTab === 'upcoming' ? upcomingInterviews : pastInterviews).map(
                  (interview, index) => (
                    <div
                      key={interview.id}
                      style={{
                        ...styles.interviewCard,
                        animation: `fadeInUp 0.4s ease-out ${index * 0.1}s both`,
                      }}
                      className="fade-in-up"
                    >
                      <div style={styles.interviewInfo}>
                        <h3 style={styles.interviewCandidateName}>
                          {interview.candidateName}
                        </h3>
                        <p style={styles.interviewEmail}>{interview.candidateEmail}</p>
                        <p style={styles.interviewDate}>
                          {formatDate(interview.date)} • {interview.startTime} -{' '}
                          {interview.endTime}
                        </p>
                        <div style={styles.interviewSkills}>
                          {interview.skills.map((skill, idx) => (
                            <span key={idx} style={styles.skillTag}>
                              {skill}
                            </span>
                          ))}
                        </div>
                        {interview.hrName && (
                          <div style={styles.hrInfo}>
                            <span style={styles.hrLabel}>Scheduled by:</span>
                            <span style={styles.hrName}>{interview.hrName}</span>
                            {interview.hrEmail && (
                              <span style={styles.hrEmail}>({interview.hrEmail})</span>
                            )}
                          </div>
                        )}
                      </div>
                      {activeTab === 'upcoming' && (
                        <button
                          onClick={() => handleCancelInterview(interview.id)}
                          style={styles.cancelButton}
                          className="button-hover"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )
                )}
                {(activeTab === 'upcoming'
                  ? upcomingInterviews
                  : pastInterviews
                ).length === 0 && (
                  <p style={styles.emptyMessage}>
                    No {activeTab === 'upcoming' ? 'upcoming' : 'past'} interviews
                  </p>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
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
  skillsHeader: {
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
    padding: '0.5rem 1rem',
    backgroundColor: primaryPurple,
    color: white,
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'background-color 0.2s, transform 0.1s',
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
  },
  skillSearchInput: {
    width: '100%',
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
  },
  skillCard: {
    backgroundColor: white,
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: `1px solid ${borderGray}`,
    gap: '1rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  skillName: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: textDark,
    flex: 1,
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
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  },
  availabilityForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  dateInput: {
    padding: '0.5rem',
    border: `1px solid ${borderGray}`,
    borderRadius: '4px',
    fontSize: '0.875rem',
    backgroundColor: white,
    color: textDark,
  },
  timeInput: {
    padding: '0.5rem',
    border: `1px solid ${borderGray}`,
    borderRadius: '4px',
    fontSize: '0.875rem',
    backgroundColor: white,
    color: textDark,
  },
  timeSeparator: {
    fontSize: '0.875rem',
    color: textLight,
  },
  addButton: {
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
  slotsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  slotItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: white,
    border: `1px solid ${borderGray}`,
    borderRadius: '4px',
  },
  slotInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  slotDate: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: textDark,
  },
  slotTime: {
    fontSize: '0.75rem',
    color: textLight,
  },
  removeButton: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.75rem',
    cursor: 'pointer',
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
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  interviewInfo: {
    flex: 1,
  },
  interviewCandidateName: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: textDark,
    marginBottom: '0.5rem',
  },
  interviewEmail: {
    fontSize: '0.875rem',
    color: textLight,
    marginBottom: '0.5rem',
  },
  interviewDate: {
    fontSize: '0.875rem',
    color: textDark,
    marginBottom: '0.75rem',
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
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
  },
  emptyMessage: {
    textAlign: 'center',
    color: textLight,
    padding: '2rem',
    fontSize: '0.875rem',
  },
  hrInfo: {
    marginTop: '0.75rem',
    paddingTop: '0.75rem',
    borderTop: `1px solid ${borderGray}`,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  hrLabel: {
    fontSize: '0.75rem',
    color: textLight,
    fontWeight: '500',
  },
  hrName: {
    fontSize: '0.75rem',
    color: textDark,
    fontWeight: '500',
  },
  hrEmail: {
    fontSize: '0.75rem',
    color: textLight,
  },
}
