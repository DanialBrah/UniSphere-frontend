import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Archive, MoreVertical, Pencil, Send, Trash2, Undo2 } from 'lucide-react'
import { ConfirmModal } from './ConfirmModal'
import { useChangeNewsStatus, useDeleteNewsArticle } from '../hooks/useNewsMutations'
import { allowedTransitions, transitionLabel } from '../utils/statusMachine'
import { canPublish } from '../schemas'
import type { NewsArticleResponse, NewsStatus } from '../types'

const TRANSITION_ICON: Record<NewsStatus, typeof Send> = {
  PUBLISHED: Send,
  DRAFT: Undo2,
  ARCHIVED: Archive,
}

interface Props {
  article: NewsArticleResponse
}

export function NewsArticleMenu({ article }: Props) {
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const changeStatus = useChangeNewsStatus(article.id)
  const deleteArticle = useDeleteNewsArticle()

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  // Derived from the same table the editor uses, so an invalid transition (and its 409) is
  // never reachable from the UI at all.
  const transitions = allowedTransitions(article.status)
  const publishBlocked = !canPublish({ title: article.title, content: article.content ?? '' })

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          aria-label="Article options"
        >
          <MoreVertical size={18} />
        </button>

        {open && (
          <div className="absolute right-0 top-9 z-20 w-48 bg-white dark:bg-[#1A1226] border border-gray-200 dark:border-[#2D1F4D] rounded-xl shadow-lg overflow-hidden">
            <button
              onClick={() => {
                setOpen(false)
                // Same marker the detail page's Edit link sets — lets a save step back onto
                // this article instead of pushing a second copy of it.
                navigate(`/news/editor/${article.id}`, { state: { fromArticle: true } })
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <Pencil size={14} />
              Edit article
            </button>

            {transitions.map((to) => {
              const Icon = TRANSITION_ICON[to]
              const blocked = to === 'PUBLISHED' && publishBlocked
              return (
                <button
                  key={to}
                  onClick={() => {
                    setOpen(false)
                    changeStatus.mutate({ status: to })
                  }}
                  disabled={blocked || changeStatus.isPending}
                  title={blocked ? 'Add a title and content before publishing' : undefined}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Icon size={14} />
                  {transitionLabel(article.status, to)}
                </button>
              )
            })}

            <button
              onClick={() => {
                setOpen(false)
                setConfirmDelete(true)
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border-t border-gray-100 dark:border-[#2D1F4D]"
            >
              <Trash2 size={14} />
              Delete article
            </button>
          </div>
        )}
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="Delete article"
          body="This removes the article from UniSphere. Readers who follow a link to it will see a not-found page."
          confirmLabel="Delete"
          destructive
          isPending={deleteArticle.isPending}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() =>
            deleteArticle.mutate(article.id, {
              // Replace, so Back doesn't return to the detail page of an article that is gone.
              onSuccess: () => navigate('/news', { replace: true }),
            })
          }
        />
      )}
    </>
  )
}
