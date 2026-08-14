import { format, formatDistanceToNow } from 'date-fns'

/**
 * The backend serialises java.time.LocalDateTime (createdAt/updatedAt/scheduledAt) with no Jackson
 * customisation, so timestamps arrive as "2026-08-02T14:31:22.123456" — no Z, no offset, and a
 * 6-digit fractional part. Six fractional digits are outside ES2016's three-digit grammar, so
 * engines are only required to be tolerant — truncating here removes the ambiguity rather than
 * betting on it. Same helper as `jobs/utils/dateUtils.ts`.
 */
export function parseServerDateTime(value: string | null | undefined): Date | null {
  if (!value) return null
  const normalised = value.replace(/(\.\d{3})\d+$/, '$1')
  const date = new Date(normalised)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatServiceRelative(value: string | null | undefined): string {
  const date = parseServerDateTime(value)
  return date ? formatDistanceToNow(date, { addSuffix: true }) : ''
}

export function formatServiceDateTime(value: string | null | undefined): string {
  const date = parseServerDateTime(value)
  return date ? format(date, "d MMM yyyy 'at' HH:mm") : ''
}

/** Local-time value for a `datetime-local` input, defaulting to one hour from now. */
export function defaultScheduledAtValue(): string {
  const now = new Date(Date.now() + 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}
