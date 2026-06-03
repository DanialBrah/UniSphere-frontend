import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { PageSpinner } from '../ui/PageSpinner'

export function ProtectedRoute() {
  const { isHydrated, isAuthenticated } = useAuth()

  if (!isHydrated) return <PageSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <Outlet />
}
