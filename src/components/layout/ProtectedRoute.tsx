import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0F0A1A]">
      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function ProtectedRoute() {
  const { isHydrated, isAuthenticated } = useAuth()

  if (!isHydrated) return <PageSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <Outlet />
}
