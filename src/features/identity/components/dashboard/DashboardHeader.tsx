import { useAuth } from '../../../../hooks/useAuth'
import type { UserProfileResponse } from '../../types/auth'

function displayName(user: UserProfileResponse): string {
  if (user.role === 'STUDENT' || user.role === 'ALUMNI' || user.role === 'ADMIN') return user.fullName
  if (user.role === 'EMPLOYER') return user.companyName
  if (user.role === 'CLUB') return user.name
  if (user.role === 'UNIVERSITY') return user.name
  return user.email
}

function todayFormatted(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function DashboardHeader() {
  const { user } = useAuth()

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back{user ? `, ${displayName(user)}` : ''}!
        </h1>
        {user && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary/10 text-primary-700 dark:text-primary-300 font-semibold">
            {user.role}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{todayFormatted()}</p>
    </div>
  )
}
