import { Lock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  label: string
}

/** Shown in place of a tab's content when the backend denies access (403) because the
 * viewer isn't a member yet — distinct from a genuine load failure, which keeps the
 * normal error+retry UI. */
export function JoinToViewNotice({ icon: Icon, label }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#1E1430] flex items-center justify-center relative">
        <Icon size={24} className="text-gray-400 dark:text-gray-500" />
        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-200 dark:bg-[#2D1F4D] flex items-center justify-center">
          <Lock size={11} className="text-gray-500 dark:text-gray-400" />
        </span>
      </div>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Join to view {label}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
        This community's {label} are only visible to members.
      </p>
    </div>
  )
}
