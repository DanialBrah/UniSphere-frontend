import api from '../../../lib/axios'
import type { ApiResponse, ProjectMediaPresignResponse, ProjectMediaUploadResponse } from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data

/** Mirrors the @Pattern on ProjectMediaPresignRequest.contentType — image only, no video. */
export const ACCEPTED_PROJECT_COVER_MIME = 'image/jpeg,image/png,image/webp'

/** Mirrors the extension whitelist in ProjectMediaService. */
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const

const EXTENSION_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

/** Mirrors `projects.cover-image-max-size-bytes` (5MB default) — enforced server-side on the multipart route. */
export const MAX_PROJECT_COVER_BYTES = 5 * 1024 * 1024

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.')
  return dot === -1 ? '' : filename.slice(dot + 1).toLowerCase()
}

/** Browsers occasionally report an empty or wrong `file.type` — fall back to the extension. */
export function resolveContentType(file: File): string {
  const fromExtension = EXTENSION_MIME[extensionOf(file.name)]
  if (!file.type) return fromExtension ?? ''
  return ACCEPTED_PROJECT_COVER_MIME.includes(file.type) ? file.type : (fromExtension ?? file.type)
}

/** Catches the two 400s (bad extension, unsupported content type) before spending a round-trip. */
export function isAllowedProjectCoverFile(file: File): boolean {
  const extension = extensionOf(file.name)
  return (
    (ALLOWED_EXTENSIONS as readonly string[]).includes(extension) &&
    ACCEPTED_PROJECT_COVER_MIME.includes(resolveContentType(file))
  )
}

export function isWithinProjectCoverSizeLimit(file: File): boolean {
  return file.size <= MAX_PROJECT_COVER_BYTES
}

/**
 * Separate from every other feature's media API on purpose: `ProjectMediaService.assertOwnedKey`
 * requires every key to start with `projects/{yourUserId}/`, so a `posts/`/`events/` key gets a 403
 * when attached to a project's `coverImageKey`.
 *
 * The presigned PUT URL expires after ~5 minutes, which is why presign+upload happen together at
 * submit time rather than when a cover image is picked.
 */
export const projectMediaApi = {
  presign: (filename: string, contentType: string): Promise<ProjectMediaPresignResponse> =>
    api
      .post<ApiResponse<ProjectMediaPresignResponse>>('/projects/media/presign', { filename, contentType })
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
    const { uploadUrl, mediaKey } = await projectMediaApi.presign(file.name, contentType)
    await projectMediaApi.uploadToPresignedUrl(uploadUrl, file)
    return { mediaKey }
  },

  /** Server-proxied fallback for when a direct PUT is blocked (corporate proxies, mostly). */
  uploadMultipart: (file: File): Promise<ProjectMediaUploadResponse> => {
    const form = new FormData()
    form.append('file', file)
    return api.post<ApiResponse<ProjectMediaUploadResponse>>('/projects/media/upload', form).then(unwrap)
  },

  // The route is a rest-of-path capture ({*mediaKey}) — encoding the slashes would 404.
  remove: (mediaKey: string): Promise<void> =>
    api.delete<ApiResponse<null>>(`/projects/media/${mediaKey}`).then(() => undefined),
}
