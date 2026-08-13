import { LayoutList, Shield } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type ProjectDetailTab = 'details' | 'manage'

interface TabDef {
  id: ProjectDetailTab
  label: string
  icon: LucideIcon
}

const BASE_TABS: TabDef[] = [{ id: 'details', label: 'Details', icon: LayoutList }]

interface ProjectDetailTabsProps {
  active: ProjectDetailTab
  onChange: (tab: ProjectDetailTab) => void
  /** Only the project's owner or an ADMIN gets the Manage tab. */
  showManage: boolean
}

export function ProjectDetailTabs({ active, onChange, showManage }: Readonly<ProjectDetailTabsProps>) {
  const tabs = showManage ? [...BASE_TABS, { id: 'manage' as const, label: 'Manage', icon: Shield }] : BASE_TABS

  return (
    <div className="flex overflow-x-auto overflow-y-hidden border-b border-gray-200 dark:border-[#2D1F4D]">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={[
              '-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
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
