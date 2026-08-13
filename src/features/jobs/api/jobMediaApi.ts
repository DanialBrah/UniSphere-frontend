import api from '../../../lib/axios'
import type { ApiResponse, JobMediaPresignResponse, JobMediaUploadResponse } from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data

/** Mirrors the @Pattern on JobApplicationMediaPresignRequest.contentType — pdf/doc/docx only. */
export const ACCEPTED_RESUME_MIME =
  'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

/** Mirrors the extension whitelist in JobApplicationMediaService. */
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'] as const

const EXTENSION_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

/** Mirrors `jobs.resume-max-size-bytes` (10MB default) — enforced server-side on the multipart route. */
export const MAX_RESUME_BYTES = 10 * 1024 * 1024

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.')
  return dot === -1 ? '' : filename.slice(dot + 1).toLowerCase()
}

/** Browsers occasionally report an empty or wrong `file.type` — fall back to the extension. */
export function resolveContentType(file: File): string {
  const fromExtension = EXTENSION_MIME[extensionOf(file.name)]
  if (!file.type) return fromExtension ?? ''
  return ACCEPTED_RESUME_MIME.includes(file.type) ? file.type : (fromExtension ?? file.type)
}

/** Catches the two 400s (bad extension, unsupported content type) before spending a round-trip. */
export function isAllowedResumeFile(file: File): boolean {
  const extension = extensionOf(file.name)
  return (
    (ALLOWED_EXTENSIONS as readonly string[]).includes(extension) &&
    ACCEPTED_RESUME_MIME.includes(resolveContentType(file))
  )
}

export function isWithinResumeSizeLimit(file: File): boolean {
  return file.size <= MAX_RESUME_BYTES
}

/**
 * Separate from every other feature's media API on purpose: the backend's `assertOwnedKey`
 * requires every résumé key to start with `job-applications/{yourUserId}/`, so a `posts/`/`events/`
 * key gets a 403 when attached to an application's `resumeKey`.
 *
 * The presigned PUT URL expires after ~5 minutes, which is why presign+upload happen together at
 * Easy Apply submit time, not when the file is picked — same reasoning as event cover images.
 */
export const jobMediaApi = {
  presign: (filename: string, contentType: string): Promise<JobMediaPresignResponse> =>
    api
      .post<ApiResponse<JobMediaPresignResponse>>('/jobs/applications/media/presign', {
        filename,
        contentType,
      })
      .then(unwrap),

  // Plain fetch — the presigned URL authenticates via query string; an Authorization header
  // (which axios would attach) breaks the signature. The backend doesn't bind Content-Type into
  // the signature for this route, but the header is still sent for correctness — it just isn't relied on.
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
    const { uploadUrl, mediaKey } = await jobMediaApi.presign(file.name, contentType)
    await jobMediaApi.uploadToPresignedUrl(uploadUrl, file)
    return { mediaKey }
  },

  /** Server-proxied fallback for when a direct PUT is blocked (corporate proxies, mostly). */
  uploadMultipart: (file: File): Promise<JobMediaUploadResponse> => {
    const form = new FormData()
    form.append('file', file)
    return api
      .post<ApiResponse<JobMediaUploadResponse>>('/jobs/applications/media/upload', form)
      .then(unwrap)
  },

  // The route is a rest-of-path capture ({*mediaKey}) — encoding the slashes would 404.
  remove: (mediaKey: string): Promise<void> =>
    api.delete<ApiResponse<null>>(`/jobs/applications/media/${mediaKey}`).then(() => undefined),
}
