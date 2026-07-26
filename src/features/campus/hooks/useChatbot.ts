import { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { chatbotApi } from '../api/chatbotApi'
import { getErrorMessage } from '../../../lib/utils'
import type { ChatMessage } from '../types'

const HISTORY_KEY = ['chatbot-history'] as const

export function useChatbot() {
  const queryClient = useQueryClient()
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([])

  // Fetch history from backend — returns ChatTurn[] (role + text, no timestamp)
  const {
    data: historyTurns,
    isLoading: historyLoading,
    isError: isHistoryError,
    error: historyError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: HISTORY_KEY,
    queryFn: chatbotApi.getHistory,
  })

  // Derive history messages during render — no effect needed
  const historyMessages = useMemo<ChatMessage[]>(
    () => historyTurns?.map((turn) => ({ role: turn.role, text: turn.text, timestamp: turn.timestamp })) ?? [],
    [historyTurns],
  )

  const { mutate: sendMessage, isPending, error: sendError } = useMutation({
    mutationFn: (message: string) => chatbotApi.chat({ message }),

    onMutate: (message) => {
      const userMsg: ChatMessage = {
        role: 'user',
        text: message,
        timestamp: new Date().toISOString(),
      }
      setSessionMessages((prev) => [...prev, userMsg])
      return { previousMessages: sessionMessages }
    },

    onSuccess: (data) => {
      const botMsg: ChatMessage = {
        role: 'model',
        text: data.reply,
        timestamp: data.timestamp,
      }
      setSessionMessages((prev) => [...prev, botMsg])
    },

    onError: (_error, _variables, context) => {
      toast.error(getErrorMessage(_error))
      if (context?.previousMessages) {
        setSessionMessages(context.previousMessages)
      }
    },
  })

  const { mutate: clearSession, isPending: isClearing } = useMutation({
    mutationFn: chatbotApi.clearSession,
    onSuccess: () => {
      setSessionMessages([])
      queryClient.setQueryData(HISTORY_KEY, [])
      queryClient.invalidateQueries({ queryKey: HISTORY_KEY })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  return {
    messages: [...historyMessages, ...sessionMessages],
    historyLoading,
    isHistoryError,
    historyError,
    refetchHistory,
    sendMessage,
    isPending,
    sendError,
    clearSession,
    isClearing,
  }
}
