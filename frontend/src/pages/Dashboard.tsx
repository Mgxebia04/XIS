// AIModified:2026-01-11T06:08:23Z
import React, { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  // Redirect to role-specific dashboard
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin-dashboard', { replace: true })
      } else if (user.role === 'HR') {
        navigate('/hr-dashboard', { replace: true })
      } else if (user.role === 'PANEL') {
        navigate('/panel-dashboard', { replace: true })
      }
    }
  }, [user, isLoading, navigate])

  // Show loading while redirecting
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <p>Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: '1rem 2rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  content: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
}
