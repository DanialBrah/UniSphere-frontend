import { z } from 'zod'

const email = z.string().min(1, 'Email is required').email('Invalid email address')
const password = z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password too long')
const phone = z
  .string()
  .regex(/^\+?[0-9]{7,15}$/, 'Invalid phone number')
  .optional()
  .or(z.literal(''))

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
})

export const studentSchema = z.object({
  email,
  password,
  fullName: z.string().min(2, 'Full name is required'),
  matricNumber: z.string().min(1, 'Matric number is required'),
  universityEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  universityId: z.preprocess(val => val === '' ? undefined : val, z.coerce.number().positive().optional()),
  phone,
  faculty: z.string().optional(),
  program: z.string().optional(),
  yearOfStudy: z.preprocess(val => val === '' ? undefined : val, z.coerce.number().min(1).max(10).optional()),
})

export const alumniSchema = z.object({
  email,
  password,
  fullName: z.string().min(2, 'Full name is required'),
  graduationYear: z.string().regex(/^\d{4}$/, 'Must be a 4-digit year (e.g. 2022)'),
  universityId: z.preprocess(val => val === '' ? undefined : val, z.coerce.number().positive().optional()),
  phone,
  degree: z.string().optional(),
  major: z.string().optional(),
  currentCompany: z.string().optional(),
  currentPosition: z.string().optional(),
  linkedinUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export const employerSchema = z.object({
  email,
  password,
  companyName: z.string().min(2, 'Company name is required'),
  phone,
  industry: z.string().optional(),
  companySize: z.string().optional(),
  websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  description: z.string().optional(),
})

export const clubSchema = z.object({
  email,
  password,
  name: z.string().min(2, 'Club name is required'),
  universityId: z.number({ message: 'University ID is required' }).min(1, 'University ID is required'),
  phone,
  category: z.string().optional(),
  description: z.string().optional(),
})

// Explicit interfaces — do not use z.infer here; @hookform/resolvers v5 + Zod v4
// infers unknown for numeric fields when using refinements (.positive()/.min()).
export interface LoginFormData {
  email: string
  password: string
}

export interface StudentFormData {
  email: string
  password: string
  fullName: string
  matricNumber: string
  universityEmail?: string
  universityId?: number
  phone?: string
  faculty?: string
  program?: string
  yearOfStudy?: number
}

export interface AlumniFormData {
  email: string
  password: string
  fullName: string
  graduationYear: string
  universityId?: number
  phone?: string
  degree?: string
  major?: string
  currentCompany?: string
  currentPosition?: string
  linkedinUrl?: string
}

export interface EmployerFormData {
  email: string
  password: string
  companyName: string
  phone?: string
  industry?: string
  companySize?: string
  websiteUrl?: string
  description?: string
}

export interface ClubFormData {
  email: string
  password: string
  name: string
  universityId: number
  phone?: string
  category?: string
  description?: string
}

export const forgotPasswordSchema = z.object({ email })

export const resetPasswordSchema = z
  .object({ newPassword: password, confirmPassword: password })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export interface ForgotPasswordFormData {
  email: string
}

export interface ResetPasswordFormData {
  newPassword: string
  confirmPassword: string
}
