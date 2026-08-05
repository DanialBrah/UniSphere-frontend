import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  formatNewsDate,
  formatNewsRelative,
  fromDateTimeLocalValue,
  isFutureInBrowserTime,
  isScheduled,
  parseServerDateTime,
  toDateTimeLocalValue,
} from '../../../../features/news/utils/dateUtils'

describe('parseServerDateTime', () => {
  it('parses a naive LocalDateTime as LOCAL time, not UTC', () => {
    // This is the whole point of the helper: the backend sends no offset, and treating the
    // value as UTC would shift every timestamp by the viewer's offset.
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

  it('keeps a 3-digit fraction untouched', () => {
    expect(parseServerDateTime('2026-08-02T14:31:22.987')!.getMilliseconds()).toBe(987)
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
    expect(formatNewsRelative(null)).toBe('')
    expect(formatNewsDate(null)).toBe('')
  })

  it('formats a real timestamp', () => {
    expect(formatNewsDate('2026-08-02T14:31:22.123456')).toBe('2 Aug 2026')
  })
})

describe('datetime-local converters', () => {
  it('slices a server value down to the control format', () => {
    expect(toDateTimeLocalValue('2026-08-04T09:00:00.000000')).toBe('2026-08-04T09:00')
  })

  it('returns an empty string when there is no schedule', () => {
    expect(toDateTimeLocalValue(null)).toBe('')
    expect(toDateTimeLocalValue(undefined)).toBe('')
  })

  it('appends seconds to a 16-character control value', () => {
    expect(fromDateTimeLocalValue('2026-08-04T09:00')).toBe('2026-08-04T09:00:00')
  })

  it('passes a 19-character value through, for browsers that include seconds', () => {
    expect(fromDateTimeLocalValue('2026-08-04T09:00:30')).toBe('2026-08-04T09:00:30')
  })

  it('returns undefined for an empty box so the field can be omitted entirely', () => {
    // An omitted scheduledAt on a DRAFT -> DRAFT transition is what "unschedule" means.
    expect(fromDateTimeLocalValue('')).toBeUndefined()
    expect(fromDateTimeLocalValue('   ')).toBeUndefined()
  })

  it('round-trips server -> control -> server without drifting', () => {
    const server = '2026-08-04T09:00:00'
    expect(fromDateTimeLocalValue(toDateTimeLocalValue(server))).toBe(server)
  })
})

describe('isScheduled', () => {
  it('is true only for a DRAFT carrying a scheduledAt', () => {
    expect(isScheduled({ status: 'DRAFT', scheduledAt: '2026-08-04T09:00:00' })).toBe(true)
  })

  it('is false for a draft with no schedule', () => {
    expect(isScheduled({ status: 'DRAFT', scheduledAt: null })).toBe(false)
    expect(isScheduled({ status: 'DRAFT' })).toBe(false)
  })

  it('is false for published and archived articles regardless of scheduledAt', () => {
    expect(isScheduled({ status: 'PUBLISHED', scheduledAt: '2026-08-04T09:00:00' })).toBe(false)
    expect(isScheduled({ status: 'ARCHIVED', scheduledAt: '2026-08-04T09:00:00' })).toBe(false)
  })
})

describe('isFutureInBrowserTime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('accepts a time after the browser clock', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 2, 12, 0, 0))
    expect(isFutureInBrowserTime('2026-08-02T13:00')).toBe(true)
  })

  it('rejects a time already past on the browser clock', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 2, 12, 0, 0))
    expect(isFutureInBrowserTime('2026-08-02T11:00')).toBe(false)
  })

  it('rejects an empty value', () => {
    expect(isFutureInBrowserTime('')).toBe(false)
  })
})
