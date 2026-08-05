import { Crown, ShieldCheck } from 'lucide-react'
import type { CommunityMemberRole } from '../types'

// Distinct from social's RoleBadge (which renders the platform-wide UserRole) — this renders
// the community-scoped ADMIN/MODERATOR/MEMBER role, a different enum the community DTOs carry.
const ROLE_STYLE: Record<CommunityMemberRole, { label: string; className: string }> = {
  ADMIN: { label: 'Admin', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  MODERATOR: { label: 'Moderator', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  MEMBER: { label: 'Member', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' },
}

export function CommunityRoleBadge({ role }: { role: CommunityMemberRole }) {
  const { label, className } = ROLE_STYLE[role]
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-semibold ${className}`}>
      {role === 'ADMIN' && <Crown size={10} />}
      {role === 'MODERATOR' && <ShieldCheck size={10} />}
      {label}
    </span>
  )
}
