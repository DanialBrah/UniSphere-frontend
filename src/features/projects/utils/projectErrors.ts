import { getErrorMessage, parseApiError } from '../../../lib/utils'

/**
 * Turns a Projects API failure into copy a user can act on.
 *
 * Matching is on `error.code` first and the message only as a secondary discriminator: the codes
 * are a stable contract, the messages are not. Anything unmapped falls through to
 * getErrorMessage, so this can never be worse than the default behaviour. Message substrings below
 * are copied verbatim from ProjectService/ProjectApplicationService/ProjectMediaService.
 */
export function projectErrorMessage(err: unknown): string {
  const { status, code, message, retryAfterSeconds } = parseApiError(err)
  const detail = message ?? ''

  switch (code) {
    case 'PROJECT_NOT_FOUND':
      return "This project doesn't exist, or it isn't available to you."

    case 'PROJECT_ROLE_NOT_FOUND':
      return "That role doesn't exist, or it's no longer on this project."

    case 'PROJECT_APPLICATION_NOT_FOUND':
      return "That application doesn't exist, or it isn't available to you."

    case 'INVALID_PROJECT_STATUS_TRANSITION':
      if (detail.includes('COMPLETED to')) {
        return 'This project has already completed, so its status cannot change again.'
      }
      return "That status change isn't allowed from here. Refresh to see the current status."

    case 'INVALID_PROJECT_APPLICATION_TRANSITION':
      return 'That change is no longer possible for this application. Refresh to see its current status.'

    case 'FORBIDDEN':
      if (detail.includes('Media key')) {
        return 'That upload has expired. Please attach the cover image again.'
      }
      if (detail.includes('students, alumni and clubs can create')) {
        return 'Only students, alumni and clubs can showcase a project.'
      }
      if (detail.includes('students and alumni can apply')) {
        return 'Only students and alumni can apply to join a project.'
      }
      if (detail.includes('applicant may withdraw')) {
        return 'Only the applicant can withdraw this application.'
      }
      if (detail.includes("owner can update")) {
        return "Only the project's owner can decide on this application."
      }
      if (detail.includes("owner can modify")) {
        return "Only the project's owner can do that."
      }
      return "You don't have permission to do that."

    case 'MEDIA_UPLOAD_FAILED':
      return "The upload didn't go through. Please try again."

    case 'BAD_REQUEST':
      // These mirror the cross-field rules the form already enforces. If one still lands here the
      // client and server have drifted, so the copy stays actionable.
      if (detail.includes('already completed')) {
        return 'This project has already completed and is no longer recruiting.'
      }
      if (detail.includes('not currently recruiting')) {
        return 'This project is not currently recruiting.'
      }
      if (detail.includes('role is no longer open')) {
        return 'This role is no longer open — it may be full or closed.'
      }
      if (detail.includes('apply to your own project')) {
        return "You can't apply to your own project."
      }
      if (detail.includes('already a member')) {
        return "You're already a member of this project."
      }
      if (detail.includes('already applied to this role')) {
        return "You've already applied to this role."
      }
      if (detail.includes('slots cannot be less than')) {
        return 'Slots cannot be set below the number of people already filling this role.'
      }
      if (detail.includes('has received applications')) {
        return 'This role has received applications — close it instead of deleting it.'
      }
      if (detail.includes('has other members')) {
        return 'This project has other members — remove them or mark it completed instead of deleting it.'
      }
      if (detail.includes('owner cannot leave')) {
        return 'The owner cannot leave — mark the project completed or delete it instead.'
      }
      if (detail.includes('Cannot remove the project owner')) {
        return "The project owner can't be removed."
      }
      if (detail.includes('not a member of this project')) {
        return "That person isn't a member of this project."
      }
      if (detail.includes('File type not allowed') || detail.includes('extension')) {
        return 'Only JPG, PNG and WebP images are supported.'
      }
      if (detail.includes('exceeds the maximum allowed size')) {
        return 'That image is too large — the limit is 5MB.'
      }
      if (detail.includes('title cannot be blank')) {
        return 'Give it a title.'
      }
      return detail || getErrorMessage(err)

    case 'VALIDATION_ERROR':
      if (detail.includes('Unsupported content type')) {
        return "That file type isn't supported. Use JPG, PNG or WebP."
      }
      // The server joins the @Size/@NotBlank messages, which are already user-facing.
      return detail || getErrorMessage(err)

    case 'INTERNAL_ERROR':
      if (import.meta.env.DEV) {
        console.warn(
          '[projects] INTERNAL_ERROR — check for an invalid enum param or a missing required query param',
          err,
        )
      }
      return 'Something went wrong on our end. Please try again.'

    default:
      break
  }

  // 401 is intentionally unhandled — the axios interceptor refreshes the token and retries.
  if (status === 429) {
    return retryAfterSeconds
      ? `You're doing that too quickly. Please wait ${retryAfterSeconds} seconds.`
      : "You're doing that too quickly. Please wait a moment."
  }

  return getErrorMessage(err)
}
