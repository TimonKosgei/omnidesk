import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { KitchenProvider } from './context/KitchenContext'
import { AuthPage } from './pages/AuthPage'
import { AppLayout } from './components/AppLayout'

import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardPage } from './pages/DashboardPage'
import { PantryPage } from './pages/PantryPage'
import { PlannerPage } from './pages/PlannerPage'
import { ShoppingPage } from './pages/ShoppingPage'

function AppRoutes() {
  const { token } = useAuth()

  return (
    <Routes>
      <Route path="/auth" element={token ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route
        path="/"
        element={(
          <ProtectedRoute>
            <KitchenProvider>
              <AppLayout />
            </KitchenProvider>
          </ProtectedRoute>
        )}
      >
        <Route index element={<DashboardPage />} />
        <Route path="pantry" element={<PantryPage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="shopping" element={<ShoppingPage />} />
      </Route>
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
