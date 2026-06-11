import { z } from 'zod'

export const createPostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(5000, 'Post is too long'),
  title: z.string().max(255, 'Title is too long').optional().or(z.literal('')),
  visibility: z.enum(['PUBLIC', 'UNIVERSITY', 'FRIENDS', 'PRIVATE']),
})

export const updatePostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(5000, 'Post is too long').optional(),
  title: z.string().max(255, 'Title is too long').optional().or(z.literal('')),
  visibility: z.enum(['PUBLIC', 'UNIVERSITY', 'FRIENDS', 'PRIVATE']).optional(),
})

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment is too long'),
})

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment is too long'),
})

export interface CreatePostFormData {
  content: string
  title?: string
  visibility: 'PUBLIC' | 'UNIVERSITY' | 'FRIENDS' | 'PRIVATE'
}

export interface UpdatePostFormData {
  content?: string
  title?: string
  visibility?: 'PUBLIC' | 'UNIVERSITY' | 'FRIENDS' | 'PRIVATE'
}

export interface CreateCommentFormData {
  content: string
}
