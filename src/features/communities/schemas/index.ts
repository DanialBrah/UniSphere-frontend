import { z } from 'zod'

export const createCommunitySchema = z.object({
  name: z.string().trim().min(1, 'Community name is required').max(255, 'Name is too long'),
  description: z.string().max(5000, 'Description is too long').optional().or(z.literal('')),
  visibility: z.enum(['PUBLIC', 'UNIVERSITY_ONLY', 'PRIVATE']),
})

export const updateCommunitySchema = z.object({
  name: z.string().trim().min(1, 'Community name is required').max(255, 'Name is too long').optional(),
  description: z.string().max(5000, 'Description is too long').optional().or(z.literal('')),
  visibility: z.enum(['PUBLIC', 'UNIVERSITY_ONLY', 'PRIVATE']).optional(),
})

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255, 'Title is too long'),
  content: z.string().trim().min(1, 'Content is required').max(5000, 'Content is too long'),
})

export const updateAnnouncementSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255, 'Title is too long').optional(),
  content: z.string().trim().min(1, 'Content is required').max(5000, 'Content is too long').optional(),
})

export const createCommunityPostSchema = z.object({
  title: z.string().max(255, 'Title is too long').optional().or(z.literal('')),
  content: z.string().trim().min(1, 'Post content is required').max(5000, 'Post is too long'),
})

export const requestToJoinSchema = z.object({
  message: z.string().max(500, 'Message is too long').optional().or(z.literal('')),
})

export const banReasonSchema = z.object({
  reason: z.string().max(500, 'Reason is too long').optional().or(z.literal('')),
})

// Explicit interfaces — NOT z.infer<> — required for Zod v4 + @hookform/resolvers v5 compatibility
// (same documented issue as src/features/social/schemas/index.ts)
export interface CreateCommunityFormData {
  name: string
  description?: string
  visibility: 'PUBLIC' | 'UNIVERSITY_ONLY' | 'PRIVATE'
}

export interface UpdateCommunityFormData {
  name?: string
  description?: string
  visibility?: 'PUBLIC' | 'UNIVERSITY_ONLY' | 'PRIVATE'
}

export interface CreateAnnouncementFormData {
  title: string
  content: string
}

export interface UpdateAnnouncementFormData {
  title?: string
  content?: string
}

export interface CreateCommunityPostFormData {
  title?: string
  content: string
}

export interface RequestToJoinFormData {
  message?: string
}

export interface BanReasonFormData {
  reason?: string
}
