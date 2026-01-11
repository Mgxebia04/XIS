// AIModified:2026-01-11T10:09:38Z
import React, { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { LoginCredentials } from '@/types'

export const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      // Dashboard component will handle role-based redirection
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const credentials: LoginCredentials = { email, password }
      await login(credentials)
      // After successful login, redirect to dashboard which will route based on role from backend
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Header matching dashboard theme */}
      <header style={styles.header}>
        <span style={styles.headerTitle}>XIS - Interview Scheduler</span>
      </header>
      <div style={styles.content}>
        <div style={styles.card}>
          <h1 style={styles.title}>Welcome Back</h1>
          <h2 style={styles.subtitle}>Sign In to continue</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            {error && (
              <div style={styles.error} className="fade-in">
                <span style={styles.errorIcon}>⚠️</span>
                <span style={styles.errorText}>{error}</span>
                <button
                  onClick={() => setError(null)}
                  style={styles.errorClose}
                  aria-label="Close error"
                >
                  ✕
                </button>
              </div>
            )}
            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                placeholder="Enter your email"
                className="input-focus"
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                placeholder="Enter your password"
                className="input-focus"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              style={styles.button}
              className="button-hover"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// Color palette matching the exact design system
const primaryPurple = '#5F256E'
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
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    fontSize: '0.875rem',
  },
  headerTitle: {
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    backgroundColor: white,
  },
  card: {
    backgroundColor: white,
    padding: '2.5rem',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    border: `1px solid ${borderGray}`,
    width: '100%',
    maxWidth: '420px',
    animation: 'fadeInUp 0.4s ease-out',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    textAlign: 'center',
    color: textDark,
  },
  subtitle: {
    fontSize: '1rem',
    marginBottom: '2rem',
    textAlign: 'center',
    color: textLight,
    fontWeight: 'normal',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: textDark,
  },
  input: {
    padding: '0.75rem',
    border: `1px solid ${borderGray}`,
    borderRadius: '4px',
    fontSize: '0.875rem',
    outline: 'none',
    backgroundColor: white,
    color: textDark,
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: primaryPurple,
    color: white,
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'background-color 0.2s, transform 0.1s',
  },
  error: {
    padding: '0.75rem',
    backgroundColor: '#fee',
    color: '#dc3545',
    borderRadius: '4px',
    fontSize: '0.875rem',
    border: '1px solid #fcc',
    animation: 'shake 0.3s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  errorIcon: {
    fontSize: '1rem',
    flexShrink: 0,
  },
  errorText: {
    flex: 1,
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
    flexShrink: 0,
  },
}
