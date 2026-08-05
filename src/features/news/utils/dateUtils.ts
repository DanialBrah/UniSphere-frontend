import { format, formatDistanceToNow } from 'date-fns'
import type { NewsStatus } from '../types'

/**
 * The backend serialises java.time.LocalDateTime with no Jackson customisation, so timestamps
 * arrive as "2026-08-02T14:31:22.123456" — no Z, no offset, and a 6-digit fractional part.
 *
 * Two things follow:
 *  - Per ES2016+, a date-TIME string without an offset is parsed as LOCAL time. (A date-ONLY
 *    string is parsed as UTC, which is why we never hand a bare date to Date().)
 *  - Six fractional digits are outside the spec's three-digit grammar, so engines are only
 *    required to be tolerant. Truncating here removes the ambiguity rather than betting on it.
 */
export function parseServerDateTime(value: string | null | undefined): Date | null {
  if (!value) return null
  const normalised = value.replace(/(\.\d{3})\d+$/, '$1')
  const date = new Date(normalised)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatNewsRelative(value: string | null | undefined): string {
  const date = parseServerDateTime(value)
  return date ? formatDistanceToNow(date, { addSuffix: true }) : ''
}

export function formatNewsDate(value: string | null | undefined): string {
  const date = parseServerDateTime(value)
  return date ? format(date, 'd MMM yyyy') : ''
}

export function formatNewsDateTime(value: string | null | undefined): string {
  const date = parseServerDateTime(value)
  return date ? format(date, "d MMM yyyy 'at' HH:mm") : ''
}

/**
 * Server naive "2026-08-04T09:00:00.000000" -> datetime-local value "2026-08-04T09:00".
 *
 * A slice, not a Date round-trip: both sides are naive wall-clock strings, so parsing and
 * re-formatting would be an identity that only reintroduces the fractional-second hazard.
 */
export function toDateTimeLocalValue(serverValue: string | null | undefined): string {
  return serverValue ? serverValue.slice(0, 16) : ''
}

/**
 * datetime-local "2026-08-04T09:00" -> server naive "2026-08-04T09:00:00".
 *
 * Returns undefined for an empty box so the caller can omit the field entirely — on a
 * DRAFT -> DRAFT transition the server reads an absent scheduledAt as "unschedule".
 */
export function fromDateTimeLocalValue(input: string): string | undefined {
  const value = input.trim()
  if (!value) return undefined
  // Some browsers include seconds in the control's value; most don't.
  return value.length === 16 ? `${value}:00` : value
}

/**
 * There is no SCHEDULED status in the API. A queued article is a DRAFT carrying a scheduledAt,
 * and the scheduler flips it to PUBLISHED when the time passes.
 */
export function isScheduled(article: {
  status: NewsStatus
  scheduledAt?: string | null
}): boolean {
  return article.status === 'DRAFT' && !!article.scheduledAt
}

/**
 * Best-effort guard so an obviously-doomed request isn't sent.
 *
 * This cannot be authoritative: the server evaluates @Future against its own clock in its own
 * timezone, which the browser has no way to discover. A user west of the server can pass this
 * check and still get a 400 — which is why the picker also shows describeScheduleInServerTerms
 * and newsErrors maps the rejection to a message that explains what actually happened.
 */
export function isFutureInBrowserTime(input: string): boolean {
  const serverValue = fromDateTimeLocalValue(input)
  const date = parseServerDateTime(serverValue)
  return date != null && date.getTime() > Date.now()
}

/**
 * Renders the chosen wall-clock time in UTC so an author can see the offset that will actually
 * be applied. Production runs the JVM in UTC; a local backend runs in the developer's zone,
 * where this reads as a no-op — which is itself informative.
 */
export function describeScheduleInServerTerms(input: string): string {
  const date = parseServerDateTime(fromDateTimeLocalValue(input))
  if (!date) return ''
  return `${format(date, "d MMM yyyy 'at' HH:mm")} local (${date.toISOString().slice(0, 16).replace('T', ' ')} UTC)`
}
