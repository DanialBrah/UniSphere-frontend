import { useMutation } from '@tanstack/react-query'
import { messageApi } from '../api/messageApi'
import type { MarkReadRequest } from '../types'

export function useMarkRead() {
  return useMutation({
    mutationFn: (payload: MarkReadRequest) => messageApi.markRead(payload),
  })
}
