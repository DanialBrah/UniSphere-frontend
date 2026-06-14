import { useMemo, useState } from 'react'
import { PenSquare, Loader2, Search } from 'lucide-react'
import { ConversationItem } from './ConversationItem'
import { NewConversationModal } from './NewConversationModal'
import { useConversations } from '../hooks/useConversations'
import type { ConversationResponse } from '../types'

interface Props {
  currentUserId: number
  activeConversationId: number | null
  onSelect: (id: number) => void
}

export function ConversationList({ currentUserId, activeConversationId, onSelect }: Props) {
  const [showNewModal, setShowNewModal] = useState(false)
  const [search, setSearch] = useState('')

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useConversations()

  const allConversations: ConversationResponse[] = useMemo(
    () => data?.pages.flatMap((p) => p.content) ?? [],
    [data],
  )


  const filtered = search.trim()
    ? allConversations.filter((conv) => {
        if (conv.convType === 'GROUP') return conv.name?.toLowerCase().includes(search.toLowerCase())
        const other = conv.members.find((m) => m.userId !== currentUserId)
        return other?.displayName.toLowerCase().includes(search.toLowerCase())
      })
    : allConversations

  const handleCreated = (conv: ConversationResponse) => {
    setShowNewModal(false)
    onSelect(conv.id)
  }

  return (
    <div className="flex flex-col h-full border-r border-gray-200 dark:border-[#2D1F4D]">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-[#2D1F4D] flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">Messages</h1>
        <button
          onClick={() => setShowNewModal(true)}
          className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2D1F4D] flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors"
          title="New message"
        >
          <PenSquare className="w-4 h-4" />
        </button>
      </div>

      <div className="px-3 py-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[#1E1430]">
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="flex-1 bg-transparent text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center px-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="text-xs text-violet-500 hover:underline"
            >
              Start one →
            </button>
          </div>
        )}

        {filtered.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            currentUserId={currentUserId}
            isActive={conv.id === activeConversationId}
            onClick={() => onSelect(conv.id)}
          />
        ))}

        {hasNextPage && (
          <div className="flex justify-center py-3">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-xs text-violet-500 hover:underline disabled:opacity-50"
            >
              {isFetchingNextPage ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </div>

      {showNewModal && (
        <NewConversationModal onClose={() => setShowNewModal(false)} onCreated={handleCreated} />
      )}
    </div>
  )
}
