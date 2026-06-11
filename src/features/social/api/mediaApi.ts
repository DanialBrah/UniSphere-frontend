import api from '../../../lib/axios'
import type { ApiResponse } from '../types'

interface PresignResponse {
  uploadUrl: string
  mediaKey: string
}

interface MediaResult {
  mediaKey: string
  mediaType: string
}

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data

export const mediaApi = {
  presign: (filename: string, contentType: string): Promise<PresignResponse> =>
    api
      .post<ApiResponse<PresignResponse>>('/media/presign', { filename, contentType })
      .then(unwrap),

  // Plain fetch — S3 presigned URLs authenticate via query string; extra headers break the signature
  uploadToPresignedUrl: (uploadUrl: string, file: File): Promise<void> =>
    fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    }).then((res) => {
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
    }),

  upload: async (file: File): Promise<MediaResult> => {
    const { uploadUrl, mediaKey } = await mediaApi.presign(file.name, file.type)
    await mediaApi.uploadToPresignedUrl(uploadUrl, file)
    return { mediaKey, mediaType: file.type }
  },

  presignAvatar: (filename: string, contentType: string): Promise<PresignResponse> =>
    api
      .post<ApiResponse<PresignResponse>>('/media/presign-avatar', { filename, contentType })
      .then(unwrap),

  uploadAvatar: async (file: File): Promise<string> => {
    const { uploadUrl, mediaKey } = await mediaApi.presignAvatar(file.name, file.type)
    await mediaApi.uploadToPresignedUrl(uploadUrl, file)
    return mediaKey
  },
}
