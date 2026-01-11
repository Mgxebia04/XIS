import React, { useState, useCallback } from 'react'
import { apiService } from '@/services/api'

interface ChangePasswordProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export const ChangePassword: React.FC<ChangePasswordProps> = ({ onSuccess, onCancel }) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isChanging, setIsChanging] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!currentPassword || !newPassword || !confirmPassword) {
        setError('Please fill in all fields')
        return
      }

      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long')
        return
      }

      if (newPassword !== confirmPassword) {
        setError('New passwords do not match')
        return
      }

      setError(null)
      setIsChanging(true)

      try {
        await apiService.changePassword({
          currentPassword,
          newPassword,
        })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        if (onSuccess) {
          onSuccess()
        }
      } catch (err: any) {
        setError('Failed to change password: ' + (err.response?.data?.message || err.message || 'Unknown error'))
      } finally {
        setIsChanging(false)
      }
    },
    [currentPassword, newPassword, confirmPassword, onSuccess]
  )

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Change Password</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {error && (
          <div style={styles.error} className="fade-in">
            {error}
          </div>
        )}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Current Password <span style={styles.required}>*</span>
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            style={styles.input}
            className="input-focus"
            disabled={isChanging}
            required
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            New Password <span style={styles.required}>*</span>
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password (min 6 chars)"
            style={styles.input}
            className="input-focus"
            disabled={isChanging}
            required
            minLength={6}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Confirm New Password <span style={styles.required}>*</span>
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            style={styles.input}
            className="input-focus"
            disabled={isChanging}
            required
            minLength={6}
          />
        </div>
        <div style={styles.buttonGroup}>
          {onCancel && (
            <button type="button" onClick={onCancel} style={styles.cancelButton} className="button-hover">
              Cancel
            </button>
          )}
          <button type="submit" style={styles.submitButton} className="button-hover" disabled={isChanging}>
            {isChanging ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  )
}

const primaryPurple = '#4a1e47'
const white = '#FFFFFF'
const textDark = '#333333'
const textLight = '#666666'
const borderGray = '#E0E0E0'

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: white,
    padding: '1.75rem',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${borderGray}`,
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: textDark,
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
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
    padding: '0.625rem 0.75rem',
    border: `1px solid ${borderGray}`,
    borderRadius: '6px',
    fontSize: '0.875rem',
    backgroundColor: white,
    color: textDark,
    transition: 'all 0.2s',
  },
  error: {
    padding: '0.75rem',
    backgroundColor: '#fee',
    color: '#dc3545',
    borderRadius: '4px',
    fontSize: '0.875rem',
    border: '1px solid #fcc',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
    marginTop: '0.5rem',
  },
  cancelButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: 'transparent',
    color: textDark,
    border: `1px solid ${borderGray}`,
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
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
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(74, 30, 71, 0.2)',
  },
}
