import { getErrorMessage, parseApiError } from '../../../lib/utils'

/**
 * Turns a News API failure into copy a reader can act on.
 *
 * Matching is on `error.code` first and the message only as a secondary discriminator: the
 * codes are a stable contract, the messages are not. Anything unmapped falls through to
 * getErrorMessage, so this can never be worse than the default behaviour.
 */
export function newsErrorMessage(err: unknown): string {
  const { status, code, message, retryAfterSeconds } = parseApiError(err)
  const detail = message ?? ''

  switch (code) {
    case 'NEWS_AUTHORING_NOT_ALLOWED':
      return 'Publishing news is limited to university, club, employer and admin accounts.'

    case 'NEWS_ARTICLE_NOT_FOUND':
      // Deliberately vague. The server returns 404 for "missing" and "not yours" alike so that
      // a 403 can't be used to confirm an article exists — saying "no permission" would undo that.
      return "This article doesn't exist, or it isn't available to you."

    case 'NEWS_COMMENT_NOT_FOUND':
      return 'That comment has been removed.'

    case 'INVALID_NEWS_STATUS_TRANSITION':
      if (detail.includes('DRAFT') && detail.includes('ARCHIVED')) {
        return detail.indexOf('DRAFT') < detail.indexOf('ARCHIVED')
          ? "Drafts can't be archived. Publish it first, or delete it."
          : "Archived articles can't go back to draft. Restore it to published first."
      }
      return "That status change isn't allowed from here."

    case 'FORBIDDEN':
      if (detail.includes('Media key')) {
        return 'That upload has expired. Please pick the file again.'
      }
      return "You don't have permission to change this article."

    case 'MEDIA_UPLOAD_FAILED':
      return "The upload didn't go through. Please try again."

    case 'RATE_LIMIT_EXCEEDED':
      return retryAfterSeconds
        ? `You're doing that too quickly. Please wait ${retryAfterSeconds} seconds.`
        : "You're doing that too quickly. Please wait a moment."

    case 'BAD_REQUEST':
      if (detail.includes('must have a title') || detail.includes('must have content')) {
        return 'Add a title and some content before publishing.'
      }
      if (detail.includes('UNIVERSITY visibility')) {
        return "Your account isn't linked to a university, so it can't publish university-only news."
      }
      if (detail.includes('Comments are only open')) {
        return 'Comments open once the article is published.'
      }
      if (detail.includes('File type not allowed')) {
        return 'Only JPG, PNG, GIF, WebP, MP4 and MOV files are supported.'
      }
      return detail || getErrorMessage(err)

    case 'VALIDATION_ERROR':
      if (detail.includes('scheduledAt')) {
        return 'That time has already passed on the server. Pick a later time.'
      }
      if (detail.includes('Unsupported content type')) {
        return "That file type isn't supported. Use JPG, PNG, GIF, WebP, MP4 or MOV."
      }
      // The server joins the @Size/@NotBlank messages, which are already user-facing.
      return detail || getErrorMessage(err)

    case 'INTERNAL_ERROR':
      if (import.meta.env.DEV) {
        // Bind failures don't produce a 400 here: GlobalExceptionHandler doesn't extend
        // ResponseEntityExceptionHandler, so an unparseable ?category= or a missing ?q= lands
        // on the catch-all handler instead. On a News GET that's the usual cause.
        console.warn('[news] INTERNAL_ERROR — check for an invalid enum param or a missing q', err)
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
