import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { chatbotApi } from '../api/chatbotApi'
import type { ChatMessage } from '../types'

const HISTORY_KEY = ['chatbot-history'] as const

export function useChatbot() {
  const queryClient = useQueryClient()
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([])

  // Fetch history from backend — returns ChatTurn[] (role + text, no timestamp)
  const { data: historyTurns, isLoading: historyLoading } = useQuery({
    queryKey: HISTORY_KEY,
    queryFn: chatbotApi.getHistory,
  })

  // Populate local messages when history loads
  useEffect(() => {
    if (historyTurns) {
      setLocalMessages(
        historyTurns.map((turn) => ({
          role: turn.role,
          text: turn.text,
          timestamp: turn.timestamp,
        })),
      )
    }
  }, [historyTurns])

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: (message: string) => chatbotApi.chat({ message }),

    onMutate: (message) => {
      // Optimistically add the user's message immediately
      const userMsg: ChatMessage = {
        role: 'user',
        text: message,
        timestamp: new Date().toISOString(),
      }
      setLocalMessages((prev) => [...prev, userMsg])
    },

    onSuccess: (data) => {
      // Append the bot's reply with the server timestamp
      const botMsg: ChatMessage = {
        role: 'model',
        text: data.reply,
        timestamp: data.timestamp,
      }
      setLocalMessages((prev) => [...prev, botMsg])
    },

    onError: () => {
      toast.error('Failed to get a response. Please try again.')
      // Remove the optimistically added user message on failure
      setLocalMessages((prev) => prev.slice(0, -1))
    },
  })

  const { mutate: clearSession, isPending: isClearing } = useMutation({
    mutationFn: chatbotApi.clearSession,
    onSuccess: () => {
      setLocalMessages([])
      queryClient.invalidateQueries({ queryKey: HISTORY_KEY })
    },
    onError: () => {
      toast.error('Failed to clear session')
    },
  })

  return {
    messages: localMessages,
    historyLoading,
    sendMessage,
    isPending,
    clearSession,
    isClearing,
  }
}
