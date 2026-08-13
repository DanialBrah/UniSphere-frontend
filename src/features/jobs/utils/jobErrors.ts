import { getErrorMessage, parseApiError } from '../../../lib/utils'

/**
 * Turns a Jobs API failure into copy a user can act on.
 *
 * Matching is on `error.code` first and the message only as a secondary discriminator: the codes
 * are a stable contract, the messages are not. Anything unmapped falls through to
 * getErrorMessage, so this can never be worse than the default behaviour. Message substrings below
 * are copied verbatim from JobService/JobApplicationService/JobApplicationMediaService.
 */
export function jobErrorMessage(err: unknown): string {
  const { status, code, message, retryAfterSeconds } = parseApiError(err)
  const detail = message ?? ''

  switch (code) {
    case 'JOB_NOT_FOUND':
      return "This job posting doesn't exist, or it isn't available to you."

    case 'JOB_APPLICATION_NOT_FOUND':
      return "That application doesn't exist, or it isn't available to you."

    case 'INVALID_JOB_STATUS_TRANSITION':
      if (detail.includes('CLOSED to') || detail.includes('FILLED to')) {
        return 'This job is already closed or filled, so its status cannot change again.'
      }
      return "That status change isn't allowed from here. Refresh to see the current status."

    case 'INVALID_JOB_APPLICATION_TRANSITION':
      if (detail.includes('HIRED to') || detail.includes('REJECTED to') || detail.includes('WITHDRAWN to')) {
        return 'This application has already reached a final decision, so it cannot change again.'
      }
      return 'That change is no longer possible for this application. Refresh to see its current status.'

    case 'FORBIDDEN':
      if (detail.includes('Media key')) {
        return 'That upload has expired. Please attach the résumé again.'
      }
      if (detail.includes('applicant may withdraw')) {
        return 'Only the applicant can withdraw this application.'
      }
      if (detail.includes("employer can update")) {
        return "Only the job's employer can decide on this application."
      }
      return "You don't have permission to do that."

    case 'MEDIA_UPLOAD_FAILED':
      return "The upload didn't go through. Please try again."

    case 'RATE_LIMIT_EXCEEDED':
      return rateLimitCopy(retryAfterSeconds)

    case 'BAD_REQUEST':
      // These mirror the cross-field rules in the zod schema, which should catch them first. If one
      // still lands here the client and server have drifted, so the copy stays actionable.
      if (detail.includes("employer's own site")) {
        return "This job's applications go through the employer's own site — refresh the page to apply there."
      }
      if (detail.includes('already applied')) {
        return "You've already applied to this job."
      }
      if (detail.includes('only open for OPEN')) {
        return 'This job is not currently accepting applications.'
      }
      if (detail.includes('deadline for this job has passed')) {
        return 'The application deadline for this job has passed.'
      }
      if (detail.includes('salaryMin')) {
        return 'Maximum salary must be at least the minimum.'
      }
      if (detail.includes('remote job cannot have a location')) {
        return 'Remote roles have no location — clear it or switch work mode.'
      }
      if (detail.includes('on-site or hybrid job requires a location')) {
        return 'Add a location, or switch to Remote.'
      }
      if (detail.includes('External application mode requires')) {
        return 'Add the link applicants should apply at.'
      }
      if (detail.includes('externalApplyUrl is only valid')) {
        return 'Only used for external applications — clear this or switch application mode.'
      }
      if (detail.includes('has received applications')) {
        return 'This job has received applications — close it instead of deleting it.'
      }
      if (detail.includes('universityId')) {
        return "That university couldn't be found."
      }
      if (detail.includes('File type not allowed') || detail.includes('extension')) {
        return 'Only PDF, DOC and DOCX files are supported.'
      }
      if (detail.includes('exceeds the maximum allowed size')) {
        return 'That résumé is too large — the limit is 10MB.'
      }
      return detail || getErrorMessage(err)

    case 'VALIDATION_ERROR':
      if (detail.includes('Unsupported content type')) {
        return "That file type isn't supported. Use PDF, DOC or DOCX."
      }
      if (detail.includes('applicationDeadline')) {
        return 'The application deadline must be in the future.'
      }
      // The server joins the @Size/@NotBlank messages, which are already user-facing.
      return detail || getErrorMessage(err)

    case 'INTERNAL_ERROR':
      if (import.meta.env.DEV) {
        // GlobalExceptionHandler doesn't extend ResponseEntityExceptionHandler, so a bind failure
        // — an invalid ?jobType=, a missing ?q= — lands on the catch-all as a 500 rather than a 400.
        console.warn(
          '[jobs] INTERNAL_ERROR — check for an invalid enum param or a missing required query param',
          err,
        )
      }
      return 'Something went wrong on our end. Please try again.'

    default:
      break
  }

  // 401 is intentionally unhandled — the axios interceptor refreshes the token and retries.
  // Applying is rate-limited to 10 requests a minute, so 429 there is a routine outcome.
  if (status === 429) return rateLimitCopy(retryAfterSeconds)

  return getErrorMessage(err)
}

function rateLimitCopy(retryAfterSeconds: number | null): string {
  return retryAfterSeconds
    ? `You're doing that too quickly. Please wait ${retryAfterSeconds} seconds.`
    : "You're doing that too quickly. Please wait a moment."
}
