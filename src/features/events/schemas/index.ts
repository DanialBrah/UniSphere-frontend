import { z } from 'zod'
import type { EventCategory, EventRegistrationMode } from '../types'

// Limits mirror the Java bean-validation constraints so the client rejects what the server would.
export const EVENT_TITLE_MAX = 255
export const EVENT_DESCRIPTION_MAX = 5000
export const EVENT_URL_MAX = 500
export const EVENT_VENUE_MAX = 255

const CATEGORY_VALUES = [
  'ACADEMIC',
  'CAREER',
  'WORKSHOP',
  'SOCIAL',
  'SPORTS',
  'CULTURAL',
  'TECH',
  'CLUB',
  'ORIENTATION',
  'OTHER',
] as const

/**
 * Coordinates and capacity travel through the form as strings — an empty number input yields '',
 * and RHF has no way to express "absent" on a number field without it becoming NaN. They are
 * parsed once at submit, so the schema validates the string form.
 */
const numericString = z.string().optional().or(z.literal(''))

export const eventFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Give the event a title')
      .max(EVENT_TITLE_MAX, `Title must not exceed ${EVENT_TITLE_MAX} characters`),
    description: z
      .string()
      .max(EVENT_DESCRIPTION_MAX, `Description must not exceed ${EVENT_DESCRIPTION_MAX} characters`)
      .optional()
      .or(z.literal('')),
    category: z.enum(CATEGORY_VALUES),
    startDatetime: z.string().min(1, 'Choose when the event starts'),
    endDatetime: z.string().min(1, 'Choose when the event ends'),
    online: z.boolean(),
    onlineUrl: z
      .string()
      .max(EVENT_URL_MAX, `Link must not exceed ${EVENT_URL_MAX} characters`)
      .optional()
      .or(z.literal('')),
    venueName: z
      .string()
      .max(EVENT_VENUE_MAX, `Venue name must not exceed ${EVENT_VENUE_MAX} characters`)
      .optional()
      .or(z.literal('')),
    latitude: numericString,
    longitude: numericString,
    registrationMode: z.enum(['INTERNAL', 'EXTERNAL']),
    externalRegistrationUrl: z
      .string()
      .max(EVENT_URL_MAX, `Link must not exceed ${EVENT_URL_MAX} characters`)
      .optional()
      .or(z.literal('')),
    maxCapacity: numericString,
  })
  .superRefine((value, ctx) => {
    // Rule 1 — online events need a join link.
    if (value.online && !value.onlineUrl?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['onlineUrl'],
        message: 'Add the link people will join from.',
      })
    }

    // Rule 2 — in-person events need somewhere to show up.
    if (!value.online && !value.venueName?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['venueName'],
        message: 'Tell people where this happens.',
      })
    }

    // Rule 3 — in-person events need a pin, so they can actually appear on the map.
    if (!value.online) {
      const hasLat = Boolean(value.latitude?.trim())
      const hasLng = Boolean(value.longitude?.trim())
      if (!hasLat || !hasLng) {
        ctx.addIssue({
          code: 'custom',
          path: ['latitude'],
          message: 'Drop a pin so this shows up on the map.',
        })
      }
    }

    // Rule 4 — external registration needs a link, and capacity is meaningless without in-app
    // tracking (the server 400s if both are set).
    if (value.registrationMode === 'EXTERNAL') {
      if (!value.externalRegistrationUrl?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['externalRegistrationUrl'],
          message: 'Add the link people register at.',
        })
      }
      if (value.maxCapacity?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['maxCapacity'],
          message: 'Capacity is tracked on the external site — leave this blank.',
        })
      }
    } else if (value.externalRegistrationUrl?.trim()) {
      // Rule 5 — an internal event has no use for an external link.
      ctx.addIssue({
        code: 'custom',
        path: ['externalRegistrationUrl'],
        message: 'Only used for external registration — clear this or switch registration mode.',
      })
    }

    // Not one of "the 5" cross-field rules — a plain temporal check, same idea as
    // CreateLostFoundItemRequest's occurredAt-in-the-past check.
    if (
      value.startDatetime &&
      value.endDatetime &&
      value.endDatetime <= value.startDatetime
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDatetime'],
        message: 'End time must be after the start time.',
      })
    }
  })

/**
 * Explicit interface, NOT z.infer<> — @hookform/resolvers v5 + Zod v4 infers `unknown` for fields
 * on a schema that uses refinements, which this one does. Same rule as every other feature's
 * schema file in this repo.
 */
export interface EventFormData {
  title: string
  description?: string
  category: EventCategory
  startDatetime: string
  endDatetime: string
  online: boolean
  onlineUrl?: string
  venueName?: string
  latitude?: string
  longitude?: string
  registrationMode: EventRegistrationMode
  externalRegistrationUrl?: string
  maxCapacity?: string
}
