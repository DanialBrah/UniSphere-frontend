import { describe, it, expect } from 'vitest'
import { AxiosError } from 'axios'
import { getErrorMessage } from '../../lib/utils'

describe('getErrorMessage', () => {
  it('returns the backend message from an AxiosError that has a response body', () => {
    const err = new AxiosError('Request failed', '409')
    Object.defineProperty(err, 'response', {
      value: { data: { message: 'Email already taken' }, status: 409 },
    })
    expect(getErrorMessage(err)).toBe('Email already taken')
  })

  it('falls back to err.message when the AxiosError response has no message field', () => {
    const err = new AxiosError('Network Error')
    expect(getErrorMessage(err)).toBe('Network Error')
  })

  it('falls back to err.message when AxiosError has no response at all', () => {
    const err = new AxiosError('timeout of 15000ms exceeded')
    expect(getErrorMessage(err)).toBe('timeout of 15000ms exceeded')
  })

  it('returns the generic fallback for a plain Error', () => {
    expect(getErrorMessage(new Error('some js error'))).toBe(
      'Something went wrong. Please try again.',
    )
  })

  it('returns the generic fallback for a string', () => {
    expect(getErrorMessage('string error')).toBe('Something went wrong. Please try again.')
  })

  it('returns the generic fallback for null', () => {
    expect(getErrorMessage(null)).toBe('Something went wrong. Please try again.')
  })
})
