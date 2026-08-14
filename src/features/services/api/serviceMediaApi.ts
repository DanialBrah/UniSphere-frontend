import api from '../../../lib/axios'
import type { ApiResponse, ServiceMediaPresignResponse, ServiceMediaUploadResponse } from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data

/** Mirrors the @Pattern on ServiceMediaPresignRequest.contentType — a showcase image, not a document. */
export const ACCEPTED_SERVICE_IMAGE_MIME = 'image/jpeg,image/png,image/webp'

/** Mirrors the extension whitelist in ServiceMediaService.newKey. */
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const

const EXTENSION_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

/** Mirrors `services.portfolio-image-max-size-bytes` (5MB default). */
export const MAX_SERVICE_IMAGE_BYTES = 5 * 1024 * 1024

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.')
  return dot === -1 ? '' : filename.slice(dot + 1).toLowerCase()
}

/** Browsers occasionally report an empty or wrong `file.type` — fall back to the extension. */
export function resolveContentType(file: File): string {
  const fromExtension = EXTENSION_MIME[extensionOf(file.name)]
  if (!file.type) return fromExtension ?? ''
  return ACCEPTED_SERVICE_IMAGE_MIME.includes(file.type) ? file.type : (fromExtension ?? file.type)
}

/** Catches the two 400s (bad extension, unsupported content type) before spending a round-trip. */
export function isAllowedServiceImageFile(file: File): boolean {
  const extension = extensionOf(file.name)
  return (
    (ALLOWED_EXTENSIONS as readonly string[]).includes(extension) &&
    ACCEPTED_SERVICE_IMAGE_MIME.includes(resolveContentType(file))
  )
}

export function isWithinServiceImageSizeLimit(file: File): boolean {
  return file.size <= MAX_SERVICE_IMAGE_BYTES
}

/**
 * Separate from every other feature's media API on purpose: the backend's `assertOwnedKey`
 * requires every portfolio image key to start with `services/{yourUserId}/`, so a `posts/` or
 * `job-applications/` key 403s on attach.
 *
 * The presigned PUT URL is short-lived, which is why presign+upload happen together at form submit
 * time, not when the file is picked — same reasoning as every other feature's media flow.
 */
export const serviceMediaApi = {
  presign: (filename: string, contentType: string): Promise<ServiceMediaPresignResponse> =>
    api
      .post<ApiResponse<ServiceMediaPresignResponse>>('/services/media/presign', { filename, contentType })
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
    const { uploadUrl, mediaKey } = await serviceMediaApi.presign(file.name, contentType)
    await serviceMediaApi.uploadToPresignedUrl(uploadUrl, file)
    return { mediaKey }
  },

  /** Server-proxied fallback for when a direct PUT is blocked (corporate proxies, mostly). */
  uploadMultipart: (file: File): Promise<ServiceMediaUploadResponse> => {
    const form = new FormData()
    form.append('file', file)
    return api.post<ApiResponse<ServiceMediaUploadResponse>>('/services/media/upload', form).then(unwrap)
  },

  // The route is a rest-of-path capture ({*mediaKey}) — encoding the slashes would 404.
  remove: (mediaKey: string): Promise<void> =>
    api.delete<ApiResponse<null>>(`/services/media/${mediaKey}`).then(() => undefined),
}
