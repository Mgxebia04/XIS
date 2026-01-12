// AIModified:2026-01-11T10:09:38Z
import React, { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { LoginCredentials } from '@/types'
import { extractErrorMessage, isValidEmail, validateRequired } from '@/utils/errorUtils'
import { ErrorDisplay } from '@/components/ErrorDisplay'

export const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const validateForm = (): boolean => {
    let isValid = true
    setEmailError(null)
    setPasswordError(null)

    // Validate email
    const emailValidation = validateRequired(email, 'Email')
    if (!emailValidation.valid) {
      setEmailError(emailValidation.message || 'Email is required')
      isValid = false
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address')
      isValid = false
    }

    // Validate password
    const passwordValidation = validateRequired(password, 'Password')
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.message || 'Password is required')
      isValid = false
    }

    return isValid
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setEmailError(null)
    setPasswordError(null)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const credentials: LoginCredentials = { email: email.trim(), password }
      await login(credentials)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Header matching dashboard theme */}
      <header style={styles.header}>
        <span style={styles.headerTitle}>
          <span style={styles.headerTitleX}>X</span>
          <span style={styles.headerTitleText}> Interview Scheduler</span>
        </span>
      </header>
      <div style={styles.content}>
        <div style={styles.card}>
          <h1 style={styles.title}>Welcome Back</h1>
          <h2 style={styles.subtitle}>Sign In to continue</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <ErrorDisplay error={error} onDismiss={() => setError(null)} />
            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>
                Email <span style={styles.required}>*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (emailError) setEmailError(null)
                }}
                onBlur={() => {
                  if (email && !isValidEmail(email)) {
                    setEmailError('Please enter a valid email address')
                  }
                }}
                required
                style={{
                  ...styles.input,
                  ...(emailError ? styles.inputError : {}),
                }}
                placeholder="Enter your email"
                className="input-focus"
              />
              {emailError && (
                <span style={styles.fieldError} className="fade-in-down">
                  {emailError}
                </span>
              )}
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>
                Password <span style={styles.required}>*</span>
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (passwordError) setPasswordError(null)
                }}
                required
                style={{
                  ...styles.input,
                  ...(passwordError ? styles.inputError : {}),
                }}
                placeholder="Enter your password"
                className="input-focus"
              />
              {passwordError && (
                <span style={styles.fieldError} className="fade-in-down">
                  {passwordError}
                </span>
              )}
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
const primaryPurple = '#4a1e47'
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
    animation: 'fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
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
  required: {
    color: '#dc3545',
    marginLeft: '0.25rem',
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
  inputError: {
    borderColor: '#dc3545',
    boxShadow: '0 0 0 3px rgba(220, 53, 69, 0.1)',
  },
  fieldError: {
    fontSize: '0.75rem',
    color: '#dc3545',
    marginTop: '0.25rem',
    display: 'block',
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
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 4px rgba(74, 30, 71, 0.2)',
  },
  error: {
    padding: '0.75rem',
    backgroundColor: '#fee',
    color: '#dc3545',
    borderRadius: '4px',
    fontSize: '0.875rem',
    border: '1px solid #fcc',
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
