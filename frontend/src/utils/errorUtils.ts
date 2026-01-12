/**
 * Error handling utilities for consistent error management across the application
 */

export interface ErrorNotification {
  message: string
  type: 'error' | 'warning' | 'info' | 'success'
  field?: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  statusCode?: number
}

/**
 * Extracts error message from API error response
 */
export const extractErrorMessage = (error: any): string => {
  if (!error) return 'An unexpected error occurred'

  // Handle Axios errors
  if (error.response) {
    const data = error.response.data
    
    // Handle validation errors with multiple fields
    if (data.errors && typeof data.errors === 'object') {
      const errorMessages = Object.values(data.errors)
        .flat()
        .filter((msg): msg is string => typeof msg === 'string')
      return errorMessages.length > 0 
        ? errorMessages.join(', ') 
        : data.message || 'Validation failed'
    }
    
    // Handle single error message
    if (data.message) {
      return data.message
    }
    
    // Handle status code specific messages
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.'
      case 401:
        return 'Authentication failed. Please log in again.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return 'The requested resource was not found.'
      case 409:
        return 'A conflict occurred. The resource may already exist.'
      case 422:
        return 'Validation failed. Please check your input.'
      case 500:
        return 'Server error. Please try again later.'
      case 503:
        return 'Service unavailable. Please try again later.'
      default:
        return data.title || `Error ${error.response.status}: ${data.detail || 'An error occurred'}`
    }
  }
  
  // Handle network errors
  if (error.request) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return 'Request timed out. Please check your connection and try again.'
    }
    return 'Network error. Please check your internet connection and try again.'
  }
  
  // Handle generic errors
  if (error.message) {
    return error.message
  }
  
  return 'An unexpected error occurred. Please try again.'
}

/**
 * Extracts field-specific errors from API response
 */
export const extractFieldErrors = (error: any): Record<string, string> => {
  if (!error?.response?.data?.errors) return {}
  
  const errors: Record<string, string> = {}
  const apiErrors = error.response.data.errors
  
  Object.keys(apiErrors).forEach((field) => {
    const fieldErrors = apiErrors[field]
    if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
      errors[field] = fieldErrors[0] // Take first error for each field
    }
  })
  
  return errors
}

/**
 * Creates an error notification object
 */
export const createErrorNotification = (
  message: string,
  type: ErrorNotification['type'] = 'error',
  field?: string
): ErrorNotification => ({
  message,
  type,
  field,
})

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validates password strength
 */
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password) {
    return { valid: false, message: 'Password is required' }
  }
  
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' }
  }
  
  return { valid: true }
}

/**
 * Validates required field
 */
export const validateRequired = (value: any, fieldName: string): { valid: boolean; message?: string } => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName} is required` }
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, message: `${fieldName} cannot be empty` }
  }
  
  return { valid: true }
}

/**
 * Validates date is in the future
 */
export const validateFutureDate = (date: string, time?: string): { valid: boolean; message?: string } => {
  if (!date) {
    return { valid: false, message: 'Date is required' }
  }
  
  const selectedDate = new Date(date)
  const now = new Date()
  
  if (time) {
    const [hours, minutes] = time.split(':').map(Number)
    selectedDate.setHours(hours, minutes, 0, 0)
  } else {
    selectedDate.setHours(0, 0, 0, 0)
    now.setHours(0, 0, 0, 0)
  }
  
  if (selectedDate <= now) {
    return { valid: false, message: 'Date and time must be in the future' }
  }
  
  return { valid: true }
}

/**
 * Validates time range
 */
export const validateTimeRange = (startTime: string, endTime: string): { valid: boolean; message?: string } => {
  if (!startTime || !endTime) {
    return { valid: false, message: 'Both start and end times are required' }
  }
  
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)
  
  const start = new Date()
  start.setHours(startHours, startMinutes, 0, 0)
  
  const end = new Date()
  end.setHours(endHours, endMinutes, 0, 0)
  
  if (end <= start) {
    return { valid: false, message: 'End time must be after start time' }
  }
  
  return { valid: true }
}

/**
 * Formats validation errors for display
 */
export const formatValidationErrors = (errors: Record<string, string>): string => {
  const errorMessages = Object.values(errors)
  if (errorMessages.length === 0) return ''
  if (errorMessages.length === 1) return errorMessages[0]
  return `Multiple errors: ${errorMessages.join('; ')}`
}
