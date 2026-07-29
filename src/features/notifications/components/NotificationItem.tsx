import { Bell, Heart, MessageSquare, AtSign, UserPlus, UserCircle, type LucideIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { actorLabel, notificationTargetPath } from '../types'
import type { NotificationResponse, NotifType } from '../types'

// Partial by design: the backend enum has 15 types but only these four are emitted today.
// The rest fall back to the generic config below until they're actually built.
const TYPE_CONFIG: Partial<Record<NotifType, { icon: LucideIcon; color: string; bg: string; label: string }>> = {
  LIKE:    { icon: Heart,         color: 'text-rose-500',    bg: 'bg-rose-100 dark:bg-rose-900/30',       label: 'liked your post' },
  COMMENT: { icon: MessageSquare, color: 'text-blue-500',    bg: 'bg-blue-100 dark:bg-blue-900/30',       label: 'commented on your post' },
  MENTION: { icon: AtSign,        color: 'text-violet-500',  bg: 'bg-violet-100 dark:bg-violet-900/30',   label: 'mentioned you in a post' },
  FOLLOW:  { icon: UserPlus,      color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'started following you' },
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
  const actor = actorLabel(notification)
  const time = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })

  // targetId means different things per type — a post for LIKE/COMMENT/MENTION, a user for FOLLOW.
  // Always navigating to /post/{targetId} sent follow notifications to an unrelated post.
  const targetPath = notificationTargetPath(notification)

  function handleContentClick() {
    if (!notification.read) onRead(notification.id)
    if (targetPath) navigate(targetPath)
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
        {notification.actorAvatarUrl ? (
          <img
            src={notification.actorAvatarUrl}
            alt={actor}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-[#2D1F4D] flex items-center justify-center">
            <UserCircle size={20} className="text-gray-400 dark:text-gray-500" />
          </div>
        )}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-[#130D22] ${cfg.bg}`}
        >
          <Icon size={8} className={cfg.color} />
        </span>
      </button>

      {/* Content — marks read + navigates to whatever this notification points at */}
      <button
        onClick={handleContentClick}
        className={`flex-1 min-w-0 text-left ${targetPath ? '' : 'cursor-default'}`}
      >
        <p
          className={`text-sm leading-snug ${
            notification.read
              ? 'text-gray-600 dark:text-gray-400'
              : 'text-gray-900 dark:text-gray-100 font-medium'
          }`}
        >
          <span className="font-semibold">{actor}</span>{' '}
          <span className={notification.read ? '' : cfg.color}>{cfg.label}</span>
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
