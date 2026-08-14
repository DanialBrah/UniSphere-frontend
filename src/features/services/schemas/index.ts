import { z } from 'zod'
import type { ServiceDeliveryMode, ServicePricingType } from '../types'

// Limits mirror the Java bean-validation constraints so the client rejects what the server would.
export const SERVICE_TITLE_MAX = 255
export const SERVICE_DESCRIPTION_MAX = 5000
export const SERVICE_CATEGORY_MAX = 100
export const SERVICE_PORTFOLIO_KEY_MAX = 500
export const SERVICE_REQUIREMENTS_MAX = 5000
export const SERVICE_REASON_MAX = 255
export const SERVICE_REVIEW_COMMENT_MAX = 5000

const PRICING_TYPE_VALUES = ['FIXED', 'HOURLY', 'NEGOTIABLE'] as const
const DELIVERY_MODE_VALUES = ['ONLINE', 'PHYSICAL', 'BOTH'] as const

/** Price travels through the form as a string — an empty number input yields '', not NaN. */
const numericString = z.string().optional().or(z.literal(''))

const serviceListingFormShape = {
  title: z
    .string()
    .trim()
    .min(1, 'Give the service a title')
    .max(SERVICE_TITLE_MAX, `Title must not exceed ${SERVICE_TITLE_MAX} characters`),
  description: z
    .string()
    .max(SERVICE_DESCRIPTION_MAX, `Description must not exceed ${SERVICE_DESCRIPTION_MAX} characters`)
    .optional()
    .or(z.literal('')),
  category: z
    .string()
    .trim()
    .min(1, 'Pick or type a category')
    .max(SERVICE_CATEGORY_MAX, `Category must not exceed ${SERVICE_CATEGORY_MAX} characters`),
  pricingType: z.enum(PRICING_TYPE_VALUES),
  price: numericString,
  deliveryMode: z.enum(DELIVERY_MODE_VALUES),
}

/**
 * `pricingType`<->`price` is app-level logic in `ServiceListingService.validatePricingRules`, not
 * bean validation: FIXED/HOURLY require a price, NEGOTIABLE forbids one. Mirrored here so the 400
 * never round-trips for this rule.
 */
export const serviceListingFormSchema = z.object(serviceListingFormShape).superRefine((value, ctx) => {
  const hasPrice = !!value.price?.trim()

  if (value.pricingType === 'NEGOTIABLE' && hasPrice) {
    ctx.addIssue({
      code: 'custom',
      path: ['price'],
      message: 'Negotiable listings have no fixed price — clear this or switch pricing type.',
    })
  }
  if (value.pricingType !== 'NEGOTIABLE' && !hasPrice) {
    ctx.addIssue({
      code: 'custom',
      path: ['price'],
      message: 'Add a price, or switch pricing type to Negotiable.',
    })
  }
})

/**
 * Explicit interface, NOT z.infer<> — @hookform/resolvers v5 + Zod v4 infers `unknown` for fields
 * on a schema that uses refinements, which this one does. Same rule as every other feature's
 * schema file in this repo.
 */
export interface ServiceListingFormData {
  title: string
  description?: string
  category: string
  pricingType: ServicePricingType
  price?: string
  deliveryMode: ServiceDeliveryMode
}

/**
 * `proposedPrice` only matters for a NEGOTIABLE listing — a factory rather than a single constant
 * because that requirement depends on the listing being ordered, not on the form's own fields.
 */
export function buildRequestServiceOrderSchema(isNegotiable: boolean) {
  return z
    .object({
      requirements: z
        .string()
        .max(SERVICE_REQUIREMENTS_MAX, `Requirements must not exceed ${SERVICE_REQUIREMENTS_MAX} characters`)
        .optional()
        .or(z.literal('')),
      proposedPrice: numericString,
      scheduledAt: z.string().optional().or(z.literal('')),
    })
    .superRefine((value, ctx) => {
      if (isNegotiable && !value.proposedPrice?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['proposedPrice'],
          message: 'Propose a price — this listing is negotiable, so it has no fixed rate.',
        })
      }
    })
}

export interface RequestServiceOrderFormData {
  requirements?: string
  proposedPrice?: string
  scheduledAt?: string
}

export const serviceReviewSchema = z.object({
  rating: z.number().min(1, 'Pick a rating').max(5),
  comment: z
    .string()
    .max(SERVICE_REVIEW_COMMENT_MAX, `Comment must not exceed ${SERVICE_REVIEW_COMMENT_MAX} characters`)
    .optional()
    .or(z.literal('')),
})

export interface ServiceReviewFormData {
  rating: number
  comment?: string
}
