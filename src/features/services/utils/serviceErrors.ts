import { getErrorMessage, parseApiError } from '../../../lib/utils'

/**
 * Turns a Services API failure into copy a user can act on.
 *
 * Matching is on `error.code` first and the message only as a secondary discriminator: the codes
 * are a stable contract, the messages are not. Anything unmapped falls through to
 * getErrorMessage, so this can never be worse than the default behaviour. Message substrings below
 * are copied verbatim from ServiceListingService/ServiceOrderService/ServiceAccessService/ServiceMediaService.
 */
export function serviceErrorMessage(err: unknown): string {
  const { status, code, message, retryAfterSeconds } = parseApiError(err)
  const detail = message ?? ''

  switch (code) {
    case 'SERVICE_LISTING_NOT_FOUND':
      return "This service listing doesn't exist, or it isn't available to you."

    case 'SERVICE_ORDER_NOT_FOUND':
      return "That order doesn't exist, or it isn't available to you."

    case 'INVALID_SERVICE_LISTING_STATUS_TRANSITION':
      return "That status change isn't allowed from here. Refresh to see the current status."

    case 'INVALID_SERVICE_ORDER_TRANSITION':
      if (detail.includes('COMPLETED to') || detail.includes('CANCELLED to') || detail.includes('DISPUTED to')) {
        return 'This order has already reached a final state, so it cannot change again.'
      }
      return 'That change is no longer possible for this order. Refresh to see its current status.'

    case 'FORBIDDEN':
      if (detail.includes('students, alumni and clubs')) {
        return 'Only student, alumni and club accounts can create service listings.'
      }
      if (detail.includes('Admin accounts cannot order')) {
        return 'Admin accounts cannot order services.'
      }
      if (detail.includes('provider who created this listing')) {
        return 'Only the provider who created this listing can manage it.'
      }
      if (detail.includes('Media key')) {
        return 'That upload has expired. Please attach the image again.'
      }
      if (detail.includes('Only the provider can')) {
        return 'Only the provider can do that.'
      }
      if (detail.includes('client, the provider, or an admin') || detail.includes('client, provider, or an admin')) {
        return "You don't have permission to act on this order."
      }
      return "You don't have permission to do that."

    case 'MEDIA_UPLOAD_FAILED':
      return "The upload didn't go through. Please try again."

    case 'RATE_LIMIT_EXCEEDED':
      return rateLimitCopy(retryAfterSeconds)

    case 'BAD_REQUEST':
      // These mirror the cross-field rules in the zod schema, which should catch them first. If one
      // still lands here the client and server have drifted, so the copy stays actionable.
      if (detail.includes('cannot order your own')) {
        return "You can't order your own service listing."
      }
      if (detail.includes('cannot message yourself')) {
        return "You can't message yourself about your own listing."
      }
      if (detail.includes('not currently accepting orders')) {
        return 'This listing is not currently accepting orders.'
      }
      if (detail.includes('price must not be set')) {
        return 'Negotiable listings have no fixed price — clear it or switch pricing type.'
      }
      if (detail.includes('price is required')) {
        return 'Add a price, or switch pricing type to Negotiable.'
      }
      if (detail.includes('title cannot be blank') || detail.includes('category cannot be blank')) {
        return 'Title and category cannot be blank.'
      }
      if (detail.includes('orders in progress')) {
        return 'This listing has orders in progress — resolve them before deleting it.'
      }
      if (detail.includes('agreed price is required')) {
        return 'Enter an agreed price to accept this order.'
      }
      if (detail.includes('only visible via')) {
        return 'Paused listings are only visible from your own listings tab.'
      }
      if (detail.includes('File type not allowed') || detail.includes('extension')) {
        return 'Only JPG, PNG and WebP images are supported.'
      }
      if (detail.includes('exceeds the maximum allowed size')) {
        return 'That image is too large — the limit is 5MB.'
      }
      return detail || getErrorMessage(err)

    case 'VALIDATION_ERROR':
      if (detail.includes('Unsupported content type')) {
        return "That file type isn't supported. Use JPG, PNG or WebP."
      }
      if (detail.includes('scheduledAt')) {
        return 'The scheduled time must be in the future.'
      }
      // The server joins the @Size/@NotBlank messages, which are already user-facing.
      return detail || getErrorMessage(err)

    case 'INTERNAL_ERROR':
      if (import.meta.env.DEV) {
        // GlobalExceptionHandler doesn't extend ResponseEntityExceptionHandler, so a bind failure
        // — an invalid ?pricingType=, a missing ?q= — lands on the catch-all as a 500 rather than a 400.
        console.warn(
          '[services] INTERNAL_ERROR — check for an invalid enum param or a missing required query param',
          err,
        )
      }
      return 'Something went wrong on our end. Please try again.'

    default:
      break
  }

  // 401 is intentionally unhandled — the axios interceptor refreshes the token and retries.
  // Ordering/inquiring are rate-limited to 10 requests/60s, so 429 there is a routine outcome.
  if (status === 429) return rateLimitCopy(retryAfterSeconds)

  return getErrorMessage(err)
}

function rateLimitCopy(retryAfterSeconds: number | null): string {
  return retryAfterSeconds
    ? `You're doing that too quickly. Please wait ${retryAfterSeconds} seconds.`
    : "You're doing that too quickly. Please wait a moment."
}
