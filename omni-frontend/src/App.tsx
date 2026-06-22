import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { OmiDeskLayout } from './components/OmiDeskLayout'
import { AuthPage } from './pages/AuthPage'

// Import all three dashboards
import { StaffDashboardPage } from './pages/StaffDashboardPage'
import { TechnicianDashboardPage } from './pages/TechnicianDashboardPage'
import { SupervisorDashboardPage } from './pages/SupervisorDashboardPage'

function DashboardSwitch() {
  const { role } = useAuth()

  // Dynamic dashboard injection matching your schema roles
  switch (role) {
    case 'admin':
    case 'supervisor':
      return <SupervisorDashboardPage />
    case 'technician':
      return <TechnicianDashboardPage />
    case 'staff':
    default:
      return <StaffDashboardPage />
  }
}

function AppRoutes() {
  const { token } = useAuth()

  return (
    <Routes>
      {/* If authenticated, redirect away from /auth automatically */}
      <Route path="/auth" element={token ? <Navigate to="/" replace /> : <AuthPage />} />
      
      {/* Protected Layout Route containing the Dynamic Switch component */}
      <Route
        path="/"
        element={(
          <ProtectedRoute>
            <OmiDeskLayout>
              <DashboardSwitch />
            </OmiDeskLayout>
          </ProtectedRoute>
        )}
      />
      
      {/* Catch all broken urls */}
      <Route path="*" element={<Navigate to={token ? '/' : '/auth'} replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App