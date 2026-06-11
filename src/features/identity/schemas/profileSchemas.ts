import { z } from 'zod'

const phone = z
  .string()
  .regex(/^\+?[\d\s\-()]{7,20}$/, 'Enter a valid phone number')
  .optional()
  .or(z.literal(''))

export const baseProfileSchema = z.object({ phone })

export const studentProfileSchema = baseProfileSchema.extend({
  fullName: z.string().min(2, 'Full name is required').max(100),
  faculty: z.string().max(100).optional().or(z.literal('')),
  program: z.string().max(100).optional().or(z.literal('')),
  yearOfStudy: z.string().optional().or(z.literal('')),
})

export const alumniProfileSchema = baseProfileSchema.extend({
  fullName: z.string().min(2, 'Full name is required').max(100),
  currentCompany: z.string().max(200).optional().or(z.literal('')),
  currentPosition: z.string().max(200).optional().or(z.literal('')),
  linkedinUrl: z.union([z.string().url('Enter a valid LinkedIn URL'), z.literal('')]).optional(),
})

export const employerProfileSchema = baseProfileSchema.extend({
  companyName: z.string().min(2, 'Company name is required').max(200),
  industry: z.string().max(100).optional().or(z.literal('')),
  companySize: z.string().max(50).optional().or(z.literal('')),
  websiteUrl: z.union([z.string().url('Enter a valid website URL'), z.literal('')]).optional(),
  description: z.string().max(1000).optional().or(z.literal('')),
})

export const clubProfileSchema = baseProfileSchema.extend({
  category: z.string().max(100).optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
})

export const universityProfileSchema = baseProfileSchema.extend({
  shortName: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(300).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
})

export const adminProfileSchema = baseProfileSchema

// Explicit form data interfaces (avoid z.infer<> to stay compatible with hookform resolver)
export interface StudentEditFormData {
  phone?: string
  fullName: string
  faculty?: string
  program?: string
  yearOfStudy?: string
}

export interface AlumniEditFormData {
  phone?: string
  fullName: string
  currentCompany?: string
  currentPosition?: string
  linkedinUrl?: string
}

export interface EmployerEditFormData {
  phone?: string
  companyName: string
  industry?: string
  companySize?: string
  websiteUrl?: string
  description?: string
}

export interface ClubEditFormData {
  phone?: string
  category?: string
  description?: string
}

export interface UniversityEditFormData {
  phone?: string
  shortName?: string
  address?: string
  country?: string
  state?: string
}

export interface AdminEditFormData {
  phone?: string
}
