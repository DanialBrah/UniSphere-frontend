import { Globe, Building2, Lock } from 'lucide-react'
import type { CommunityVisibility } from '../types'

const VISIBILITY_STYLE: Record<CommunityVisibility, { label: string; icon: typeof Globe }> = {
  PUBLIC: { label: 'Public', icon: Globe },
  UNIVERSITY_ONLY: { label: 'University only', icon: Building2 },
  PRIVATE: { label: 'Private', icon: Lock },
}

export function CommunityVisibilityBadge({ visibility }: { visibility: CommunityVisibility }) {
  const { label, icon: Icon } = VISIBILITY_STYLE[visibility]
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#241a38] text-gray-600 dark:text-gray-300 font-medium">
      <Icon size={11} />
      {label}
    </span>
  )
}
