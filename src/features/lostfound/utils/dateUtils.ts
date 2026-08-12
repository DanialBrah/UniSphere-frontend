import { format, formatDistanceToNow } from 'date-fns'
import { parseServerDateTime, toDateTimeLocalValue } from '../../news/utils/dateUtils'

/**
 * Re-exported from the News module rather than reimplemented: the backend serialises every
 * `java.time.LocalDateTime` the same way regardless of module, so the parsing hazard — no offset
 * and a 6-digit fractional part — is identical.
 */
export { parseServerDateTime, toDateTimeLocalValue }

export function formatLostFoundRelative(value: string | null | undefined): string {
  const date = parseServerDateTime(value)
  return date ? formatDistanceToNow(date, { addSuffix: true }) : ''
}

export function formatLostFoundDate(value: string | null | undefined): string {
  const date = parseServerDateTime(value)
  return date ? format(date, 'd MMM yyyy') : ''
}

export function formatLostFoundDateTime(value: string | null | undefined): string {
  const date = parseServerDateTime(value)
  return date ? format(date, "d MMM yyyy 'at' HH:mm") : ''
}

/**
 * datetime-local "2026-08-04T09:00" -> server naive "2026-08-04T09:00:00".
 *
 * Diverges from the News helper of the same shape by returning a string rather than `undefined`
 * for an empty box: `occurredAt` is `@NotNull` on create, so an omitted value is a 400 rather than
 * a meaningful "unset".
 */
export function fromDateTimeLocalValue(input: string): string {
  const value = input.trim()
  if (!value) return ''
  // Some browsers include seconds in the control's value; most don't.
  return value.length === 16 ? `${value}:00` : value
}

/**
 * `occurredAt` is `@PastOrPresent`, validated against the server's clock in the server's zone.
 * The browser cannot discover that zone, so this is a best-effort guard that stops the obviously
 * doomed submit; `lostFoundErrors` still maps the rejection if the two clocks disagree.
 */
export function maxDateTimeLocalValue(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}
