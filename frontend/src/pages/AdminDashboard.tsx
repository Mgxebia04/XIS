import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { apiService } from '@/services/api'
import { formatDate } from '@/utils/dateUtils'

interface PanelRequest {
  id: number
  requestedByUserId: number
  requestedByUserName: string
  requestedByUserEmail: string
  panelName: string
  panelEmail: string
  notes?: string
  status: string
  createdAt: string
  processedAt?: string
}

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // HR Onboarding state
  const [hrName, setHrName] = useState('')
  const [hrEmail, setHrEmail] = useState('')
  const [hrPassword, setHrPassword] = useState('')
  const [isOnboardingHr, setIsOnboardingHr] = useState(false)

  // Panel Requests state
  const [panelRequests, setPanelRequests] = useState<PanelRequest[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(true)
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)
  const [panelPassword, setPanelPassword] = useState('')
  const [isCreatingPanel, setIsCreatingPanel] = useState(false)
  const [isRejectingRequest, setIsRejectingRequest] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const hasLoadedRequests = useRef(false)
  useEffect(() => {
    if (hasLoadedRequests.current) return
    hasLoadedRequests.current = true

    const loadPanelRequests = async () => {
      try {
        setIsLoadingRequests(true)
        setError(null)
        const requests = await apiService.getPanelRequests()
        setPanelRequests(requests)
      } catch (err: any) {
        setError('Failed to load panel requests: ' + (err.response?.data?.message || err.message || 'Unknown error'))
        hasLoadedRequests.current = false
      } finally {
        setIsLoadingRequests(false)
      }
    }
    loadPanelRequests()
  }, [])

  // Refresh panel requests
  const refreshPanelRequests = useCallback(async () => {
    try {
      const requests = await apiService.getPanelRequests()
      setPanelRequests(requests)
    } catch (err: any) {
      setError('Failed to refresh panel requests: ' + (err.message || 'Unknown error'))
    }
  }, [])

  const handleLogout = useCallback(async () => {
    await logout()
    navigate('/login', { replace: true })
  }, [logout, navigate])

  const handleOnboardHr = useCallback(async () => {
    if (!hrName || !hrEmail || !hrPassword) {
      setError('Please fill in all fields')
      return
    }

    if (hrPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setError(null)
    setIsOnboardingHr(true)

    try {
      await apiService.onboardHr({
        name: hrName,
        email: hrEmail,
        initialPassword: hrPassword,
      })
      setSuccess('HR user onboarded successfully')
      setHrName('')
      setHrEmail('')
      setHrPassword('')
      setTimeout(() => setSuccess(null), 5000)
    } catch (err: any) {
      setError('Failed to onboard HR: ' + (err.response?.data?.message || err.message || 'Unknown error'))
    } finally {
      setIsOnboardingHr(false)
    }
  }, [hrName, hrEmail, hrPassword])

  const handleCreatePanel = useCallback(async () => {
    if (!selectedRequestId || !panelPassword) {
      setError('Please select a request and provide initial password')
      return
    }

    if (panelPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setError(null)
    setIsCreatingPanel(true)

    try {
      await apiService.createPanel({
        panelRequestId: selectedRequestId,
        initialPassword: panelPassword,
      })
      setSuccess('Panel member created successfully')
      setSelectedRequestId(null)
      setPanelPassword('')
      await refreshPanelRequests()
      setTimeout(() => setSuccess(null), 5000)
    } catch (err: any) {
      setError('Failed to create panel member: ' + (err.response?.data?.message || err.message || 'Unknown error'))
    } finally {
      setIsCreatingPanel(false)
    }
  }, [selectedRequestId, panelPassword, refreshPanelRequests])

  const handleRejectRequest = useCallback(
    async (requestId: number) => {
      if (!confirm('Are you sure you want to reject this panel request?')) {
        return
      }

      setError(null)
      setIsRejectingRequest(true)

      try {
        await apiService.rejectPanelRequest(requestId)
        setSuccess('Panel request rejected')
        await refreshPanelRequests()
        setTimeout(() => setSuccess(null), 5000)
      } catch (err: any) {
        setError('Failed to reject request: ' + (err.response?.data?.message || err.message || 'Unknown error'))
      } finally {
        setIsRejectingRequest(false)
      }
    },
    [refreshPanelRequests]
  )

  const pendingRequests = useMemo(
    () => panelRequests.filter((r) => r.status === 'PENDING'),
    [panelRequests]
  )

  return (
    <div style={styles.container}>
      {/* Error/Success Banner */}
      {error && (
        <div style={styles.errorBanner} className="notification-enter fade-in-down">
          <span style={styles.errorIcon}>⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={styles.errorClose} className="button-hover" aria-label="Close error">
            ✕
          </button>
        </div>
      )}
      {success && (
        <div style={styles.successBanner} className="notification-enter fade-in-down">
          <span style={styles.successIcon}>✓</span>
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} style={styles.errorClose} className="button-hover" aria-label="Close success">
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
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div style={styles.userNameContainer}>
              <span style={styles.userName}>{user?.name}</span>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton} className="button-hover">
            Logout
          </button>
        </div>
      </header>

      <div style={styles.layout}>
        {/* Sidebar */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <span style={styles.sidebarTitle}>
              <span style={styles.sidebarTitleIcon}>⚙️</span>
              Admin Dashboard
            </span>
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
              <p style={styles.greetingSubtitle}>Welcome to XIS Admin Dashboard</p>
            </div>

            {/* HR Onboarding Section */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Onboard HR User</h2>
              <div style={styles.card}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      HR Name <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      value={hrName}
                      onChange={(e) => setHrName(e.target.value)}
                      placeholder="Enter HR name"
                      style={styles.input}
                      className="input-focus"
                      disabled={isOnboardingHr}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      HR Email <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="email"
                      value={hrEmail}
                      onChange={(e) => setHrEmail(e.target.value)}
                      placeholder="Enter HR email"
                      style={styles.input}
                      className="input-focus"
                      disabled={isOnboardingHr}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Initial Password <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="password"
                      value={hrPassword}
                      onChange={(e) => setHrPassword(e.target.value)}
                      placeholder="Enter initial password (min 6 chars)"
                      style={styles.input}
                      className="input-focus"
                      disabled={isOnboardingHr}
                    />
                  </div>
                </div>
                <button
                  onClick={handleOnboardHr}
                  style={styles.submitButton}
                  className="button-hover"
                  disabled={isOnboardingHr || !hrName || !hrEmail || !hrPassword}
                >
                  {isOnboardingHr ? 'Onboarding...' : 'Onboard HR'}
                </button>
              </div>
            </section>

            {/* Panel Requests Section */}
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Panel Requests</h2>
                <button onClick={refreshPanelRequests} style={styles.refreshButton} className="button-hover">
                  🔄 Refresh
                </button>
              </div>
              <div style={styles.card}>
                {isLoadingRequests ? (
                  <div style={styles.loadingContainer}>
                    <div style={styles.loader}></div>
                    <p style={styles.loadingText}>Loading panel requests...</p>
                  </div>
                ) : pendingRequests.length > 0 ? (
                  <div style={styles.requestsList}>
                    {pendingRequests.map((request) => (
                      <div key={request.id} style={styles.requestCard} className="fade-in-up card-hover">
                        <div style={styles.requestInfo}>
                          <div style={styles.requestHeader}>
                            <h3 style={styles.requestPanelName}>{request.panelName}</h3>
                            <span style={styles.requestBadge}>Pending</span>
                          </div>
                          <p style={styles.requestEmail}>{request.panelEmail}</p>
                          <div style={styles.requestDetails}>
                            <div style={styles.requestDetailItem}>
                              <span style={styles.detailIcon}>👤</span>
                              <div>
                                <span style={styles.detailLabel}>Requested by:</span>
                                <span style={styles.detailValue}>
                                  {request.requestedByUserName} ({request.requestedByUserEmail})
                                </span>
                              </div>
                            </div>
                            <div style={styles.requestDetailItem}>
                              <span style={styles.detailIcon}>📅</span>
                              <span style={styles.detailValue}>{formatDate(request.createdAt)}</span>
                            </div>
                            {request.notes && (
                              <div style={styles.requestDetailItem}>
                                <span style={styles.detailIcon}>📝</span>
                                <span style={styles.detailValue}>{request.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={styles.requestActions}>
                          <div style={styles.passwordInputGroup}>
                            <input
                              type="password"
                              value={selectedRequestId === request.id ? panelPassword : ''}
                              onChange={(e) => {
                                setSelectedRequestId(request.id)
                                setPanelPassword(e.target.value)
                              }}
                              placeholder="Initial password (min 6 chars)"
                              style={styles.passwordInput}
                              className="input-focus"
                              disabled={isCreatingPanel || isRejectingRequest}
                            />
                          </div>
                          <div style={styles.actionButtons}>
                            <button
                              onClick={() => handleCreatePanel()}
                              style={styles.approveButton}
                              className="button-hover"
                              disabled={
                                isCreatingPanel ||
                                isRejectingRequest ||
                                selectedRequestId !== request.id ||
                                !panelPassword ||
                                panelPassword.length < 6
                              }
                            >
                              {isCreatingPanel ? 'Creating...' : 'Approve & Create'}
                            </button>
                            <button
                              onClick={() => handleRejectRequest(request.id)}
                              style={styles.rejectButton}
                              className="button-hover"
                              disabled={isCreatingPanel || isRejectingRequest}
                            >
                              {isRejectingRequest ? 'Rejecting...' : 'Reject'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyStateCard}>
                    <span style={styles.emptyStateIcon}>📋</span>
                    <p style={styles.emptyStateTitle}>No pending panel requests</p>
                    <p style={styles.emptyStateMessage}>
                      Panel requests from HR will appear here for approval
                    </p>
                  </div>
                )}
              </div>
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
const lightGray = '#f5f5f5'

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
  profileImage: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: white,
    fontSize: '1rem',
    fontWeight: '700',
    border: '2px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  userNameContainer: {
    display: 'flex',
    flexDirection: 'column',
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
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: textDark,
    marginBottom: '1.5rem',
  },
  card: {
    backgroundColor: white,
    padding: '1.75rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${borderGray}`,
    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
    minWidth: '200px',
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
    padding: '0.625rem 0.75rem',
    border: `1px solid ${borderGray}`,
    borderRadius: '6px',
    fontSize: '0.875rem',
    backgroundColor: white,
    color: textDark,
    transition: 'all 0.2s',
  },
  submitButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: primaryPurple,
    color: white,
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 2px 4px rgba(74, 30, 71, 0.2)',
  },
  refreshButton: {
    padding: '0.5rem 1rem',
    backgroundColor: primaryPurple,
    color: white,
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 2px 4px rgba(74, 30, 71, 0.2)',
  },
  requestsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  requestCard: {
    backgroundColor: white,
    padding: '1.5rem',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${borderGray}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1.5rem',
    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  requestInfo: {
    flex: 1,
  },
  requestHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
    gap: '1rem',
  },
  requestPanelName: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: textDark,
    margin: 0,
  },
  requestBadge: {
    padding: '0.375rem 0.75rem',
    backgroundColor: '#ffc107',
    color: '#856404',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  requestEmail: {
    fontSize: '0.875rem',
    color: textLight,
    marginBottom: '1rem',
  },
  requestDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  requestDetailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  detailIcon: {
    fontSize: '0.875rem',
  },
  detailLabel: {
    fontSize: '0.75rem',
    color: textLight,
    fontWeight: '500',
    marginRight: '0.5rem',
  },
  detailValue: {
    fontSize: '0.875rem',
    color: textDark,
    fontWeight: '500',
  },
  requestActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    minWidth: '250px',
  },
  passwordInputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  passwordInput: {
    padding: '0.625rem 0.75rem',
    border: `1px solid ${borderGray}`,
    borderRadius: '6px',
    fontSize: '0.875rem',
    backgroundColor: white,
    color: textDark,
    transition: 'all 0.2s',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  approveButton: {
    flex: 1,
    padding: '0.625rem 1rem',
    backgroundColor: '#10b981',
    color: white,
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
  },
  rejectButton: {
    padding: '0.625rem 1rem',
    backgroundColor: '#dc3545',
    color: white,
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 4px rgba(220, 53, 69, 0.2)',
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
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 2rem',
    gap: '1rem',
  },
  loader: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #4a1e47',
    borderRadius: '50%',
    animation: 'spin-smooth 0.8s linear infinite',
  },
  loadingText: {
    fontSize: '0.875rem',
    color: textLight,
    margin: 0,
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
  successBanner: {
    position: 'sticky',
    top: '3.5rem',
    zIndex: 40,
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '0.75rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    borderBottom: '1px solid #c3e6cb',
    fontSize: '0.875rem',
  },
  successIcon: {
    fontSize: '1rem',
  },
}
