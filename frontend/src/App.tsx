// AIModified:2026-01-11T06:08:23Z
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { PanelDashboard } from '@/pages/PanelDashboard'
import { HRDashboard } from '@/pages/HRDashboard'
import { Interviewers } from '@/pages/Interviewers'
import { Unauthorized } from '@/pages/Unauthorized'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/panel-dashboard"
            element={
              <ProtectedRoute allowedRoles={['PANEL']}>
                <PanelDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr-dashboard"
            element={
              <ProtectedRoute allowedRoles={['HR']}>
                <HRDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interviewers"
            element={
              <ProtectedRoute allowedRoles={['HR']}>
                <Interviewers />
              </ProtectedRoute>
            }
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
