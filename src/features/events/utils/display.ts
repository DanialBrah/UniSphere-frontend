import type {
  EventCategory,
  EventRegistrationMode,
  EventRegistrationStatus,
  EventStatus,
} from '../types'

/**
 * Label and chip-class maps for every Events union.
 *
 * Full `Record<Union, string>` rather than partial maps with a fallback, deliberately: adding a
 * member to one of these unions then becomes a compile error at every display site instead of a
 * silent blank chip in production.
 */

export const CATEGORY_LABEL: Record<EventCategory, string> = {
  ACADEMIC: 'Academic',
  CAREER: 'Career',
  WORKSHOP: 'Workshop',
  SOCIAL: 'Social',
  SPORTS: 'Sports',
  CULTURAL: 'Cultural',
  TECH: 'Tech',
  CLUB: 'Club',
  ORIENTATION: 'Orientation',
  OTHER: 'Other',
}

/** Same colour family as `createEventIcon`'s map-pin palette, translated to Tailwind chip classes. */
export const CATEGORY_CHIP: Record<EventCategory, string> = {
  ACADEMIC: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  CAREER: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
  WORKSHOP: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  SOCIAL: 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300',
  SPORTS: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  CULTURAL: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300',
  TECH: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  CLUB: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
  ORIENTATION: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  OTHER: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
}

/** Commonest first, `OTHER` last — the order the filter chips and the category select both use. */
export const CATEGORY_ORDER: EventCategory[] = [
  'SOCIAL',
  'ACADEMIC',
  'WORKSHOP',
  'TECH',
  'CAREER',
  'SPORTS',
  'CULTURAL',
  'CLUB',
  'ORIENTATION',
  'OTHER',
]

export const STATUS_LABEL: Record<EventStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
}

export const STATUS_CHIP: Record<EventStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400',
  PUBLISHED: 'bg-primary-100 text-primary-700 dark:bg-primary/15 dark:text-primary-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
}

/** Only the two a user may pick from the detail page — the server 409s on `COMPLETED`. */
export const USER_STATUS_ORDER: Array<Extract<EventStatus, 'PUBLISHED' | 'CANCELLED'>> = [
  'PUBLISHED',
  'CANCELLED',
]

export const REGISTRATION_STATUS_LABEL: Record<EventRegistrationStatus, string> = {
  REGISTERED: 'Registered',
  WAITLISTED: 'Waitlisted',
  CANCELLED: 'Cancelled',
  ATTENDED: 'Attended',
}

export const REGISTRATION_STATUS_CHIP: Record<EventRegistrationStatus, string> = {
  REGISTERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  WAITLISTED: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  CANCELLED: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400',
  ATTENDED: 'bg-primary-100 text-primary-700 dark:bg-primary/15 dark:text-primary-400',
}

export const REGISTRATION_MODE_LABEL: Record<EventRegistrationMode, string> = {
  INTERNAL: 'In-app registration',
  EXTERNAL: 'External registration',
}
