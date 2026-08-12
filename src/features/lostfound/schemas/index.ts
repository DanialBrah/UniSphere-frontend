import { z } from 'zod'
import type { LostFoundCategory, LostFoundItemType } from '../types'

// Limits mirror the Java bean-validation constraints so the client rejects what the server would.
export const LF_TITLE_MAX = 255
export const LF_DESCRIPTION_MAX = 5000
export const LF_IDENTIFYING_DETAIL_MAX = 500
export const LF_PLACE_MAX = 255
export const LF_PICKUP_INSTRUCTIONS_MAX = 500
export const LF_PROOF_TEXT_MIN = 20
export const LF_PROOF_TEXT_MAX = 1000
export const LF_DECISION_NOTE_MAX = 500
export const LF_STATUS_NOTE_MAX = 500
export const LF_MEDIA_MAX = 10

const CATEGORY_VALUES = [
  'ELECTRONICS',
  'DOCUMENTS',
  'CARDS_AND_KEYS',
  'CLOTHING',
  'BAGS',
  'ACCESSORIES',
  'BOOKS',
  'SPORTS',
  'PETS',
  'OTHER',
] as const

/**
 * Coordinates travel through the form as strings — an empty number input yields `''`, and RHF has
 * no way to express "absent" on a number field without it becoming NaN. They are parsed once at
 * submit, so the schema validates the string form.
 */
const coordinate = z.string().optional().or(z.literal(''))

export const lostFoundItemSchema = z
  .object({
    itemType: z.enum(['LOST', 'FOUND']),
    category: z.enum(CATEGORY_VALUES),
    title: z
      .string()
      .trim()
      .min(1, 'Give the item a short title')
      .max(LF_TITLE_MAX, `Title must not exceed ${LF_TITLE_MAX} characters`),
    description: z
      .string()
      .max(LF_DESCRIPTION_MAX, `Description must not exceed ${LF_DESCRIPTION_MAX} characters`)
      .optional()
      .or(z.literal('')),
    identifyingDetail: z
      .string()
      .max(
        LF_IDENTIFYING_DETAIL_MAX,
        `Identifying detail must not exceed ${LF_IDENTIFYING_DETAIL_MAX} characters`,
      )
      .optional()
      .or(z.literal('')),
    incidentPlace: z
      .string()
      .max(LF_PLACE_MAX, `Place must not exceed ${LF_PLACE_MAX} characters`)
      .optional()
      .or(z.literal('')),
    incidentLatitude: coordinate,
    incidentLongitude: coordinate,
    pickupPlace: z
      .string()
      .max(LF_PLACE_MAX, `Place must not exceed ${LF_PLACE_MAX} characters`)
      .optional()
      .or(z.literal('')),
    pickupLatitude: coordinate,
    pickupLongitude: coordinate,
    pickupInstructions: z
      .string()
      .max(
        LF_PICKUP_INSTRUCTIONS_MAX,
        `Instructions must not exceed ${LF_PICKUP_INSTRUCTIONS_MAX} characters`,
      )
      .optional()
      .or(z.literal('')),
    occurredAt: z.string().min(1, 'Tell us when this happened'),
  })
  .superRefine((value, ctx) => {
    // Rule 1, mirroring LostFoundService: each coordinate pair is all-or-nothing. The pin controls
    // set both at once, so this only fires if the two ever drift apart.
    if (isHalfPair(value.incidentLatitude, value.incidentLongitude)) {
      ctx.addIssue({
        code: 'custom',
        path: ['incidentLatitude'],
        message: 'Drop the pin again — a location needs both a latitude and a longitude.',
      })
    }
    if (isHalfPair(value.pickupLatitude, value.pickupLongitude)) {
      ctx.addIssue({
        code: 'custom',
        path: ['pickupLatitude'],
        message: 'Drop the pin again — a location needs both a latitude and a longitude.',
      })
    }

    // Rule 2: a FOUND item must say where it can be collected — either a place name or a pin.
    // "Where do I collect it" is the entire point of a found report, so the server 400s without it.
    if (value.itemType === 'FOUND' && !hasPickupLocation(value)) {
      ctx.addIssue({
        code: 'custom',
        path: ['pickupPlace'],
        message: 'Tell the owner where to collect it — add a place, or drop a pickup pin.',
      })
    }
  })

function isHalfPair(lat: string | undefined, lng: string | undefined): boolean {
  return Boolean(lat?.trim()) !== Boolean(lng?.trim())
}

function hasPickupLocation(value: {
  pickupPlace?: string
  pickupLatitude?: string
  pickupLongitude?: string
}): boolean {
  if (value.pickupPlace?.trim()) return true
  return Boolean(value.pickupLatitude?.trim() && value.pickupLongitude?.trim())
}

/**
 * Explicit interfaces, NOT z.infer<> — @hookform/resolvers v5 + Zod v4 infers `unknown` for fields
 * on a schema that uses refinements, which this one does. Same rule as the News and Communities
 * schema files.
 */
export interface LostFoundItemFormData {
  itemType: LostFoundItemType
  category: LostFoundCategory
  title: string
  description?: string
  identifyingDetail?: string
  incidentPlace?: string
  incidentLatitude?: string
  incidentLongitude?: string
  pickupPlace?: string
  pickupLatitude?: string
  pickupLongitude?: string
  pickupInstructions?: string
  occurredAt: string
}

export const lostFoundClaimSchema = z.object({
  proofText: z
    .string()
    .trim()
    .min(
      LF_PROOF_TEXT_MIN,
      `Describe what proves the item is yours (at least ${LF_PROOF_TEXT_MIN} characters)`,
    )
    .max(LF_PROOF_TEXT_MAX, `Keep it under ${LF_PROOF_TEXT_MAX} characters`),
})

export interface LostFoundClaimFormData {
  proofText: string
}

export const lostFoundClaimDecisionSchema = z.object({
  decisionNote: z
    .string()
    .max(LF_DECISION_NOTE_MAX, `Note must not exceed ${LF_DECISION_NOTE_MAX} characters`)
    .optional()
    .or(z.literal('')),
})

export interface LostFoundClaimDecisionFormData {
  decisionNote?: string
}
