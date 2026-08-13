import { z } from 'zod'

// Limits mirror the Java bean-validation constraints so the client rejects what the server would.
export const PROJECT_TITLE_MAX = 255
export const PROJECT_DESCRIPTION_MAX = 5000
export const PROJECT_URL_MAX = 500
export const PROJECT_ROLE_TITLE_MAX = 100
export const PROJECT_ROLE_DESCRIPTION_MAX = 5000
export const PROJECT_APPLICATION_MESSAGE_MAX = 500
export const PROJECT_APPLICATION_REASON_MAX = 255

export const projectFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Give the project a title')
    .max(PROJECT_TITLE_MAX, `Title must not exceed ${PROJECT_TITLE_MAX} characters`),
  description: z
    .string()
    .max(PROJECT_DESCRIPTION_MAX, `Description must not exceed ${PROJECT_DESCRIPTION_MAX} characters`)
    .optional()
    .or(z.literal('')),
  githubUrl: z
    .string()
    .max(PROJECT_URL_MAX, `Link must not exceed ${PROJECT_URL_MAX} characters`)
    .optional()
    .or(z.literal('')),
  demoUrl: z
    .string()
    .max(PROJECT_URL_MAX, `Link must not exceed ${PROJECT_URL_MAX} characters`)
    .optional()
    .or(z.literal('')),
})

export interface ProjectFormData {
  title: string
  description?: string
  githubUrl?: string
  demoUrl?: string
}

export const projectRoleFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Give the role a title')
    .max(PROJECT_ROLE_TITLE_MAX, `Title must not exceed ${PROJECT_ROLE_TITLE_MAX} characters`),
  description: z
    .string()
    .max(PROJECT_ROLE_DESCRIPTION_MAX, `Description must not exceed ${PROJECT_ROLE_DESCRIPTION_MAX} characters`)
    .optional()
    .or(z.literal('')),
  slots: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
})

export interface ProjectRoleFormData {
  title: string
  description?: string
  slots?: string
}

export const projectApplicationSchema = z.object({
  message: z
    .string()
    .max(PROJECT_APPLICATION_MESSAGE_MAX, `Message must not exceed ${PROJECT_APPLICATION_MESSAGE_MAX} characters`)
    .optional()
    .or(z.literal('')),
})

export interface ProjectApplicationFormData {
  message?: string
}
