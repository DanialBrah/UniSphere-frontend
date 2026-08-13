import { Globe, MapPin } from 'lucide-react'
import {
  CATEGORY_CHIP,
  CATEGORY_LABEL,
  REGISTRATION_MODE_LABEL,
  REGISTRATION_STATUS_CHIP,
  REGISTRATION_STATUS_LABEL,
  STATUS_CHIP,
  STATUS_LABEL,
} from '../utils/display'
import type { EventCategory, EventRegistrationMode, EventRegistrationStatus, EventStatus } from '../types'

const CHIP = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold'

export function EventCategoryBadge({ category }: Readonly<{ category: EventCategory }>) {
  return <span className={`${CHIP} ${CATEGORY_CHIP[category]}`}>{CATEGORY_LABEL[category]}</span>
}

export function EventStatusBadge({ status }: Readonly<{ status: EventStatus }>) {
  return <span className={`${CHIP} ${STATUS_CHIP[status]}`}>{STATUS_LABEL[status]}</span>
}

export function EventRegistrationStatusBadge({
  status,
}: Readonly<{ status: EventRegistrationStatus }>) {
  return (
    <span className={`${CHIP} ${REGISTRATION_STATUS_CHIP[status]}`}>
      {REGISTRATION_STATUS_LABEL[status]}
    </span>
  )
}

/** Online vs in-person — not to be confused with `EventRegistrationMode`, which is about how you sign up. */
export function EventOnlineBadge({ online }: Readonly<{ online: boolean }>) {
  const Icon = online ? Globe : MapPin
  return (
    <span
      className={`${CHIP} bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300`}
    >
      <Icon className="h-3 w-3" />
      {online ? 'Online' : 'In person'}
    </span>
  )
}

export function EventRegistrationModeBadge({
  mode,
}: Readonly<{ mode: EventRegistrationMode }>) {
  return (
    <span className={`${CHIP} bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300`}>
      {REGISTRATION_MODE_LABEL[mode]}
    </span>
  )
}
