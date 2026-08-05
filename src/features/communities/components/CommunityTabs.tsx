import { Rss, MessageSquare, Megaphone, Users2, Shield } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type CommunityTab = 'posts' | 'chat' | 'announcements' | 'members' | 'manage'

interface TabDef {
  id: CommunityTab
  label: string
  icon: LucideIcon
}

const BASE_TABS: TabDef[] = [
  { id: 'posts', label: 'Posts', icon: Rss },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'members', label: 'Members', icon: Users2 },
]

interface Props {
  active: CommunityTab
  onChange: (tab: CommunityTab) => void
  /** Only ADMIN/MODERATOR viewers get the Manage tab (join requests, bans, settings). */
  showManage: boolean
}

export function CommunityTabs({ active, onChange, showManage }: Props) {
  const tabs = showManage ? [...BASE_TABS, { id: 'manage' as const, label: 'Manage', icon: Shield }] : BASE_TABS

  return (
    <div className="flex border-b border-gray-200 dark:border-[#2D1F4D] overflow-x-auto">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={[
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors shrink-0',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
            ].join(' ')}
          >
            <Icon size={15} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
