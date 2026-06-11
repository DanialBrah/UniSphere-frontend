import { CheckCircle, Pencil } from 'lucide-react'
import { displayName } from '../../utils/profileUtils'
import type { UserProfileResponse } from '../../types/auth'

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatMemberSince(createdAt?: string): string {
  if (!createdAt) return ''
  return new Date(createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

const ROLE_COLOR: Record<string, string> = {
  STUDENT:    'bg-primary-100 text-primary-700 dark:bg-primary/20 dark:text-primary-300',
  ALUMNI:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  EMPLOYER:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  CLUB:       'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  UNIVERSITY: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  ADMIN:      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

interface Props {
  user: UserProfileResponse
  onEditClick?: () => void
}

export function ProfileHeader({ user, onEditClick }: Props) {
  const name = displayName(user)
  const initials = getInitials(name)
  const memberSince = formatMemberSince(user.createdAt)

  return (
    <div className="bg-white dark:bg-[#130D22] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] p-6 mb-6">
      <div className="flex items-start gap-5">
        {/* Avatar */}
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={name}
            className="w-20 h-20 rounded-full object-cover flex-shrink-0 ring-4 ring-primary-100 dark:ring-primary/20"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 ring-4 ring-primary-100 dark:ring-primary/20">
            <span className="text-white text-xl font-bold">{initials}</span>
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{name}</h2>
              {user.isVerified && (
                <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" aria-label="Verified" />
              )}
            </div>
            {onEditClick && (
              <button
                onClick={onEditClick}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#2D1F4D] text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-primary/50 hover:text-primary dark:hover:text-primary transition-colors"
              >
                <Pencil size={13} />
                Edit Profile
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ROLE_COLOR[user.role]}`}>
              {user.role}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              user.status === 'ACTIVE'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {user.status}
            </span>
          </div>

          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p>{user.email}</p>
            {user.phone && <p>{user.phone}</p>}
            {memberSince && <p className="text-xs">Member since {memberSince}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
