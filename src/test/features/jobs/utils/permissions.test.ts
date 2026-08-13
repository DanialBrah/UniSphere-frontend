import { describe, it, expect } from 'vitest'
import {
  allowedApplicationDecisionTargets,
  allowedJobStatusTargets,
  canApplyToJob,
  canCreateJob,
  canDecideApplication,
  canModifyJob,
  canWithdrawApplication,
  hasApplications,
  isTerminalApplicationStatus,
  isTerminalJobStatus,
} from '../../../../features/jobs/utils/permissions'
import type { UserProfileResponse } from '../../../../features/identity/types/auth'
import type { JobApplicationStatus, JobResponse, JobStatus } from '../../../../features/jobs/types'

function user(id: number, role: UserProfileResponse['role'] = 'STUDENT'): UserProfileResponse {
  return { id, role, fullName: `User ${id}`, email: `u${id}@uni.edu` } as UserProfileResponse
}

function job(overrides: Partial<JobResponse> = {}): JobResponse {
  return {
    id: 1,
    employer: {
      employerId: 10,
      companyName: 'Acme Corp',
      companyLogoUrl: null,
      industry: null,
      companySize: null,
      websiteUrl: null,
      companyVerified: false,
    },
    title: 'Software Engineer Intern',
    description: null,
    requirements: null,
    jobType: 'INTERNSHIP',
    workMode: 'ON_SITE',
    experienceLevel: 'INTERNSHIP',
    location: 'Kuala Lumpur',
    salaryMin: null,
    salaryMax: null,
    salaryCurrency: 'MYR',
    applicationMode: 'INTERNAL',
    externalApplyUrl: null,
    applicationDeadline: null,
    status: 'OPEN',
    applicationCount: 0,
    universityId: 1,
    viewerApplicationStatus: null,
    canModify: false,
    createdAt: '2026-08-05T15:00:00',
    updatedAt: '2026-08-05T15:00:00',
    ...overrides,
  }
}

describe('canCreateJob', () => {
  it('is EMPLOYER-only', () => {
    expect(canCreateJob(user(1, 'EMPLOYER'))).toBe(true)
    expect(canCreateJob(user(1, 'STUDENT'))).toBe(false)
    expect(canCreateJob(user(1, 'ADMIN'))).toBe(false)
  })

  it('is false with no signed-in user', () => {
    expect(canCreateJob(null)).toBe(false)
  })
})

describe('canModifyJob', () => {
  it("is the poster's call, and an admin's", () => {
    expect(canModifyJob(user(10, 'EMPLOYER'), job())).toBe(true)
    expect(canModifyJob(user(99, 'ADMIN'), job())).toBe(true)
  })

  it("is not a stranger's call", () => {
    expect(canModifyJob(user(20), job())).toBe(false)
  })

  it('is false with no signed-in user', () => {
    expect(canModifyJob(null, job())).toBe(false)
  })
})

describe('canApplyToJob', () => {
  it('allows a student or alumnus to apply to an OPEN, INTERNAL job with no existing application', () => {
    expect(canApplyToJob(user(20, 'STUDENT'), job())).toBe(true)
    expect(canApplyToJob(user(20, 'ALUMNI'), job())).toBe(true)
  })

  it('blocks every other role', () => {
    for (const role of ['EMPLOYER', 'CLUB', 'UNIVERSITY', 'ADMIN'] as UserProfileResponse['role'][]) {
      expect(canApplyToJob(user(20, role), job())).toBe(false)
    }
  })

  it("blocks the poster from applying to their own job", () => {
    expect(canApplyToJob(user(10, 'STUDENT'), job({ employer: { ...job().employer, employerId: 10 } }))).toBe(
      false,
    )
  })

  it('blocks applying to an EXTERNAL job — there is no in-app form for it', () => {
    expect(canApplyToJob(user(20, 'STUDENT'), job({ applicationMode: 'EXTERNAL' }))).toBe(false)
  })

  it('blocks applying unless the job is OPEN', () => {
    for (const status of ['DRAFT', 'CLOSED', 'FILLED'] as JobStatus[]) {
      expect(canApplyToJob(user(20, 'STUDENT'), job({ status }))).toBe(false)
    }
  })

  it('blocks a second application while one already exists', () => {
    expect(canApplyToJob(user(20, 'STUDENT'), job({ viewerApplicationStatus: 'SUBMITTED' }))).toBe(false)
    expect(canApplyToJob(user(20, 'STUDENT'), job({ viewerApplicationStatus: 'WITHDRAWN' }))).toBe(false)
  })
})

describe('canWithdrawApplication', () => {
  it('belongs to the applicant alone — not the employer, not an admin', () => {
    const application = { applicantId: 20, status: 'SUBMITTED' as JobApplicationStatus }
    expect(canWithdrawApplication(user(20, 'STUDENT'), application)).toBe(true)
    expect(canWithdrawApplication(user(10, 'EMPLOYER'), application)).toBe(false)
    expect(canWithdrawApplication(user(99, 'ADMIN'), application)).toBe(false)
  })

  it('only applies to a non-terminal application', () => {
    for (const status of ['SUBMITTED', 'REVIEWED', 'SHORTLISTED'] as JobApplicationStatus[]) {
      expect(canWithdrawApplication(user(20), { applicantId: 20, status })).toBe(true)
    }
    for (const status of ['REJECTED', 'HIRED', 'WITHDRAWN'] as JobApplicationStatus[]) {
      expect(canWithdrawApplication(user(20), { applicantId: 20, status })).toBe(false)
    }
  })
})

describe('canDecideApplication', () => {
  const j = job()

  it("is the owning employer's call, and an admin's — never the applicant's", () => {
    const application = { status: 'SUBMITTED' as JobApplicationStatus }
    expect(canDecideApplication(user(10, 'EMPLOYER'), j, application)).toBe(true)
    expect(canDecideApplication(user(99, 'ADMIN'), j, application)).toBe(true)
    expect(canDecideApplication(user(20, 'STUDENT'), j, application)).toBe(false)
  })

  it('only applies to a non-terminal application', () => {
    for (const status of ['REJECTED', 'HIRED', 'WITHDRAWN'] as JobApplicationStatus[]) {
      expect(canDecideApplication(user(10, 'EMPLOYER'), j, { status })).toBe(false)
    }
  })
})

describe('allowedJobStatusTargets', () => {
  it('mirrors the server FSM', () => {
    expect(allowedJobStatusTargets('DRAFT')).toEqual(['OPEN', 'CLOSED'])
    expect(allowedJobStatusTargets('OPEN')).toEqual(['CLOSED', 'FILLED'])
  })

  it('offers nothing from a terminal state', () => {
    expect(allowedJobStatusTargets('CLOSED')).toEqual([])
    expect(allowedJobStatusTargets('FILLED')).toEqual([])
  })
})

describe('isTerminalJobStatus', () => {
  it('covers exactly the two states with no outgoing transitions', () => {
    expect(isTerminalJobStatus('CLOSED')).toBe(true)
    expect(isTerminalJobStatus('FILLED')).toBe(true)
    expect(isTerminalJobStatus('DRAFT')).toBe(false)
    expect(isTerminalJobStatus('OPEN')).toBe(false)
  })
})

describe('allowedApplicationDecisionTargets', () => {
  it('offers the other three decision targets from SUBMITTED/REVIEWED/SHORTLISTED', () => {
    expect(allowedApplicationDecisionTargets('SUBMITTED')).toEqual(['REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED'])
    expect(allowedApplicationDecisionTargets('REVIEWED')).toEqual(['SHORTLISTED', 'REJECTED', 'HIRED'])
  })

  it('offers nothing from a terminal application status', () => {
    for (const status of ['REJECTED', 'HIRED', 'WITHDRAWN'] as JobApplicationStatus[]) {
      expect(allowedApplicationDecisionTargets(status)).toEqual([])
    }
  })
})

describe('isTerminalApplicationStatus', () => {
  it('covers exactly the three states with no outgoing transitions', () => {
    expect(isTerminalApplicationStatus('REJECTED')).toBe(true)
    expect(isTerminalApplicationStatus('HIRED')).toBe(true)
    expect(isTerminalApplicationStatus('WITHDRAWN')).toBe(true)
    expect(isTerminalApplicationStatus('SUBMITTED')).toBe(false)
    expect(isTerminalApplicationStatus('REVIEWED')).toBe(false)
    expect(isTerminalApplicationStatus('SHORTLISTED')).toBe(false)
  })
})

describe('hasApplications', () => {
  it('is true once applicationCount is non-zero — the only case DELETE actually blocks', () => {
    expect(hasApplications({ applicationCount: 1 })).toBe(true)
    expect(hasApplications({ applicationCount: 0 })).toBe(false)
  })
})
