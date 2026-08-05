import { describe, it, expect } from 'vitest'
import {
  allowedTransitions,
  canSchedule,
  canTransition,
  transitionLabel,
} from '../../../../features/news/utils/statusMachine'

describe('allowedTransitions', () => {
  it('offers only Publish from a draft', () => {
    expect(allowedTransitions('DRAFT')).toEqual(['PUBLISHED'])
  })

  it('offers unpublish and archive from published', () => {
    expect(allowedTransitions('PUBLISHED')).toEqual(['DRAFT', 'ARCHIVED'])
  })

  it('offers only restore from archived', () => {
    expect(allowedTransitions('ARCHIVED')).toEqual(['PUBLISHED'])
  })
})

describe('the two transitions the server rejects with a 409', () => {
  it('never offers ARCHIVED from a draft', () => {
    expect(allowedTransitions('DRAFT')).not.toContain('ARCHIVED')
    expect(canTransition('DRAFT', 'ARCHIVED')).toBe(false)
  })

  it('never offers DRAFT from archived', () => {
    expect(allowedTransitions('ARCHIVED')).not.toContain('DRAFT')
    expect(canTransition('ARCHIVED', 'DRAFT')).toBe(false)
  })
})

describe('canSchedule', () => {
  it('is true only for a draft', () => {
    expect(canSchedule('DRAFT')).toBe(true)
    expect(canSchedule('PUBLISHED')).toBe(false)
    expect(canSchedule('ARCHIVED')).toBe(false)
  })
})

describe('transitionLabel', () => {
  it('calls the archived -> published move a Restore, not a Publish', () => {
    expect(transitionLabel('ARCHIVED', 'PUBLISHED')).toBe('Restore')
    expect(transitionLabel('DRAFT', 'PUBLISHED')).toBe('Publish')
  })

  it('labels the remaining moves', () => {
    expect(transitionLabel('PUBLISHED', 'DRAFT')).toBe('Unpublish')
    expect(transitionLabel('PUBLISHED', 'ARCHIVED')).toBe('Archive')
  })
})
