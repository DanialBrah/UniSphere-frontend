import { useState, useEffect } from 'react'
import { X, Search, Loader2, UserPlus } from 'lucide-react'
import { userApi } from '../../identity/api/userApi'
import { useAddMember } from '../hooks/useAddMember'
import type { UserSearchResult } from '../../identity/api/userApi'
import type { ConversationResponse } from '../types'

interface Props {
  conversation: ConversationResponse
  onClose: () => void
}

export function AddMemberModal({ conversation, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set())

  const { mutate: addMember, isPending } = useAddMember(conversation.id)

  const existingIds = new Set(conversation.members.map((m) => m.userId))

  useEffect(() => {
    if (query.trim().length < 2) return
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const data = await userApi.searchUsers(query.trim())
        // Filter out people already in the group
        setResults(data.filter((u) => !existingIds.has(u.id)))
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const displayedResults = query.trim().length < 2 ? [] : results

  const handleAdd = (user: UserSearchResult) => {
    addMember(user.id, {
      onSuccess: () => setAddedIds((prev) => new Set(prev).add(user.id)),
    })
  }

  const groupName = conversation.name ?? 'Group'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#1A1226] rounded-2xl shadow-xl border border-gray-200 dark:border-[#2D1F4D] flex flex-col max-h-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-[#2D1F4D] shrink-0">
          <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
            <UserPlus className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Add member</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{groupName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#2D1F4D] border border-transparent focus-within:border-violet-500">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email…"
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
            />
            {searching && <Loader2 className="w-4 h-4 animate-spin text-gray-400 shrink-0" />}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto pb-3">
          {displayedResults.length === 0 && query.trim().length >= 2 && !searching && (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-6">No users found</p>
          )}
          {query.trim().length < 2 && (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-6">
              Type at least 2 characters to search
            </p>
          )}

          {displayedResults.map((user) => {
            const alreadyAdded = addedIds.has(user.id)
            const initials = user.displayName
              .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

            return (
              <div key={user.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-semibold overflow-hidden shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                  ) : initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => handleAdd(user)}
                  disabled={isPending || alreadyAdded}
                  className={[
                    'shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                    alreadyAdded
                      ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 cursor-default'
                      : 'bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50',
                  ].join(' ')}
                >
                  {alreadyAdded ? 'Added ✓' : isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
