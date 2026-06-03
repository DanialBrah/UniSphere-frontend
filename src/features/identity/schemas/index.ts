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
  universityId: z.coerce.number().positive().optional(),
  phone,
  faculty: z.string().optional(),
  program: z.string().optional(),
  yearOfStudy: z.coerce.number().min(1).max(10).optional(),
})

export const alumniSchema = z.object({
  email,
  password,
  fullName: z.string().min(2, 'Full name is required'),
  graduationYear: z.string().regex(/^\d{4}$/, 'Must be a 4-digit year (e.g. 2022)'),
  universityId: z.coerce.number().positive().optional(),
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
  universityId: z.coerce.number({ invalid_type_error: 'University ID is required' }).positive('University ID is required'),
  phone,
  category: z.string().optional(),
  description: z.string().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type StudentFormData = z.infer<typeof studentSchema>
export type AlumniFormData = z.infer<typeof alumniSchema>
export type EmployerFormData = z.infer<typeof employerSchema>
export type ClubFormData = z.infer<typeof clubSchema>
