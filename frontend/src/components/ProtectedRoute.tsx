// AIModified:2026-01-11T06:08:23Z
import React, { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth()

  const isAuthorized = useMemo(() => {
    if (!allowedRoles || !user) return true
    return allowedRoles.includes(user.role)
  }, [allowedRoles, user])

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          fontSize: '1rem',
          color: '#666',
        }}
      >
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAuthorized) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
