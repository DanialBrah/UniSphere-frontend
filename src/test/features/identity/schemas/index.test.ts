import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  studentSchema,
  alumniSchema,
  employerSchema,
  clubSchema,
} from '../../../../features/identity/schemas/index'

// ── loginSchema ───────────────────────────────────────────────────────────────
describe('loginSchema', () => {
  it('passes with valid email and any non-empty password', () => {
    expect(loginSchema.safeParse({ email: 'user@uni.edu', password: 'pass' }).success).toBe(true)
  })

  it('fails when email is missing', () => {
    expect(loginSchema.safeParse({ email: '', password: 'pass' }).success).toBe(false)
  })

  it('fails when email is not a valid email address', () => {
    expect(loginSchema.safeParse({ email: 'notanemail', password: 'pass' }).success).toBe(false)
  })

  it('fails when password is empty', () => {
    expect(loginSchema.safeParse({ email: 'user@uni.edu', password: '' }).success).toBe(false)
  })
})

// ── studentSchema ─────────────────────────────────────────────────────────────
describe('studentSchema', () => {
  const valid = {
    email: 'jane@uni.edu',
    password: 'password123',
    fullName: 'Jane Smith',
    matricNumber: 'A22EC0001',
  }

  it('passes with only the four required fields', () => {
    expect(studentSchema.safeParse(valid).success).toBe(true)
  })

  it('passes with all optional fields populated', () => {
    const full = {
      ...valid,
      universityEmail: 'jane@official.edu',
      phone: '+601234567890',
      faculty: 'Computing',
      program: 'Software Engineering',
      yearOfStudy: 2,
    }
    expect(studentSchema.safeParse(full).success).toBe(true)
  })

  it('fails when fullName is empty', () => {
    expect(studentSchema.safeParse({ ...valid, fullName: '' }).success).toBe(false)
  })

  it('fails when matricNumber is empty', () => {
    expect(studentSchema.safeParse({ ...valid, matricNumber: '' }).success).toBe(false)
  })

  it('fails when password is shorter than 8 characters', () => {
    expect(studentSchema.safeParse({ ...valid, password: 'short' }).success).toBe(false)
  })

  it('fails with an invalid email format', () => {
    expect(studentSchema.safeParse({ ...valid, email: 'bad-email' }).success).toBe(false)
  })

  it('fails when universityEmail is provided but invalid', () => {
    expect(studentSchema.safeParse({ ...valid, universityEmail: 'notanemail' }).success).toBe(false)
  })
})

// ── alumniSchema ──────────────────────────────────────────────────────────────
describe('alumniSchema', () => {
  const valid = {
    email: 'john@example.com',
    password: 'password123',
    fullName: 'John Doe',
    graduationYear: '2022',
  }

  it('passes with required fields only', () => {
    expect(alumniSchema.safeParse(valid).success).toBe(true)
  })

  it('fails when graduationYear is not a 4-digit string', () => {
    expect(alumniSchema.safeParse({ ...valid, graduationYear: '22' }).success).toBe(false)
    expect(alumniSchema.safeParse({ ...valid, graduationYear: '22222' }).success).toBe(false)
    expect(alumniSchema.safeParse({ ...valid, graduationYear: 'abcd' }).success).toBe(false)
  })

  it('fails when fullName is empty', () => {
    expect(alumniSchema.safeParse({ ...valid, fullName: '' }).success).toBe(false)
  })

  it('passes when optional linkedinUrl is a valid URL', () => {
    expect(
      alumniSchema.safeParse({ ...valid, linkedinUrl: 'https://linkedin.com/in/john' }).success,
    ).toBe(true)
  })

  it('fails when optional linkedinUrl is an invalid URL', () => {
    expect(alumniSchema.safeParse({ ...valid, linkedinUrl: 'not-a-url' }).success).toBe(false)
  })

  it('passes when optional linkedinUrl is an empty string (field cleared)', () => {
    expect(alumniSchema.safeParse({ ...valid, linkedinUrl: '' }).success).toBe(true)
  })
})

// ── employerSchema ────────────────────────────────────────────────────────────
describe('employerSchema', () => {
  const valid = {
    email: 'hr@acme.com',
    password: 'password123',
    companyName: 'Acme Corp',
  }

  it('passes with required fields only', () => {
    expect(employerSchema.safeParse(valid).success).toBe(true)
  })

  it('fails when companyName has fewer than 2 characters', () => {
    expect(employerSchema.safeParse({ ...valid, companyName: 'A' }).success).toBe(false)
  })

  it('fails when companyName is empty', () => {
    expect(employerSchema.safeParse({ ...valid, companyName: '' }).success).toBe(false)
  })

  it('fails when websiteUrl is provided but not a valid URL', () => {
    expect(employerSchema.safeParse({ ...valid, websiteUrl: 'not-a-url' }).success).toBe(false)
  })

  it('passes when websiteUrl is a valid URL', () => {
    expect(employerSchema.safeParse({ ...valid, websiteUrl: 'https://acme.com' }).success).toBe(true)
  })
})

// ── clubSchema ────────────────────────────────────────────────────────────────
describe('clubSchema', () => {
  const valid = {
    email: 'cs@uni.edu',
    password: 'password123',
    name: 'CS Society',
    universityId: 1,
  }

  it('passes with required fields only', () => {
    expect(clubSchema.safeParse(valid).success).toBe(true)
  })

  it('fails when name is empty', () => {
    expect(clubSchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })

  it('fails when universityId is missing', () => {
    expect(
      clubSchema.safeParse({ email: valid.email, password: valid.password, name: valid.name }).success,
    ).toBe(false)
  })

  it('fails when universityId is zero or negative', () => {
    expect(clubSchema.safeParse({ ...valid, universityId: 0 }).success).toBe(false)
    expect(clubSchema.safeParse({ ...valid, universityId: -1 }).success).toBe(false)
  })

  it('fails when password is shorter than 8 characters', () => {
    expect(clubSchema.safeParse({ ...valid, password: 'short' }).success).toBe(false)
  })
})
