import { format, formatDistanceToNow } from 'date-fns'

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

export function formatEventRelative(value: string | null | undefined): string {
  const date = parseServerDateTime(value)
  return date ? formatDistanceToNow(date, { addSuffix: true }) : ''
}

export function formatEventDate(value: string | null | undefined): string {
  const date = parseServerDateTime(value)
  return date ? format(date, 'd MMM yyyy') : ''
}

export function formatEventTime(value: string | null | undefined): string {
  const date = parseServerDateTime(value)
  return date ? format(date, 'HH:mm') : ''
}

export function formatEventDateTime(value: string | null | undefined): string {
  const date = parseServerDateTime(value)
  return date ? format(date, "d MMM yyyy 'at' HH:mm") : ''
}

/** "d MMM yyyy, HH:mm – HH:mm" when both fall on the same day, else two full date-times. */
export function formatEventRange(
  start: string | null | undefined,
  end: string | null | undefined,
): string {
  const startDate = parseServerDateTime(start)
  const endDate = parseServerDateTime(end)
  if (!startDate) return ''
  if (!endDate) return formatEventDateTime(start)

  const sameDay =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate()

  if (sameDay) {
    return `${format(startDate, 'd MMM yyyy')}, ${format(startDate, 'HH:mm')} – ${format(endDate, 'HH:mm')}`
  }
  return `${format(startDate, "d MMM yyyy 'at' HH:mm")} – ${format(endDate, "d MMM yyyy 'at' HH:mm")}`
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
 * Returns undefined for an empty box so the caller can omit the field entirely.
 */
export function fromDateTimeLocalValue(input: string): string | undefined {
  const value = input.trim()
  if (!value) return undefined
  // Some browsers include seconds in the control's value; most don't.
  return value.length === 16 ? `${value}:00` : value
}

/**
 * Best-effort guard so an obviously-doomed request isn't sent — mirrors CreateEventRequest's
 * `@Future` on startDatetime.
 *
 * This cannot be authoritative: the server evaluates @Future against its own clock in its own
 * timezone, which the browser has no way to discover. A user west of the server can pass this
 * check and still get a 400.
 */
export function isFutureInBrowserTime(input: string): boolean {
  const serverValue = fromDateTimeLocalValue(input)
  const date = parseServerDateTime(serverValue)
  return date != null && date.getTime() > Date.now()
}

export function isPastInBrowserTime(value: string | null | undefined): boolean {
  const date = parseServerDateTime(value)
  return date != null && date.getTime() <= Date.now()
}

/** The current moment as a `datetime-local` value — used as the `min` on the start-time input. */
export function nowDateTimeLocalValue(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}
