import React, { useEffect } from 'react'

interface ErrorDisplayProps {
  error: string | null
  onDismiss?: () => void
  type?: 'error' | 'warning' | 'info'
  autoDismiss?: boolean
  autoDismissDelay?: number
  className?: string
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onDismiss,
  type = 'error',
  autoDismiss = false,
  autoDismissDelay = 5000,
  className = '',
}) => {
  useEffect(() => {
    if (autoDismiss && error && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss()
      }, autoDismissDelay)
      return () => clearTimeout(timer)
    }
  }, [error, autoDismiss, autoDismissDelay, onDismiss])

  if (!error) return null

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      case 'error':
      default:
        return '❌'
    }
  }

  const getStyles = () => {
    const baseStyles: React.CSSProperties = {
      padding: '0.75rem 1rem',
      borderRadius: '6px',
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      animation: 'slideDown 0.3s ease-out',
      position: 'relative',
    }

    switch (type) {
      case 'warning':
        return {
          ...baseStyles,
          backgroundColor: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeaa7',
        }
      case 'info':
        return {
          ...baseStyles,
          backgroundColor: '#d1ecf1',
          color: '#0c5460',
          border: '1px solid #bee5eb',
        }
      case 'error':
      default:
        return {
          ...baseStyles,
          backgroundColor: '#fee',
          color: '#dc3545',
          border: '1px solid #fcc',
        }
    }
  }

  return (
    <div
      style={getStyles()}
      className={`notification-enter fade-in-down ${type === 'error' ? 'shake' : ''} ${className}`}
      role="alert"
    >
      <span style={{ fontSize: '1rem', flexShrink: 0 }}>{getIcon()}</span>
      <span style={{ flex: 1 }}>{error}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            marginLeft: 'auto',
            backgroundColor: 'transparent',
            border: 'none',
            color: type === 'error' ? '#dc3545' : type === 'warning' ? '#856404' : '#0c5460',
            cursor: 'pointer',
            fontSize: '1.125rem',
            padding: '0.25rem',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'background-color 0.2s',
          }}
          className="button-hover"
          aria-label="Dismiss error"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}

interface SuccessDisplayProps {
  message: string | null
  onDismiss?: () => void
  autoDismiss?: boolean
  autoDismissDelay?: number
  className?: string
}

export const SuccessDisplay: React.FC<SuccessDisplayProps> = ({
  message,
  onDismiss,
  autoDismiss = true,
  autoDismissDelay = 5000,
  className = '',
}) => {
  useEffect(() => {
    if (autoDismiss && message && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss()
      }, autoDismissDelay)
      return () => clearTimeout(timer)
    }
  }, [message, autoDismiss, autoDismissDelay, onDismiss])

  if (!message) return null

  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        borderRadius: '6px',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        backgroundColor: '#d4edda',
        color: '#155724',
        border: '1px solid #c3e6cb',
        animation: 'slideDown 0.3s ease-out',
      }}
      className={`notification-enter fade-in-down ${className}`}
      role="alert"
    >
      <span style={{ fontSize: '1rem', flexShrink: 0 }}>✓</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            marginLeft: 'auto',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#155724',
            cursor: 'pointer',
            fontSize: '1.125rem',
            padding: '0.25rem',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'background-color 0.2s',
          }}
          className="button-hover"
          aria-label="Dismiss success message"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}
