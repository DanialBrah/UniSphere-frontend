import { describe, it, expect } from 'vitest'
import {
  canAuthorNews,
  canCommentOn,
  canDeleteComment,
  canEditComment,
  canModifyArticle,
  canUseUniversityVisibility,
} from '../../../../features/news/utils/permissions'
import type {
  AdminProfile,
  AlumniProfile,
  ClubProfile,
  EmployerProfile,
  StudentProfile,
  UniversityProfile,
  UserProfileResponse,
} from '../../../../features/identity/types/auth'

const base = {
  email: 'a@b.com',
  status: 'ACTIVE' as const,
  isVerified: true,
  avatarUrl: null,
  phone: null,
}

const student: StudentProfile = {
  ...base,
  id: 1,
  role: 'STUDENT',
  fullName: 'Student One',
  matricNumber: null,
  universityEmail: null,
  universityId: 10,
  faculty: null,
  program: null,
  yearOfStudy: null,
  enrollmentDate: null,
  expectedGraduation: null,
}

const alumni: AlumniProfile = {
  ...base,
  id: 2,
  role: 'ALUMNI',
  fullName: 'Alum One',
  universityId: 10,
  graduationYear: '2020',
  degree: null,
  major: null,
  currentCompany: null,
  currentPosition: null,
  linkedinUrl: null,
}

const employer: EmployerProfile = {
  ...base,
  id: 3,
  role: 'EMPLOYER',
  companyName: 'TechCorp',
  companyLogoUrl: null,
  industry: null,
  companySize: null,
  websiteUrl: null,
  description: null,
  companyVerified: true,
}

const clubWithUniversity: ClubProfile = {
  ...base,
  id: 4,
  role: 'CLUB',
  name: 'GDSC',
  universityId: 10,
  description: null,
  logoUrl: null,
  category: null,
  isOfficial: true,
}

const clubWithoutUniversity: ClubProfile = { ...clubWithUniversity, id: 5, universityId: null }

const university: UniversityProfile = {
  ...base,
  id: 10,
  role: 'UNIVERSITY',
  name: 'UniSphere U',
  shortName: null,
  logoUrl: null,
  websiteUrl: null,
  address: null,
  country: null,
  state: null,
  institutionVerified: true,
}

const admin: AdminProfile = {
  ...base,
  id: 6,
  role: 'ADMIN',
  fullName: 'Admin One',
  adminLevel: 'SUPER',
}

describe('canAuthorNews', () => {
  const cases: [string, UserProfileResponse, boolean][] = [
    ['student', student, false],
    ['alumni', alumni, false],
    ['employer', employer, true],
    ['club', clubWithUniversity, true],
    ['university', university, true],
    ['admin', admin, true],
  ]

  it.each(cases)('%s -> %s', (_label, user, expected) => {
    expect(canAuthorNews(user)).toBe(expected)
  })

  it('is false when there is no user', () => {
    expect(canAuthorNews(null)).toBe(false)
    expect(canAuthorNews(undefined)).toBe(false)
  })
})

describe('canUseUniversityVisibility', () => {
  it('allows a university account — it is its own university', () => {
    expect(canUseUniversityVisibility(university)).toBe(true)
  })

  it('allows a club that is linked to a university', () => {
    expect(canUseUniversityVisibility(clubWithUniversity)).toBe(true)
  })

  it('refuses a club with no university link', () => {
    // The server throws IllegalArgumentException -> 400 for this case, so offering the option
    // would produce a failure the author cannot explain.
    expect(canUseUniversityVisibility(clubWithoutUniversity)).toBe(false)
  })

  it('refuses employer and admin, which have no affiliation at all', () => {
    expect(canUseUniversityVisibility(employer)).toBe(false)
    expect(canUseUniversityVisibility(admin)).toBe(false)
  })

  it('refuses roles that cannot author in the first place', () => {
    expect(canUseUniversityVisibility(student)).toBe(false)
    expect(canUseUniversityVisibility(alumni)).toBe(false)
  })
})

describe('canModifyArticle', () => {
  const article = { author: { id: 10 } }

  it('allows the author', () => {
    expect(canModifyArticle(university, article)).toBe(true)
  })

  it('allows any admin', () => {
    expect(canModifyArticle(admin, article)).toBe(true)
  })

  it('refuses an unrelated account', () => {
    expect(canModifyArticle(employer, article)).toBe(false)
  })

  it('refuses when signed out', () => {
    expect(canModifyArticle(null, article)).toBe(false)
  })
})

describe('canCommentOn', () => {
  it('is true only for published articles', () => {
    expect(canCommentOn({ status: 'PUBLISHED' })).toBe(true)
    expect(canCommentOn({ status: 'DRAFT' })).toBe(false)
    expect(canCommentOn({ status: 'ARCHIVED' })).toBe(false)
  })
})

describe('comment permissions are asymmetric', () => {
  const comment = { author: { id: 1 } }

  it('lets the owner edit', () => {
    expect(canEditComment(student, comment)).toBe(true)
  })

  it('does NOT let an admin edit someone else’s comment', () => {
    expect(canEditComment(admin, comment)).toBe(false)
  })

  it('lets both the owner and an admin delete', () => {
    expect(canDeleteComment(student, comment)).toBe(true)
    expect(canDeleteComment(admin, comment)).toBe(true)
  })

  it('refuses a stranger for both', () => {
    expect(canEditComment(employer, comment)).toBe(false)
    expect(canDeleteComment(employer, comment)).toBe(false)
  })
})
