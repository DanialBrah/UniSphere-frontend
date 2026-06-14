import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { stompClient } from '../../../lib/stompClient'
import type { SendMessageRequest } from '../types'

export function useSendMessage() {
  return useMutation({
    mutationFn: (payload: SendMessageRequest) => {
      stompClient.publish({
        destination: '/app/message.send',
        body: JSON.stringify(payload),
      })
      return Promise.resolve()
    },
    onError: () => {
      toast.error('Failed to send message')
    },
  })
}
