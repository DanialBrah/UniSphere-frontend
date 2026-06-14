import { useRef, useState, useCallback } from 'react'
import { Send } from 'lucide-react'
import { stompClient } from '../../../lib/stompClient'
import type { TypingPayload } from '../types'

interface Props {
  conversationId: number
  onSend: (content: string) => void
  disabled?: boolean
}

export function MessageInput({ conversationId, onSend, disabled }: Props) {
  const [value, setValue] = useState('')
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  const sendTyping = useCallback(
    (typing: boolean) => {
      if (!stompClient.connected) return
      const payload: TypingPayload = { conversationId, typing }
      stompClient.publish({ destination: '/app/typing', body: JSON.stringify(payload) })
    },
    [conversationId],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)

    if (!isTypingRef.current) {
      isTypingRef.current = true
      sendTyping(true)
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false
      sendTyping(false)
    }, 1500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return

    onSend(trimmed)
    setValue('')

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    if (isTypingRef.current) {
      isTypingRef.current = false
      sendTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-3 border-t border-gray-200 dark:border-[#2D1F4D] bg-white dark:bg-[#120D1E]"
    >
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message…"
        disabled={disabled}
        className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-[#1A1226] border border-transparent focus:border-violet-500 focus:outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
      />
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        className="shrink-0 w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
      >
        <Send className="w-4 h-4 text-white" />
      </button>
    </form>
  )
}
