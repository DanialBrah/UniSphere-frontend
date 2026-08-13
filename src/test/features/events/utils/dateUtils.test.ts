import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  formatEventDate,
  formatEventDateTime,
  formatEventRange,
  formatEventRelative,
  fromDateTimeLocalValue,
  isFutureInBrowserTime,
  isPastInBrowserTime,
  nowDateTimeLocalValue,
  parseServerDateTime,
  toDateTimeLocalValue,
} from '../../../../features/events/utils/dateUtils'

describe('parseServerDateTime', () => {
  it('parses a naive LocalDateTime as LOCAL time, not UTC', () => {
    const date = parseServerDateTime('2026-08-02T14:31:22')
    expect(date).not.toBeNull()
    expect(date!.getHours()).toBe(14)
    expect(date!.getMinutes()).toBe(31)
    expect(date!.getDate()).toBe(2)
  })

  it('truncates the 6-digit fractional second Java emits', () => {
    const date = parseServerDateTime('2026-08-02T14:31:22.123456')
    expect(date).not.toBeNull()
    expect(date!.getMilliseconds()).toBe(123)
    expect(date!.getHours()).toBe(14)
  })

  it('returns null for null, undefined and the empty string', () => {
    expect(parseServerDateTime(null)).toBeNull()
    expect(parseServerDateTime(undefined)).toBeNull()
    expect(parseServerDateTime('')).toBeNull()
  })

  it('returns null rather than an Invalid Date for garbage', () => {
    expect(parseServerDateTime('not-a-date')).toBeNull()
  })
})

describe('formatters', () => {
  it('return an empty string for a null timestamp instead of throwing', () => {
    expect(formatEventRelative(null)).toBe('')
    expect(formatEventDate(null)).toBe('')
    expect(formatEventDateTime(null)).toBe('')
  })

  it('formats a real timestamp', () => {
    expect(formatEventDate('2026-08-02T14:31:22.123456')).toBe('2 Aug 2026')
  })
})

describe('formatEventRange', () => {
  it('collapses a same-day range to one date with a start-end time', () => {
    expect(formatEventRange('2026-09-01T18:00:00', '2026-09-01T21:00:00')).toBe(
      '1 Sep 2026, 18:00 – 21:00',
    )
  })

  it('spells out both full dates for a multi-day range', () => {
    expect(formatEventRange('2026-09-01T18:00:00', '2026-09-03T12:00:00')).toBe(
      "1 Sep 2026 at 18:00 – 3 Sep 2026 at 12:00",
    )
  })

  it('falls back to a single formatted date-time when there is no end', () => {
    expect(formatEventRange('2026-09-01T18:00:00', null)).toBe('1 Sep 2026 at 18:00')
  })

  it('returns an empty string when there is no start', () => {
    expect(formatEventRange(null, '2026-09-01T21:00:00')).toBe('')
  })
})

describe('datetime-local converters', () => {
  it('slices a server value down to the control format', () => {
    expect(toDateTimeLocalValue('2026-08-04T09:00:00.000000')).toBe('2026-08-04T09:00')
  })

  it('returns an empty string when there is no value', () => {
    expect(toDateTimeLocalValue(null)).toBe('')
    expect(toDateTimeLocalValue(undefined)).toBe('')
  })

  it('appends seconds to a 16-character control value', () => {
    expect(fromDateTimeLocalValue('2026-08-04T09:00')).toBe('2026-08-04T09:00:00')
  })

  it('returns undefined for an empty box so the field can be omitted entirely', () => {
    expect(fromDateTimeLocalValue('')).toBeUndefined()
    expect(fromDateTimeLocalValue('   ')).toBeUndefined()
  })

  it('round-trips server -> control -> server without drifting', () => {
    const server = '2026-08-04T09:00:00'
    expect(fromDateTimeLocalValue(toDateTimeLocalValue(server))).toBe(server)
  })
})

describe('isFutureInBrowserTime / isPastInBrowserTime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('accepts a time after the browser clock as future, and as not past', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 2, 12, 0, 0))
    expect(isFutureInBrowserTime('2026-08-02T13:00')).toBe(true)
    expect(isPastInBrowserTime('2026-08-02T13:00:00')).toBe(false)
  })

  it('rejects a time already past on the browser clock, and marks it as past', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 2, 12, 0, 0))
    expect(isFutureInBrowserTime('2026-08-02T11:00')).toBe(false)
    expect(isPastInBrowserTime('2026-08-02T11:00:00')).toBe(true)
  })

  it('rejects an empty value as future', () => {
    expect(isFutureInBrowserTime('')).toBe(false)
  })
})

describe('nowDateTimeLocalValue', () => {
  it('matches the datetime-local control format', () => {
    expect(nowDateTimeLocalValue()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
  })
})
