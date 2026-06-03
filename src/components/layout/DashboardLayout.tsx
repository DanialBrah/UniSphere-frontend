import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, Rss, Users2, MessageSquare, Bell,
  ShoppingBag, Briefcase, Calendar, FolderKanban, BookOpen,
  GraduationCap, Wrench, Search, Newspaper, MapPin,
  Bus, Users, Clock, Bot, UserCircle, LogOut,
  ChevronLeft, ChevronRight, Moon, Sun,
} from 'lucide-react'
import { Logo } from '../ui/Logo'
import { useAuth } from '../../hooks/useAuth'
import { useThemeStore } from '../../stores/themeStore'
import type { UserProfileResponse } from '../../features/identity/types/auth'

interface NavItem {
  label: string
  icon: LucideIcon
  to: string
  group?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',     icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Feed',          icon: Rss,             to: '/feed',          group: 'Social'   },
  { label: 'Communities',   icon: Users2,           to: '/communities',   group: 'Social'   },
  { label: 'Messages',      icon: MessageSquare,    to: '/messages',      group: 'Social'   },
  { label: 'Notifications', icon: Bell,             to: '/notifications', group: 'Social'   },
  { label: 'Marketplace',   icon: ShoppingBag,      to: '/marketplace',   group: 'Commerce' },
  { label: 'Jobs',          icon: Briefcase,        to: '/jobs',          group: 'Commerce' },
  { label: 'Events',        icon: Calendar,         to: '/events',        group: 'Commerce' },
  { label: 'Projects',      icon: FolderKanban,     to: '/projects',      group: 'Projects' },
  { label: 'Study',         icon: BookOpen,         to: '/study',         group: 'Projects' },
  { label: 'Tutors',        icon: GraduationCap,    to: '/tutors',        group: 'Projects' },
  { label: 'Services',      icon: Wrench,           to: '/services',      group: 'Projects' },
  { label: 'Lost & Found',  icon: Search,           to: '/lost-found',    group: 'Projects' },
  { label: 'News',          icon: Newspaper,        to: '/news',          group: 'Campus'   },
  { label: 'Campus Map',    icon: MapPin,           to: '/map',           group: 'Campus'   },
  { label: 'Bus Tracker',   icon: Bus,              to: '/bus',           group: 'Campus'   },
  { label: 'Clubs',         icon: Users,            to: '/clubs',         group: 'Campus'   },
  { label: 'Timetable',     icon: Clock,            to: '/timetable',     group: 'Campus'   },
  { label: 'Chatbot',       icon: Bot,              to: '/chatbot',       group: 'Campus'   },
  { label: 'Profile',       icon: UserCircle,       to: '/profile/me',    group: 'Account'  },
]

function displayName(user: UserProfileResponse): string {
  if (user.role === 'STUDENT' || user.role === 'ALUMNI' || user.role === 'ADMIN') {
    return user.fullName
  }
  if (user.role === 'EMPLOYER') return user.companyName
  if (user.role === 'CLUB') return user.name
  if (user.role === 'UNIVERSITY') return user.name
  return user.email
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
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
  children: React.ReactNode
}

export function DashboardLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const { isDark, toggle } = useThemeStore()
  const location = useLocation()
  const navigate = useNavigate()

  const name = user ? displayName(user) : ''
  const initials = getInitials(name)
  const roleLabel = user?.role ?? ''

  const groups = [...new Set(NAV_ITEMS.map((i) => i.group ?? ''))]

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  function isActive(to: string) {
    return location.pathname === to || location.pathname.startsWith(to + '/')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0F0A1A]">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className={`
          flex flex-col flex-shrink-0 border-r border-gray-200 dark:border-[#2D1F4D]
          bg-white dark:bg-[#130D22] transition-all duration-200 ease-in-out
          ${collapsed ? 'w-20' : 'w-64'}
        `}
      >
        {/* Logo + collapse toggle */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-gray-100 dark:border-[#2D1F4D]">
          <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
            <Logo size={28} className="flex-shrink-0" />
            {!collapsed && (
              <span className="font-bold text-gray-900 dark:text-white truncate text-sm">
                UniSphere
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 dark:hover:text-gray-200 transition-colors flex-shrink-0"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* User info */}
        <div className={`flex items-center gap-3 px-3 py-3 border-b border-gray-100 dark:border-[#2D1F4D] ${collapsed ? 'justify-center' : ''}`}>
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={name}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>
          )}
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${ROLE_COLOR[roleLabel]}`}>
                {roleLabel}
              </span>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2">
          {groups.map((group) => {
            const items = NAV_ITEMS.filter((i) => (i.group ?? '') === group)
            return (
              <div key={group}>
                {group && !collapsed && (
                  <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                    {group}
                  </p>
                )}
                {group && collapsed && (
                  <div className="mx-3 my-2 border-t border-gray-100 dark:border-[#2D1F4D]" />
                )}
                {items.map((item) => {
                  const active = isActive(item.to)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      title={collapsed ? item.label : undefined}
                      className={`
                        flex items-center gap-3 mx-2 px-2 py-2 rounded-lg text-sm font-medium transition-colors
                        ${collapsed ? 'justify-center' : ''}
                        ${active
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary/15 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100'
                        }
                      `}
                    >
                      <Icon size={17} className="flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-gray-100 dark:border-[#2D1F4D] p-2 space-y-1">
          <button
            onClick={toggle}
            title={isDark ? 'Light mode' : 'Dark mode'}
            className={`flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-100 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
            {!collapsed && <span>{isDark ? 'Light mode' : 'Dark mode'}</span>}
          </button>
          <button
            onClick={handleLogout}
            title="Logout"
            className={`flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={17} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
