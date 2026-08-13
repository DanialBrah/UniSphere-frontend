import {
  Bell, Heart, MessageSquare, AtSign, UserPlus, UserCircle,
  Megaphone, CheckCircle2, XCircle, Shield, Calendar, Briefcase, FolderKanban, UserMinus,
  type LucideIcon,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { actorLabel, notificationTargetPath } from '../types'
import type { NotificationResponse, NotifTargetType, NotifType } from '../types'

// Partial by design: the backend enum has 20 types but only these nine are emitted today.
// The rest fall back to the generic config below until they're actually built.
const TYPE_CONFIG: Partial<Record<NotifType, { icon: LucideIcon; color: string; bg: string; label: string }>> = {
  LIKE:    { icon: Heart,         color: 'text-rose-500',    bg: 'bg-rose-100 dark:bg-rose-900/30',       label: 'liked your post' },
  COMMENT: { icon: MessageSquare, color: 'text-blue-500',    bg: 'bg-blue-100 dark:bg-blue-900/30',       label: 'commented on your post' },
  MENTION: { icon: AtSign,        color: 'text-violet-500',  bg: 'bg-violet-100 dark:bg-violet-900/30',   label: 'mentioned you in a post' },
  FOLLOW:  { icon: UserPlus,      color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'started following you' },
  COMMUNITY_ANNOUNCEMENT:  { icon: Megaphone,   color: 'text-violet-500',  bg: 'bg-violet-100 dark:bg-violet-900/30',   label: 'posted an announcement in your community' },
  COMMUNITY_JOIN_REQUEST:  { icon: UserPlus,    color: 'text-blue-500',    bg: 'bg-blue-100 dark:bg-blue-900/30',       label: 'requested to join your community' },
  COMMUNITY_JOIN_APPROVED: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'approved your join request' },
  COMMUNITY_JOIN_REJECTED: { icon: XCircle,     color: 'text-gray-500',    bg: 'bg-gray-100 dark:bg-gray-800',          label: 'rejected your join request' },
  COMMUNITY_ROLE_CHANGED:  { icon: Shield,      color: 'text-amber-500',   bg: 'bg-amber-100 dark:bg-amber-900/30',     label: 'changed your role in a community' },
  EVENT:                   { icon: Calendar,    color: 'text-primary',     bg: 'bg-primary-100 dark:bg-primary/20',     label: 'sent you an event update' },
  JOB:                     { icon: Briefcase,   color: 'text-teal-500',    bg: 'bg-teal-100 dark:bg-teal-900/30',       label: 'sent you a job update' },
  // Unlike Jobs/Events, Projects puts its sub-kind directly in notifType — same idiom as the
  // COMMUNITY_* rows above, so each gets its own direct entry rather than a targetType branch.
  PROJECT_APPLICATION_RECEIVED: { icon: FolderKanban, color: 'text-teal-500',    bg: 'bg-teal-100 dark:bg-teal-900/30',       label: 'applied to join your project' },
  PROJECT_APPLICATION_ACCEPTED: { icon: CheckCircle2,  color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'accepted your project application' },
  PROJECT_APPLICATION_REJECTED: { icon: XCircle,       color: 'text-gray-500',    bg: 'bg-gray-100 dark:bg-gray-800',          label: 'declined your project application' },
  PROJECT_MEMBER_REMOVED:       { icon: UserMinus,     color: 'text-red-500',     bg: 'bg-red-100 dark:bg-red-900/30',         label: 'removed you from a project' },
}

// LIKE and COMMENT are emitted for both posts and news articles, so the type alone can't say
// what was liked — without this, a news like reads "Alice liked your post".
const NEWS_LABEL: Partial<Record<NotifType, string>> = {
  LIKE: 'liked your article',
  COMMENT: 'commented on your article',
  MENTION: 'mentioned you in an article',
}

// Unlike every other type, Events puts its notification's sub-kind in targetType rather than
// notifType (which is always the single literal 'EVENT') — so the label has to branch on
// targetType here instead. actorId is null for the system-originated ones (confirmed/waitlisted/
// promoted/reminder), which is why that copy is written to read fine after a generic "Someone"
// actor. EVENT_CANCELLED and EVENT_REGISTRATION_REMOVED are the two with a real human actor — the
// organizer/admin who cancelled the event or removed the registration.
const EVENT_LABEL: Partial<Record<NotifTargetType, string>> = {
  EVENT_REGISTRATION_CONFIRMED: 'confirmed your event registration',
  EVENT_REGISTRATION_WAITLISTED: 'added you to an event waitlist',
  EVENT_WAITLIST_PROMOTED: "moved you off the waitlist — you're in",
  EVENT_REGISTRATION_REMOVED: 'removed your event registration',
  EVENT_CANCELLED: 'cancelled an event you registered for',
  EVENT_REMINDER: 'sent you an event reminder',
}

// Jobs puts its notification's sub-kind in targetType too (mirrors Events) — notifType is always
// the single literal 'JOB'. JOB_APPLICATION_RECEIVED goes to the employer; the other three go to
// the applicant.
const JOB_LABEL: Partial<Record<NotifTargetType, string>> = {
  JOB_APPLICATION_RECEIVED: 'applied to your job posting',
  JOB_APPLICATION_STATUS_CHANGED: 'updated the status of your application',
  JOB_CLOSED: 'closed a job you applied to',
  JOB_FILLED: 'marked a job you applied to as filled',
}

function labelFor(notifType: NotifType, targetType: NotifTargetType, fallback: string): string {
  if (targetType === 'NEWS_ARTICLE') return NEWS_LABEL[notifType] ?? fallback
  if (notifType === 'EVENT') return EVENT_LABEL[targetType] ?? fallback
  if (notifType === 'JOB') return JOB_LABEL[targetType] ?? fallback
  return fallback
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
  const label = labelFor(notification.notifType, notification.targetType, cfg.label)
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
          <span className={notification.read ? '' : cfg.color}>{label}</span>
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
