import { format, formatDistanceToNow, parseISO } from 'date-fns'

/**
 * The backend serialises java.time.LocalDateTime (createdAt/updatedAt) with no Jackson
 * customisation, so timestamps arrive as "2026-08-02T14:31:22.123456" — no Z, no offset, and a
 * 6-digit fractional part. Six fractional digits are outside ES2016's three-digit grammar, so
 * engines are only required to be tolerant — truncating here removes the ambiguity rather than
 * betting on it. Same helper as `events/utils/dateUtils.ts`.
 */
export function parseServerDateTime(value: string | null | undefined): Date | null {
  if (!value) return null
  const normalised = value.replace(/(\.\d{3})\d+$/, '$1')
  const date = new Date(normalised)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatJobRelative(value: string | null | undefined): string {
  const date = parseServerDateTime(value)
  return date ? formatDistanceToNow(date, { addSuffix: true }) : ''
}

export function formatJobDateTime(value: string | null | undefined): string {
  const date = parseServerDateTime(value)
  return date ? format(date, "d MMM yyyy 'at' HH:mm") : ''
}

/**
 * `applicationDeadline` is a java.time.LocalDate ("2026-08-13"), not a LocalDateTime — a genuinely
 * different shape from every other date field in this codebase. Per spec, a bare date-ONLY string
 * handed to `new Date()` is parsed as UTC midnight, which shifts a day in any timezone west of UTC
 * (exactly the trap `events/utils/dateUtils.ts` warns against for its own datetime fields — that
 * file avoids it by never parsing a bare date). `date-fns`'s `parseISO` instead treats a bare date
 * string as LOCAL midnight, which is what a deadline actually means to the person picking it.
 */
export function parseJobDeadline(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = parseISO(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatJobDeadline(value: string | null | undefined): string {
  const date = parseJobDeadline(value)
  return date ? format(date, 'd MMM yyyy') : ''
}

/** Best-effort — the server evaluates against its own clock, which the browser can't discover. */
export function isDeadlinePassed(value: string | null | undefined): boolean {
  const date = parseJobDeadline(value)
  if (!date) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date.getTime() < today.getTime()
}

/** Today as a date-input value — used as `min` on the applicationDeadline input at create time. */
export function todayDateValue(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}
