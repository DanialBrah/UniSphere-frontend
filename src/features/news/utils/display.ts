import type { NewsCategory, NewsStatus, NewsVisibility } from '../types'

/**
 * Full Records rather than Partials on purpose: adding a value to one of the unions then
 * becomes a compile error at every map, which is the main thing string-literal unions buy us
 * over the TS enums the tsconfig forbids.
 *
 * Palette follows the RoleBadge idiom (bg-*-100 / text-*-700 / dark:bg-*-900-30 / dark:text-*-300).
 * Note primary-300 is not defined in tailwind.config.js — use primary-400 in the violet slots.
 */

export const CATEGORY_ORDER: readonly NewsCategory[] = [
  'GENERAL',
  'ACADEMIC',
  'SPORTS',
  'EVENTS',
  'TECH',
  'ALUMNI',
]

export const CATEGORY_LABEL: Record<NewsCategory, string> = {
  GENERAL: 'General',
  ACADEMIC: 'Academic',
  SPORTS: 'Sports',
  EVENTS: 'Events',
  TECH: 'Tech',
  ALUMNI: 'Alumni',
}

export const CATEGORY_CHIP: Record<NewsCategory, string> = {
  GENERAL: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  ACADEMIC: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  SPORTS: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  EVENTS: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  TECH: 'bg-primary-100 text-primary-700 dark:bg-primary/20 dark:text-primary-400',
  ALUMNI: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
}

export const STATUS_LABEL: Record<NewsStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  ARCHIVED: 'Archived',
}

export const STATUS_CHIP: Record<NewsStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  PUBLISHED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  ARCHIVED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
}

/** Derived, not a real status — a DRAFT carrying a scheduledAt. */
export const SCHEDULED_LABEL = 'Scheduled'
export const SCHEDULED_CHIP = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'

export const VISIBILITY_LABEL: Record<NewsVisibility, string> = {
  PUBLIC: 'Everyone',
  UNIVERSITY: 'My university only',
}

export const VISIBILITY_HINT: Record<NewsVisibility, string> = {
  PUBLIC: 'Anyone signed in to UniSphere can read this.',
  UNIVERSITY: 'Only people at your university can read this.',
}
