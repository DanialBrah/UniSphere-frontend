import { Bell, Heart, MessageSquare, AtSign, UserCircle, type LucideIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import type { NotificationResponse, NotifType } from '../types'

const TYPE_CONFIG: Record<NotifType, { icon: LucideIcon; color: string; bg: string; label: string }> = {
  LIKE:    { icon: Heart,         color: 'text-rose-500',   bg: 'bg-rose-100 dark:bg-rose-900/30',     label: 'liked your post' },
  COMMENT: { icon: MessageSquare, color: 'text-blue-500',   bg: 'bg-blue-100 dark:bg-blue-900/30',     label: 'commented on your post' },
  MENTION: { icon: AtSign,        color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30', label: 'mentioned you in a post' },
}

interface Props {
  notification: NotificationResponse
  onRead: (id: number) => void
}

export function NotificationItem({ notification, onRead }: Props) {
  const navigate = useNavigate()
  const cfg = TYPE_CONFIG[notification.notifType] ?? {
    icon: Bell,
    color: 'text-gray-500',
    bg: 'bg-gray-100 dark:bg-gray-800',
    label: 'sent you a notification',
  }
  const Icon = cfg.icon
  const time = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })

  function handleContentClick() {
    if (!notification.read) onRead(notification.id)
    navigate(`/post/${notification.targetId}`)
  }

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3.5 transition-colors ${
        notification.read
          ? 'hover:bg-gray-50 dark:hover:bg-[#1E1430]'
          : 'bg-violet-50/60 dark:bg-[#1A1226] hover:bg-violet-50 dark:hover:bg-[#1E1430]'
      }`}
    >
      {/* Actor avatar — tapping links to their profile */}
      <button
        onClick={() => navigate(`/profile/${notification.actorId}`)}
        className="relative shrink-0 mt-0.5"
        aria-label="View profile"
      >
        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-[#2D1F4D] flex items-center justify-center">
          <UserCircle size={20} className="text-gray-400 dark:text-gray-500" />
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-[#130D22] ${cfg.bg}`}
        >
          <Icon size={8} className={cfg.color} />
        </span>
      </button>

      {/* Content — marks read + navigates to the target post */}
      <button onClick={handleContentClick} className="flex-1 min-w-0 text-left">
        <p
          className={`text-sm leading-snug ${
            notification.read
              ? 'text-gray-600 dark:text-gray-400'
              : 'text-gray-900 dark:text-gray-100 font-medium'
          }`}
        >
          Someone <span className={notification.read ? '' : cfg.color}>{cfg.label}</span>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{time}</p>
      </button>

      {/* Unread dot */}
      {!notification.read && (
        <span className="w-2 h-2 rounded-full bg-violet-500 shrink-0 mt-2.5" />
      )}
    </div>
  )
}
