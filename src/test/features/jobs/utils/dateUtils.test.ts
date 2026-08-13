import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  formatJobDateTime,
  formatJobDeadline,
  isDeadlinePassed,
  parseJobDeadline,
  parseServerDateTime,
  todayDateValue,
} from '../../../../features/jobs/utils/dateUtils'

describe('parseServerDateTime — LocalDateTime fields (createdAt/updatedAt)', () => {
  it('parses a naive LocalDateTime as LOCAL time, not UTC', () => {
    const date = parseServerDateTime('2026-08-02T14:31:22')
    expect(date).not.toBeNull()
    expect(date!.getHours()).toBe(14)
    expect(date!.getDate()).toBe(2)
  })

  it('truncates the 6-digit fractional second Java emits', () => {
    const date = parseServerDateTime('2026-08-02T14:31:22.123456')
    expect(date!.getMilliseconds()).toBe(123)
  })

  it('returns null for null, undefined and the empty string', () => {
    expect(parseServerDateTime(null)).toBeNull()
    expect(parseServerDateTime(undefined)).toBeNull()
    expect(parseServerDateTime('')).toBeNull()
  })
})

describe('formatJobDateTime', () => {
  it('formats a real timestamp', () => {
    expect(formatJobDateTime('2026-08-02T14:31:22.123456')).toBe('2 Aug 2026 at 14:31')
  })

  it('returns an empty string for a null timestamp instead of throwing', () => {
    expect(formatJobDateTime(null)).toBe('')
  })
})

/**
 * applicationDeadline is a java.time.LocalDate ("2026-08-13"), not a LocalDateTime — genuinely
 * different parsing from every other date field in this codebase. The regression this guards:
 * `new Date('2026-08-13')` parses a bare date as UTC MIDNIGHT, which reads back as 12 Aug in any
 * timezone west of UTC. `parseJobDeadline` must not have that bug regardless of the host timezone
 * the test runner happens to execute in.
 */
describe('parseJobDeadline — LocalDate field (applicationDeadline)', () => {
  it('parses a bare date string to the same calendar day it names, in local time', () => {
    const date = parseJobDeadline('2026-08-13')
    expect(date).not.toBeNull()
    expect(date!.getFullYear()).toBe(2026)
    expect(date!.getMonth()).toBe(7) // 0-indexed: August
    expect(date!.getDate()).toBe(13)
  })

  it('does NOT reproduce the new Date() UTC-midnight day-shift bug', () => {
    const viaNewDate = new Date('2026-08-13')
    const viaParseJobDeadline = parseJobDeadline('2026-08-13')!
    // In any timezone with a negative UTC offset, these disagree — that disagreement is exactly
    // the bug this helper exists to avoid, so this only meaningfully proves something in such a
    // timezone; asserting the correct value directly (above) is the real regression guard.
    if (viaNewDate.getTimezoneOffset() > 0) {
      expect(viaParseJobDeadline.getDate()).not.toBe(viaNewDate.getUTCDate())
    }
  })

  it('returns null for null, undefined and the empty string', () => {
    expect(parseJobDeadline(null)).toBeNull()
    expect(parseJobDeadline(undefined)).toBeNull()
    expect(parseJobDeadline('')).toBeNull()
  })
})

describe('formatJobDeadline', () => {
  it('formats a bare date', () => {
    expect(formatJobDeadline('2026-08-13')).toBe('13 Aug 2026')
  })

  it('returns an empty string for no deadline', () => {
    expect(formatJobDeadline(null)).toBe('')
  })
})

describe('isDeadlinePassed', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('is false for a deadline in the future', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 1))
    expect(isDeadlinePassed('2026-08-13')).toBe(false)
  })

  it('is true for a deadline in the past', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 20))
    expect(isDeadlinePassed('2026-08-13')).toBe(true)
  })

  it('is false for a job with no deadline at all', () => {
    expect(isDeadlinePassed(null)).toBe(false)
  })
})

describe('todayDateValue', () => {
  it('matches the date-input control format', () => {
    expect(todayDateValue()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
