import { useState, useEffect } from 'react'
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
import { useLogout } from '../../features/identity/hooks/useLogout'
import { useAuthStore } from '../../stores/authStore'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useChatStore } from '../../stores/chatStore'
import { useNotificationUnreadCount } from '../../features/notifications/hooks/useNotificationUnreadCount'
import { notificationKeys } from '../../features/notifications/hooks/useNotifications'
import { notificationApi } from '../../features/notifications/api/notificationApi'
import { stompClient, addStompConnectListener, addStompDisconnectListener } from '../../lib/stompClient'
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
  switch (user.role) {
    case 'STUDENT':
    case 'ALUMNI':
    case 'ADMIN':
      return user.fullName
    case 'EMPLOYER':
      return user.companyName
    case 'CLUB':
    case 'UNIVERSITY':
      return user.name
  }
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

function LogoutModal({ onConfirm, onCancel, isPending }: {
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-[#130D22] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] shadow-xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mx-auto mb-4">
          <LogOut size={22} className="text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-1">
          Sign out?
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          You will need to sign in again to access your account.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isPending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface Props {
  children: React.ReactNode
}

export function DashboardLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { user } = useAuth()
  const { isDark, toggle } = useThemeStore()
  const location = useLocation()
  const navigate = useNavigate()
  const logoutMutation = useLogout()
  const accessToken = useAuthStore((s) => s.accessToken)

  // Reconnect STOMP when the app reloads with a persisted token.
  // onConnect/onDisconnect update the reactive isStompConnected flag so hooks
  // that need an active connection can depend on it rather than polling stompClient.connected.
  useEffect(() => {
    if (!accessToken || stompClient.active) return
    stompClient.configure({ connectHeaders: { Authorization: `Bearer ${accessToken}` } })
    addStompConnectListener(() => useChatStore.getState().setStompConnected(true))
    addStompDisconnectListener(() => useChatStore.getState().setStompConnected(false))
    stompClient.activate()
  }, [accessToken])

  const unreadCounts = useChatStore((s) => s.unreadCounts)
  const hasUnread = Object.values(unreadCounts).some((n) => n > 0)

  const { data: notifUnread } = useNotificationUnreadCount()

  // Subscribe to the notifications list cache reactively (enabled:false = no fetch,
  // but the observer still receives updates when NotificationsPage or the STOMP
  // handler writes to the same query key).
  const { data: notifCacheData } = useInfiniteQuery({
    queryKey: notificationKeys.infinite(),
    queryFn: ({ pageParam }) => notificationApi.getNotifications(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (page) => (page.last ? undefined : page.number + 1),
    enabled: false,
    staleTime: Infinity,
  })
  const hasUnreadFromList = notifCacheData?.pages.flatMap((p) => p.content).some((n) => !n.read) ?? false

  const hasUnreadNotifs = (notifUnread?.count ?? 0) > 0 || hasUnreadFromList

  const name = user ? displayName(user) : ''
  const initials = getInitials(name)
  const roleLabel = user?.role ?? ''

  const groups = [...new Set(NAV_ITEMS.map((i) => i.group ?? ''))]

  function confirmLogout() {
    const { refreshToken } = useAuthStore.getState()
    if (refreshToken) {
      logoutMutation.mutate(
        { refreshToken },
        { onSettled: () => navigate('/login', { replace: true }) },
      )
    } else {
      useAuthStore.getState().logout()
      navigate('/login', { replace: true })
    }
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
                  const isMessages = item.to === '/messages'
                  const isNotifications = item.to === '/notifications'
                  const showBadge = (isMessages && hasUnread) || (isNotifications && hasUnreadNotifs)
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
                      <div className="relative flex-shrink-0">
                        <Icon size={17} />
                        {showBadge && collapsed && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                        )}
                      </div>
                      {!collapsed && <span className="flex-1">{item.label}</span>}
                      {!collapsed && showBadge && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      )}
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
            onClick={() => setShowLogoutModal(true)}
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

      {showLogoutModal && (
        <LogoutModal
          onConfirm={confirmLogout}
          onCancel={() => setShowLogoutModal(false)}
          isPending={logoutMutation.isPending}
        />
      )}
    </div>
  )
}
