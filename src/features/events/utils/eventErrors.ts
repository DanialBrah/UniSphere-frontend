import { getErrorMessage, parseApiError } from '../../../lib/utils'

/**
 * Turns an Events API failure into copy a user can act on.
 *
 * Matching is on `error.code` first and the message only as a secondary discriminator: the codes
 * are a stable contract, the messages are not. Anything unmapped falls through to
 * getErrorMessage, so this can never be worse than the default behaviour.
 */
export function eventErrorMessage(err: unknown): string {
  const { status, code, message, retryAfterSeconds } = parseApiError(err)
  const detail = message ?? ''

  switch (code) {
    case 'EVENT_NOT_FOUND':
      return "This event doesn't exist, or it isn't available to you."

    case 'EVENT_REGISTRATION_NOT_FOUND':
      return "That registration doesn't exist, or it isn't available to you."

    case 'INVALID_EVENT_STATUS_TRANSITION':
      if (detail.includes('COMPLETED')) {
        return "This event's completion is set automatically once it ends — it can't be marked complete manually."
      }
      if (detail.includes('CANCELLED')) {
        return 'This event is already cancelled, so its status cannot change again.'
      }
      return "That status change isn't allowed from here. Refresh to see the current status."

    case 'INVALID_EVENT_REGISTRATION_TRANSITION':
      if (detail.includes('waitlist')) {
        return "This ticket is on the waitlist, not a confirmed seat, so it can't be checked in yet."
      }
      if (detail.includes('cancelled')) {
        return 'This registration was already cancelled.'
      }
      if (detail.includes('checked in')) {
        return 'This ticket has already been checked in.'
      }
      return 'That change is no longer possible for this registration. Refresh to see its current status.'

    case 'FORBIDDEN':
      if (detail.includes('Media key') || detail.includes('media key')) {
        return 'That upload has expired. Please pick the image again.'
      }
      if (detail.includes('organizer')) {
        return 'Only the organizer can do that.'
      }
      return "You don't have permission to do that."

    case 'MEDIA_UPLOAD_FAILED':
      return "The upload didn't go through. Please try again."

    case 'RATE_LIMIT_EXCEEDED':
      return rateLimitCopy(retryAfterSeconds)

    case 'BAD_REQUEST':
      // These mirror the cross-field rules in the zod schema, which should catch them first. If one
      // still lands here the client and server have drifted, so the copy stays actionable.
      if (detail.includes('external registration')) {
        return "This event's registration moved to an external link — refresh the page to register there."
      }
      if (detail.includes('already registered')) {
        return "You're already registered for this event."
      }
      if (detail.includes('event you organize')) {
        return "You're the organizer of this event, so there's nothing to register for."
      }
      if (detail.includes('already started')) {
        return 'Registration is closed — this event has already started.'
      }
      if (detail.includes('only open for published')) {
        return 'This event is not open for registration.'
      }
      if (detail.includes('Invalid ticket code')) {
        return 'No ticket with that code was found for this event.'
      }
      if (detail.includes('active registrations')) {
        return 'This event still has active registrations — cancel it instead of deleting it.'
      }
      if (detail.includes('File type not allowed') || detail.includes('extension')) {
        return 'Only JPG, PNG, GIF and WebP images are supported.'
      }
      return detail || getErrorMessage(err)

    case 'VALIDATION_ERROR':
      if (detail.includes('startDatetime')) {
        return 'The start time must be in the future.'
      }
      if (detail.includes('decimal places')) {
        return 'That location is too precise to store. Drop the pin again.'
      }
      if (detail.includes('Unsupported content type')) {
        return "That file type isn't supported. Use JPG, PNG, GIF or WebP."
      }
      // The server joins the @Size/@NotBlank messages, which are already user-facing.
      return detail || getErrorMessage(err)

    case 'INTERNAL_ERROR':
      if (import.meta.env.DEV) {
        // GlobalExceptionHandler doesn't extend ResponseEntityExceptionHandler, so a bind failure
        // — an invalid ?category=, a missing ?q= — lands on the catch-all as a 500 rather than a 400.
        console.warn(
          '[events] INTERNAL_ERROR — check for an invalid enum param or a missing required query param',
          err,
        )
      }
      return 'Something went wrong on our end. Please try again.'

    default:
      break
  }

  // 401 is intentionally unhandled — the axios interceptor refreshes the token and retries.
  // /register is rate-limited to 10 requests a minute, so 429 there is a routine outcome.
  if (status === 429) return rateLimitCopy(retryAfterSeconds)

  return getErrorMessage(err)
}

function rateLimitCopy(retryAfterSeconds: number | null): string {
  return retryAfterSeconds
    ? `You're doing that too quickly. Please wait ${retryAfterSeconds} seconds.`
    : "You're doing that too quickly. Please wait a moment."
}
