// AIModified:2026-01-12T02:57:00Z
import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { apiService } from '@/services/api'
import type { InterviewerStats } from '@/types'

export const Interviewers: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [interviewersStats, setInterviewersStats] = useState<InterviewerStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedInterviewer, setSelectedInterviewer] = useState<InterviewerStats | null>(null)

  const hasLoadedData = useRef(false)

  useEffect(() => {
    if (hasLoadedData.current) return
    hasLoadedData.current = true

    const loadInterviewersStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const stats = await apiService.getAllInterviewersWithStats()
        setInterviewersStats(stats)
      } catch (err: any) {
        console.error('Error loading interviewers stats:', err)
        setError('Failed to load interviewers: ' + (err.response?.data?.message || err.message || 'Unknown error'))
        hasLoadedData.current = false
      } finally {
        setIsLoading(false)
      }
    }

    loadInterviewersStats()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleInterviewerClick = (interviewer: InterviewerStats) => {
    setSelectedInterviewer(interviewer)
  }

  const handleBackToList = () => {
    setSelectedInterviewer(null)
  }

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
              <div
                style={styles.navItem}
                onClick={() => navigate('/hr-dashboard')}
                className="nav-item-hover"
              >
                <span style={styles.navIcon}>🏠</span>
                <span>Home</span>
              </div>
              <div style={styles.navItemActive}>
                <span style={styles.navIcon}>👥</span>
                <span>Interviewers</span>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main style={styles.main}>
          <div style={styles.contentWrapper}>
            <div style={styles.greeting}>
              <h1 style={styles.greetingTitle}>Interviewers</h1>
              <p style={styles.greetingSubtitle}>
                View all interviewers and their completed interview statistics
              </p>
            </div>

            {isLoading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.loader}></div>
                <p style={styles.loadingText}>Loading interviewers...</p>
              </div>
            ) : selectedInterviewer ? (
              <div style={styles.detailCard} className="fade-in-up">
                <button onClick={handleBackToList} style={styles.backButton} className="button-hover">
                  ← Back to List
                </button>
                <div style={styles.detailContent}>
                  <h2 style={styles.detailTitle}>{selectedInterviewer.name}</h2>
                  <div style={styles.detailInfo}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Email:</span>
                      <span style={styles.detailValue}>{selectedInterviewer.email}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Experience:</span>
                      <span style={styles.detailValue}>{selectedInterviewer.experience}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Level:</span>
                      <span style={styles.detailValue}>{selectedInterviewer.level}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Total Completed Interviews:</span>
                      <span style={styles.countBadgeLarge}>{selectedInterviewer.totalCompletedInterviews}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : interviewersStats.length > 0 ? (
              <div style={styles.tableCard} className="fade-in-up">
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Name</th>
                      <th style={styles.tableHeader}>Email</th>
                      <th style={styles.tableHeader}>Experience</th>
                      <th style={styles.tableHeader}>Level</th>
                      <th style={styles.tableHeader}>Completed Interviews</th>
                      <th style={styles.tableHeader}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interviewersStats.map((interviewer, index) => (
                      <tr
                        key={interviewer.interviewerProfileId}
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
                          <div style={styles.panelName}>{interviewer.name}</div>
                        </td>
                        <td style={styles.tableCell}>
                          <div style={styles.panelEmail}>{interviewer.email}</div>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={styles.experienceBadge}>{interviewer.experience}</span>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={styles.levelBadge}>{interviewer.level}</span>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={styles.countBadge}>
                            {interviewer.totalCompletedInterviews}
                          </span>
                        </td>
                        <td style={styles.tableCell}>
                          <button
                            onClick={() => handleInterviewerClick(interviewer)}
                            style={styles.viewButton}
                            className="button-hover"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={styles.emptyMessage}>No interviewers found</p>
            )}
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

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: white,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: primaryPurple,
    color: white,
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  headerTitleX: {
    fontSize: '2.5rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
    color: white,
  },
  headerTitleText: {
    color: white,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  profileContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  profileImage: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: white,
    color: primaryPurple,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  userNameContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: white,
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    color: white,
    border: `1px solid ${white}`,
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
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
    boxShadow: '2px 0 4px rgba(0,0,0,0.05)',
  },
  sidebarHeader: {
    padding: '1.5rem 1rem',
    borderBottom: `1px solid ${borderGray}`,
  },
  sidebarTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: textDark,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  sidebarTitleIcon: {
    fontSize: '1.25rem',
  },
  nav: {
    flex: 1,
    padding: '1rem 0',
  },
  navSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  navItem: {
    padding: '0.875rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    color: textDark,
    fontSize: '0.9375rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  navItemActive: {
    padding: '0.875rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: activeSidebarBg,
    color: textDark,
    fontSize: '0.9375rem',
    fontWeight: '600',
    borderLeft: `3px solid ${primaryPurple}`,
  },
  navIcon: {
    fontSize: '1.125rem',
  },
  main: {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#f0f2f5',
    padding: '2rem',
  },
  contentWrapper: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  greeting: {
    marginBottom: '2rem',
  },
  greetingTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: textDark,
    marginBottom: '0.5rem',
  },
  greetingSubtitle: {
    fontSize: '1rem',
    color: textLight,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
    gap: '1rem',
  },
  loader: {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderLeftColor: primaryPurple,
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '1rem',
    color: textLight,
    fontWeight: '500',
  },
  tableCard: {
    backgroundColor: white,
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    padding: '1rem',
    textAlign: 'left',
    borderBottom: `2px solid ${borderGray}`,
    fontWeight: '600',
    color: textDark,
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tableRow: {
    borderBottom: `1px solid ${borderGray}`,
  },
  tableCell: {
    padding: '1rem',
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
  experienceBadge: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#f0f8e8',
    color: '#006600',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  levelBadge: {
    padding: '0.25rem 0.75rem',
    backgroundColor: activeSidebarBg,
    color: primaryPurple,
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
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
  countBadgeLarge: {
    padding: '0.5rem 1rem',
    backgroundColor: primaryPurple,
    color: white,
    borderRadius: '12px',
    fontSize: '1.25rem',
    fontWeight: '700',
    display: 'inline-block',
  },
  viewButton: {
    padding: '0.5rem 1rem',
    backgroundColor: primaryPurple,
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
  detailCard: {
    backgroundColor: white,
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    color: primaryPurple,
    border: `1px solid ${primaryPurple}`,
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '1.5rem',
    transition: 'background-color 0.2s',
  },
  detailContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  detailTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: textDark,
    marginBottom: '0.5rem',
  },
  detailInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
  },
  detailLabel: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: textDark,
    minWidth: '200px',
  },
  detailValue: {
    fontSize: '0.9375rem',
    color: textLight,
  },
}
