import { getErrorMessage, parseApiError } from '../../../lib/utils'

/**
 * Turns a Lost & Found API failure into copy a user can act on.
 *
 * Matching is on `error.code` first and the message only as a secondary discriminator: the codes
 * are a stable contract, the messages are not. Anything unmapped falls through to
 * getErrorMessage, so this can never be worse than the default behaviour.
 */
export function lostFoundErrorMessage(err: unknown): string {
  const { status, code, message, retryAfterSeconds } = parseApiError(err)
  const detail = message ?? ''

  switch (code) {
    case 'LOST_FOUND_ITEM_NOT_FOUND':
      // Deliberately vague. The server returns 404 for "deleted" and "not visible to you" alike so
      // a 403 can't confirm the row exists — saying "no permission" would undo that.
      return "This item doesn't exist, or it isn't available to you."

    case 'LOST_FOUND_CLAIM_NOT_FOUND':
      return "That claim doesn't exist, or it isn't available to you."

    case 'INVALID_LOST_FOUND_STATUS_TRANSITION':
      if (detail.includes('RESOLVED') || detail.includes('CANCELLED')) {
        return 'This item is already closed, so its status cannot change again.'
      }
      return "That status change isn't allowed from here. Refresh to see the current status."

    case 'INVALID_LOST_FOUND_CLAIM_TRANSITION':
      return 'This claim has already been decided. Refresh to see the outcome.'

    case 'FORBIDDEN':
      if (detail.includes('Media key')) {
        return 'That upload has expired. Please pick the file again.'
      }
      if (detail.includes('claims on this item')) {
        return 'Only the person who reported this item can see its claims.'
      }
      return "You don't have permission to do that."

    case 'MEDIA_UPLOAD_FAILED':
      return "The upload didn't go through. Please try again."

    case 'RATE_LIMIT_EXCEEDED':
      return rateLimitCopy(retryAfterSeconds)

    case 'BAD_REQUEST':
      // These mirror the cross-field rules in the zod schema, which should catch them first. If one
      // still lands here the client and server have drifted, so the copy stays actionable.
      if (detail.includes('must be provided together')) {
        return 'A location needs both a latitude and a longitude. Drop the pin again, or clear it.'
      }
      if (detail.includes('FOUND item needs a pickup location')) {
        return 'Tell the owner where to collect it — add a pickup place or drop a pickup pin.'
      }
      if (detail.includes('cannot claim an item you reported')) {
        return "You reported this item, so you can't claim it."
      }
      if (detail.includes('no longer open for claims')) {
        return 'This item is no longer open for claims.'
      }
      if (detail.includes('already have a pending claim')) {
        return 'You already have a claim waiting on this item.'
      }
      if (detail.includes('File type not allowed')) {
        return 'Only JPG, PNG, GIF, WebP, MP4 and MOV files are supported.'
      }
      return detail || getErrorMessage(err)

    case 'VALIDATION_ERROR':
      if (detail.includes('at least 20 characters')) {
        return 'Describe what proves the item is yours — at least 20 characters.'
      }
      if (detail.includes('decimal places')) {
        return 'That location is too precise to store. Drop the pin again.'
      }
      if (detail.includes('occurredAt')) {
        return "The date can't be in the future."
      }
      if (detail.includes('Unsupported content type')) {
        return "That file type isn't supported. Use JPG, PNG, GIF, WebP, MP4 or MOV."
      }
      // The server joins the @Size/@NotBlank messages, which are already user-facing.
      return detail || getErrorMessage(err)

    case 'INTERNAL_ERROR':
      if (import.meta.env.DEV) {
        // GlobalExceptionHandler doesn't extend ResponseEntityExceptionHandler, so a bind failure
        // — an invalid ?category=, a missing ?q= — lands on the catch-all as a 500 rather than a 400.
        console.warn(
          '[lostfound] INTERNAL_ERROR — check for an invalid enum param or a missing required query param',
          err,
        )
      }
      return 'Something went wrong on our end. Please try again.'

    default:
      break
  }

  // 401 is intentionally unhandled — the axios interceptor refreshes the token and retries.
  // The claim endpoints are capped at 10 requests a minute, so 429 is a routine outcome here.
  if (status === 429) return rateLimitCopy(retryAfterSeconds)

  return getErrorMessage(err)
}

function rateLimitCopy(retryAfterSeconds: number | null): string {
  return retryAfterSeconds
    ? `You're doing that too quickly. Please wait ${retryAfterSeconds} seconds.`
    : "You're doing that too quickly. Please wait a moment."
}
