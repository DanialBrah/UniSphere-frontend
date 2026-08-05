import type { UserRole } from '../types'

const ROLE_COLOR: Record<string, string> = {
  STUDENT:    'bg-primary-100 text-primary-700 dark:bg-primary/20 dark:text-primary-300',
  ALUMNI:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  EMPLOYER:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  CLUB:       'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  UNIVERSITY: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  ADMIN:      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

interface Props {
  /**
   * News author payloads type this as a plain string server-side and fall back to the literal
   * "UNKNOWN" when the author row is missing, so the prop has to admit more than UserRole.
   * The ROLE_COLOR lookup already degrades to the ADMIN styling for anything unrecognised.
   */
  role: UserRole | 'UNKNOWN'
}

export function RoleBadge({ role }: Props) {
  const colorClass = ROLE_COLOR[role] ?? ROLE_COLOR.ADMIN
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${colorClass}`}>
      {role}
    </span>
  )
}
