/**
 * Error handling utilities
 */

export interface ErrorNotification {
  message: string
  type: 'error' | 'warning' | 'info'
}

/**
 * Creates an error notification object
 */
export const createErrorNotification = (
  message: string,
  type: ErrorNotification['type'] = 'error'
): ErrorNotification => ({
  message,
  type,
})

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
