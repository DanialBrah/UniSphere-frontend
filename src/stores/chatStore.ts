import { create } from 'zustand'

interface ChatStore {
  activeConversationId: number | null
  unreadCounts: Record<number, number>
  typingUsers: Record<number, Record<number, string>>  // convId → { userId → displayName }
  isStompConnected: boolean
  setActive: (id: number | null) => void
  incrementUnread: (conversationId: number) => void
  clearUnread: (conversationId: number) => void
  setTyping: (conversationId: number, userId: number, displayName: string, typing: boolean) => void
  setStompConnected: (connected: boolean) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  activeConversationId: null,
  unreadCounts: {},
  typingUsers: {},
  isStompConnected: false,

  setActive: (id) => set({ activeConversationId: id }),
  setStompConnected: (connected) => set({ isStompConnected: connected }),

  incrementUnread: (conversationId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: (state.unreadCounts[conversationId] ?? 0) + 1,
      },
    })),

  clearUnread: (conversationId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [conversationId]: 0 },
    })),

  setTyping: (conversationId, userId, displayName, typing) =>
    set((state) => {
      const prev = state.typingUsers[conversationId] ?? {}
      if (typing) {
        return { typingUsers: { ...state.typingUsers, [conversationId]: { ...prev, [userId]: displayName } } }
      }
      const updated = { ...prev }
      delete updated[userId]
      return { typingUsers: { ...state.typingUsers, [conversationId]: updated } }
    }),
}))
