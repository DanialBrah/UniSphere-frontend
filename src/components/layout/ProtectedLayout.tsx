import { Outlet } from 'react-router-dom'
import { useGlobalMessagingSubscription } from '../../features/messaging/hooks/useGlobalMessagingSubscription'

/**
 * Sits between ProtectedRoute and the individual page components.
 * Mounts exactly once per authenticated session — never remounts on navigation.
 * This is the right place for hooks that must survive page transitions.
 */
export function ProtectedLayout() {
  useGlobalMessagingSubscription()
  return <Outlet />
}
