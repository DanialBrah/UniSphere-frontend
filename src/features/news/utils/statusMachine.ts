import type { NewsStatus } from '../types'

/**
 * The transitions NewsService.changeStatus accepts. Anything else is a 409
 * INVALID_NEWS_STATUS_TRANSITION, so both the editor toolbar and the Studio card actions
 * derive their buttons from here — that way the two can't disagree and no 409 is reachable
 * through the UI at all.
 *
 * The two rejected edges are worth naming because they look plausible:
 *   DRAFT -> ARCHIVED  (archive something never published)
 *   ARCHIVED -> DRAFT  (pull an archived article back to draft)
 */
const TRANSITIONS: Record<NewsStatus, readonly NewsStatus[]> = {
  DRAFT: ['PUBLISHED'],
  PUBLISHED: ['DRAFT', 'ARCHIVED'],
  ARCHIVED: ['PUBLISHED'],
}

export function allowedTransitions(from: NewsStatus): readonly NewsStatus[] {
  return TRANSITIONS[from]
}

export function canTransition(from: NewsStatus, to: NewsStatus): boolean {
  return TRANSITIONS[from].includes(to)
}

/** Only a DRAFT can carry a schedule — publishing clears it, archiving is unreachable from it. */
export function canSchedule(status: NewsStatus): boolean {
  return status === 'DRAFT'
}

/** The verb shown on the button for a given transition, so labels stay consistent everywhere. */
export function transitionLabel(from: NewsStatus, to: NewsStatus): string {
  if (to === 'PUBLISHED') return from === 'ARCHIVED' ? 'Restore' : 'Publish'
  if (to === 'DRAFT') return 'Unpublish'
  return 'Archive'
}
