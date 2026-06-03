import { Users, Calendar, Briefcase, MessageSquare, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  value: string
  label: string
  trend: string
  color: string
}

function StatCard({ icon: Icon, value, label, trend, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-[#130D22] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] p-5 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
        <TrendingUp size={12} />
        {trend}
      </div>
    </div>
  )
}

const STATS: StatCardProps[] = [
  { icon: Users,         value: '12,847', label: 'Verified campus users',  trend: '↑ 5% this week',   color: 'bg-primary-600' },
  { icon: Calendar,      value: '23',     label: 'Events happening today', trend: '↑ 3 new today',    color: 'bg-blue-500'    },
  { icon: Briefcase,     value: '148',    label: 'Jobs posted this week',  trend: '↑ 12% this month', color: 'bg-emerald-500' },
  { icon: MessageSquare, value: '5',      label: 'Unread conversations',   trend: 'Check your inbox', color: 'bg-orange-500'  },
]

export function StatsRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {STATS.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}
