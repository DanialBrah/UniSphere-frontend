import api from '../../../lib/axios'
import type {
  ApiResponse,
  LostFoundMediaPresignResponse,
  LostFoundMediaUploadResponse,
} from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data

/** Mirrors the @Pattern on LostFoundMediaPresignRequest.contentType. */
export const ACCEPTED_LOST_FOUND_MIME =
  'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime'

/** Mirrors the extension whitelist in LostFoundMediaService.newKey. */
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov'] as const

const EXTENSION_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
}

/** The multipart endpoint caps at 50MB; a presigned PUT has no server-side size gate at all. */
export const MAX_LOST_FOUND_FILE_BYTES = 50 * 1024 * 1024

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.')
  return dot === -1 ? '' : filename.slice(dot + 1).toLowerCase()
}

/**
 * Browsers report `file.type` as "" for some files (.mov especially), and occasionally mislabel
 * one. The server validates the extension and the content type independently, so derive the type
 * from the extension whenever the browser doesn't give us a usable one.
 */
export function resolveContentType(file: File): string {
  const fromExtension = EXTENSION_MIME[extensionOf(file.name)]
  if (!file.type) return fromExtension ?? ''
  return ACCEPTED_LOST_FOUND_MIME.includes(file.type) ? file.type : (fromExtension ?? file.type)
}

/** Catches the two 400s (bad extension, unsupported content type) before spending a round-trip. */
export function isAllowedLostFoundFile(file: File): boolean {
  const extension = extensionOf(file.name)
  return (
    (ALLOWED_EXTENSIONS as readonly string[]).includes(extension) &&
    ACCEPTED_LOST_FOUND_MIME.includes(resolveContentType(file))
  )
}

export function isWithinLostFoundSizeLimit(file: File): boolean {
  return file.size <= MAX_LOST_FOUND_FILE_BYTES
}

export function isImageContentType(contentType: string): boolean {
  return contentType.startsWith('image/')
}

/**
 * Separate from social's mediaApi and news's newsMediaApi on purpose: LostFoundMediaService
 * .assertOwnedKey requires every key to start with `lost-found/{yourUserId}/`, so a `posts/` or
 * `news/` key gets a 403 when it's attached to an item or a claim.
 *
 * Ownership is checked on **attach** as well as on delete, which is why the key has to come from
 * this module's presign and not from any other upload the app already performs.
 *
 * The presigned PUT URL expires after 5 minutes, which is why presign and upload happen together
 * at submit time rather than when a file is picked — filling in a report routinely takes longer.
 */
export const lostFoundMediaApi = {
  presign: (filename: string, contentType: string): Promise<LostFoundMediaPresignResponse> =>
    api
      .post<ApiResponse<LostFoundMediaPresignResponse>>('/lost-found/media/presign', {
        filename,
        contentType,
      })
      .then(unwrap),

  // Plain fetch — S3 presigned URLs authenticate via query string; extra headers (the axios
  // instance would attach Authorization) break the signature.
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

  upload: async (file: File): Promise<{ mediaKey: string; mediaType: string }> => {
    const contentType = resolveContentType(file)
    const { uploadUrl, mediaKey } = await lostFoundMediaApi.presign(file.name, contentType)
    await lostFoundMediaApi.uploadToPresignedUrl(uploadUrl, file)
    return { mediaKey, mediaType: contentType }
  },

  /** Server-proxied fallback for when a direct PUT is blocked (corporate proxies, mostly). */
  uploadMultipart: (file: File): Promise<LostFoundMediaUploadResponse> => {
    const form = new FormData()
    form.append('file', file)
    return api
      .post<ApiResponse<LostFoundMediaUploadResponse>>('/lost-found/media/upload', form)
      .then(unwrap)
  },

  // The route is a rest-of-path capture ({*mediaKey}) — encoding the slashes would 404.
  remove: (mediaKey: string): Promise<void> =>
    api.delete<ApiResponse<null>>(`/lost-found/media/${mediaKey}`).then(() => undefined),
}
