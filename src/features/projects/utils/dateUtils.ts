import { format, formatDistanceToNow } from 'date-fns'

/**
 * The backend serialises every Projects timestamp (createdAt/updatedAt/reviewedAt/withdrawnAt/
 * joinedAt) as java.time.LocalDateTime with no Jackson customisation — "2026-08-02T14:31:22.123456",
 * no Z, no offset, a 6-digit fractional part. Six fractional digits are outside ES2016's three-digit
 * grammar, so engines are only required to be tolerant — truncating here removes the ambiguity
 * rather than betting on it. Same helper as `jobs/utils/dateUtils.ts`. There is no LocalDate-only
 * field anywhere in Projects, so the separate timezone gotcha `jobs`' applicationDeadline needed
 * does not apply here.
 */
export function parseServerDateTime(value: string | null | undefined): Date | null {
  if (!value) return null
  const normalised = value.replace(/(\.\d{3})\d+$/, '$1')
  const date = new Date(normalised)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatProjectRelative(value: string | null | undefined): string {
  const date = parseServerDateTime(value)
  return date ? formatDistanceToNow(date, { addSuffix: true }) : ''
}

export function formatProjectDateTime(value: string | null | undefined): string {
  const date = parseServerDateTime(value)
  return date ? format(date, "d MMM yyyy 'at' HH:mm") : ''
}
