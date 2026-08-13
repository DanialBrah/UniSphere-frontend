import api from '../../../lib/axios'
import type { ApiResponse, EventMediaPresignResponse, EventMediaUploadResponse } from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data

/** Mirrors the @Pattern on EventMediaPresignRequest.contentType — images only, no video. */
export const ACCEPTED_EVENT_COVER_MIME = 'image/jpeg,image/png,image/gif,image/webp'

/** Mirrors the extension whitelist in EventMediaService.newKey. */
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'] as const

const EXTENSION_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
}

/** The multipart endpoint caps at 50MB; a presigned PUT has no server-side size gate at all. */
export const MAX_EVENT_COVER_BYTES = 50 * 1024 * 1024

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.')
  return dot === -1 ? '' : filename.slice(dot + 1).toLowerCase()
}

/** Browsers occasionally report an empty or wrong `file.type` — fall back to the extension. */
export function resolveContentType(file: File): string {
  const fromExtension = EXTENSION_MIME[extensionOf(file.name)]
  if (!file.type) return fromExtension ?? ''
  return ACCEPTED_EVENT_COVER_MIME.includes(file.type) ? file.type : (fromExtension ?? file.type)
}

/** Catches the two 400s (bad extension, unsupported content type) before spending a round-trip. */
export function isAllowedEventCoverFile(file: File): boolean {
  const extension = extensionOf(file.name)
  return (
    (ALLOWED_EXTENSIONS as readonly string[]).includes(extension) &&
    ACCEPTED_EVENT_COVER_MIME.includes(resolveContentType(file))
  )
}

export function isWithinEventCoverSizeLimit(file: File): boolean {
  return file.size <= MAX_EVENT_COVER_BYTES
}

/**
 * Separate from every other feature's media API on purpose: `EventMediaService.assertOwnedKey`
 * requires every key to start with `events/{yourUserId}/`, so a `posts/`/`news/`/`lost-found/` key
 * gets a 403 when attached to an event's `coverImageKey`.
 *
 * The presigned PUT URL expires after ~5 minutes, which is why presign+upload happen together at
 * submit time rather than when a cover image is picked — filling in the event form routinely takes
 * longer than that.
 */
export const eventMediaApi = {
  presign: (filename: string, contentType: string): Promise<EventMediaPresignResponse> =>
    api
      .post<ApiResponse<EventMediaPresignResponse>>('/events/media/presign', {
        filename,
        contentType,
      })
      .then(unwrap),

  // Plain fetch — the presigned URL authenticates via query string; an Authorization header
  // (which axios would attach) breaks the signature.
  uploadToPresignedUrl: (uploadUrl: string, file: File, timeoutMs = 60000): Promise<void> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    return fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
      signal: controller.signal,
    })
      .then((res) => {
        clearTimeout(timeoutId)
        if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
      })
      .catch((err) => {
        clearTimeout(timeoutId)
        if (err.name === 'AbortError') throw new Error('Upload timeout exceeded')
        throw err
      })
  },

  upload: async (file: File): Promise<{ mediaKey: string }> => {
    const contentType = resolveContentType(file)
    const { uploadUrl, mediaKey } = await eventMediaApi.presign(file.name, contentType)
    await eventMediaApi.uploadToPresignedUrl(uploadUrl, file)
    return { mediaKey }
  },

  /** Server-proxied fallback for when a direct PUT is blocked (corporate proxies, mostly). */
  uploadMultipart: (file: File): Promise<EventMediaUploadResponse> => {
    const form = new FormData()
    form.append('file', file)
    return api
      .post<ApiResponse<EventMediaUploadResponse>>('/events/media/upload', form)
      .then(unwrap)
  },

  // The route is a rest-of-path capture ({*mediaKey}) — encoding the slashes would 404.
  remove: (mediaKey: string): Promise<void> =>
    api.delete<ApiResponse<null>>(`/events/media/${mediaKey}`).then(() => undefined),
}
