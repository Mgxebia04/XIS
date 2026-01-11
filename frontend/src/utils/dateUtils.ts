/**
 * Date utility functions
 */

/**
 * Formats a date string to a readable format
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "Mon, Jan 15, 2024")
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Gets the minimum date/time for input fields (current date/time)
 * @returns Object with date and time strings
 */
export const getMinDateTime = (): { date: string; time: string } => {
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

/**
 * Validates if a date/time is in the future
 * @param date - Date string (YYYY-MM-DD)
 * @param time - Time string (HH:mm)
 * @returns True if the date/time is in the future
 */
export const isFutureDateTime = (date: string, time: string): boolean => {
  const dateTime = new Date(`${date}T${time}`)
  const now = new Date()
  return dateTime > now
}
