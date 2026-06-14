import { useState, useEffect } from 'react'
import { X, Search, Loader2, MessageSquare, Users, ChevronLeft } from 'lucide-react'
import { userApi } from '../../identity/api/userApi'
import { useCreateConversation } from '../hooks/useCreateConversation'
import type { UserSearchResult } from '../../identity/api/userApi'
import type { ConversationResponse } from '../types'

type Mode = 'pick' | 'direct' | 'group'

interface Props {
  onClose: () => void
  onCreated: (conv: ConversationResponse) => void
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

function UserRow({
  user,
  selected,
  onClick,
  disabled,
}: {
  user: UserSearchResult
  selected?: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex items-center gap-3 w-full px-4 py-3 transition-colors disabled:opacity-50',
        selected
          ? 'bg-violet-50 dark:bg-violet-900/20'
          : 'hover:bg-gray-50 dark:hover:bg-[#2D1F4D]',
      ].join(' ')}
    >
      <div className="w-9 h-9 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-semibold overflow-hidden shrink-0">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
        ) : (
          getInitials(user.displayName)
        )}
      </div>
      <div className="flex flex-col items-start min-w-0 flex-1">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate w-full text-left">
          {user.displayName}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-left">
          {user.email}
        </span>
      </div>
      {selected && (
        <span className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center shrink-0">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
    </button>
  )
}

function SearchInput({
  value,
  onChange,
  searching,
}: {
  value: string
  onChange: (v: string) => void
  searching: boolean
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#2D1F4D] border border-transparent focus-within:border-violet-500">
      <Search className="w-4 h-4 text-gray-400 shrink-0" />
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name or email…"
        className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
      />
      {searching && <Loader2 className="w-4 h-4 animate-spin text-gray-400 shrink-0" />}
    </div>
  )
}

export function NewConversationModal({ onClose, onCreated }: Props) {
  const [mode, setMode] = useState<Mode>('pick')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [searching, setSearching] = useState(false)

  // group state
  const [groupName, setGroupName] = useState('')
  const [selected, setSelected] = useState<UserSearchResult[]>([])

  const { mutate: createConversation, isPending } = useCreateConversation()

  useEffect(() => {
    if (query.trim().length < 2) return
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        setResults(await userApi.searchUsers(query.trim()))
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const displayedResults = query.trim().length < 2 ? [] : results

  const resetSearch = () => { setQuery(''); setResults([]) }

  const handlePickMode = (m: Mode) => {
    setMode(m)
    resetSearch()
    setSelected([])
    setGroupName('')
  }

  // ── DIRECT ──
  const handleDirectSelect = (user: UserSearchResult) => {
    createConversation(
      { type: 'DIRECT', participantIds: [user.id] },
      { onSuccess: (conv) => onCreated(conv) },
    )
  }

  // ── GROUP ──
  const toggleUser = (user: UserSearchResult) => {
    setSelected((prev) =>
      prev.some((u) => u.id === user.id)
        ? prev.filter((u) => u.id !== user.id)
        : [...prev, user],
    )
  }

  const handleCreateGroup = () => {
    if (!groupName.trim() || selected.length < 1) return
    createConversation(
      { type: 'GROUP', participantIds: selected.map((u) => u.id), name: groupName.trim() },
      { onSuccess: (conv) => onCreated(conv) },
    )
  }

  const title =
    mode === 'pick' ? 'New conversation' :
    mode === 'direct' ? 'Direct message' :
    'New group'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1A1226] rounded-2xl shadow-xl border border-gray-200 dark:border-[#2D1F4D] flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-200 dark:border-[#2D1F4D] shrink-0">
          {mode !== 'pick' && (
            <button
              onClick={() => handlePickMode('pick')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mr-1"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="flex-1 text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Mode picker ── */}
        {mode === 'pick' && (
          <div className="p-4 flex flex-col gap-3">
            <button
              onClick={() => handlePickMode('direct')}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-[#2D1F4D] hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0 group-hover:bg-violet-200 dark:group-hover:bg-violet-900/50 transition-colors">
                <MessageSquare className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Direct message</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Private chat with one person</p>
              </div>
            </button>

            <button
              onClick={() => handlePickMode('group')}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-[#2D1F4D] hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0 group-hover:bg-violet-200 dark:group-hover:bg-violet-900/50 transition-colors">
                <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Group chat</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Chat with multiple people</p>
              </div>
            </button>
          </div>
        )}

        {/* ── Direct flow ── */}
        {mode === 'direct' && (
          <>
            <div className="p-4 shrink-0">
              <SearchInput value={query} onChange={setQuery} searching={searching} />
            </div>
            <div className="flex flex-col overflow-y-auto pb-3">
              {displayedResults.length === 0 && query.trim().length >= 2 && !searching && (
                <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-6">No users found</p>
              )}
              {query.trim().length < 2 && (
                <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-6">
                  Type at least 2 characters to search
                </p>
              )}
              {displayedResults.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onClick={() => handleDirectSelect(user)}
                  disabled={isPending}
                />
              ))}
              {isPending && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Group flow ── */}
        {mode === 'group' && (
          <>
            <div className="p-4 flex flex-col gap-3 shrink-0">
              {/* Group name */}
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name (required)"
                className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-[#2D1F4D] text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none border border-transparent focus:border-violet-500"
              />

              {/* Selected chips */}
              {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selected.map((u) => (
                    <span
                      key={u.id}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-xs font-medium text-violet-700 dark:text-violet-300"
                    >
                      {u.displayName}
                      <button
                        onClick={() => toggleUser(u)}
                        className="hover:text-violet-900 dark:hover:text-violet-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <SearchInput value={query} onChange={setQuery} searching={searching} />
            </div>

            <div className="flex flex-col overflow-y-auto">
              {displayedResults.length === 0 && query.trim().length >= 2 && !searching && (
                <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">No users found</p>
              )}
              {query.trim().length < 2 && (
                <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-4">
                  Search for people to add
                </p>
              )}
              {displayedResults.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  selected={selected.some((u) => u.id === user.id)}
                  onClick={() => toggleUser(user)}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-[#2D1F4D] shrink-0">
              <button
                onClick={handleCreateGroup}
                disabled={isPending || !groupName.trim() || selected.length < 1}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPending ? 'Creating…' : `Create group${selected.length > 0 ? ` · ${selected.length} member${selected.length > 1 ? 's' : ''}` : ''}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
