import { useEffect, useRef, useState } from 'react'
import { Heart, Loader2, MessageCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { RoleBadge } from '../../social/components/RoleBadge'
import { NewsCommentForm } from './NewsCommentForm'
import {
  useDeleteNewsComment,
  useLikeNewsComment,
  useNewsCommentReplies,
  useUpdateNewsComment,
} from '../hooks/useNewsComments'
import { useAuth } from '../../../hooks/useAuth'
import { inputClass } from '../../social/utils/formUtils'
import { getErrorMessage } from '../../../lib/utils'
import { getInitials } from '../../../lib/userDisplay'
import { formatNewsRelative } from '../utils/dateUtils'
import { canDeleteComment, canEditComment } from '../utils/permissions'
import type { NewsCommentResponse } from '../types'

interface Props {
  comment: NewsCommentResponse
  /** Comments are read-only on drafts and archived articles. */
  canReply: boolean
  isReply?: boolean
}

export function NewsCommentItem({ comment, canReply, isReply = false }: Props) {
  const { user } = useAuth()
  const [showReplies, setShowReplies] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const likeComment = useLikeNewsComment(comment.articleId)
  const deleteComment = useDeleteNewsComment(comment.articleId)
  const updateComment = useUpdateNewsComment(comment.articleId, comment.id)

  const {
    data: replies = [],
    isLoading: repliesLoading,
    isError: repliesError,
    error: repliesErrorObj,
    refetch: refetchReplies,
  } = useNewsCommentReplies(comment.articleId, comment.id, showReplies)

  // Asymmetric on purpose: an admin may remove a comment but may not rewrite someone's words.
  const canEdit = canEditComment(user, comment)
  const canDelete = canDeleteComment(user, comment)

  useEffect(() => {
    if (!menuOpen) return
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [menuOpen])

  async function handleSaveEdit() {
    if (!editContent.trim()) return
    await updateComment.mutateAsync({ content: editContent }, { onSuccess: () => setEditing(false) })
  }

  return (
    <div className={isReply ? 'pl-6 border-l-2 border-primary/20' : ''}>
      <div className="flex gap-2.5">
        {comment.author.avatarUrl && !avatarFailed ? (
          <img
            src={comment.author.avatarUrl}
            alt={comment.author.displayName}
            onError={() => setAvatarFailed(true)}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[11px] font-bold">
              {getInitials(comment.author.displayName)}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-[#1A1226] rounded-xl px-3 py-2.5 border border-gray-100 dark:border-[#2D1F4D]">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {comment.author.displayName}
              </span>
              <RoleBadge role={comment.author.role} />
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                {formatNewsRelative(comment.createdAt)}
              </span>
            </div>

            {editing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={2}
                  className={`${inputClass()} resize-none text-sm`}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={updateComment.isPending}
                    className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false)
                      setEditContent(comment.content)
                    }}
                    className="px-3 py-1 rounded-lg border border-gray-200 dark:border-[#2D1F4D] text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 mt-1 ml-1">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => likeComment.mutate(comment.id)}
              disabled={likeComment.isPending}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-60"
              aria-label={comment.liked ? 'Unlike comment' : 'Like comment'}
            >
              <Heart
                size={13}
                className={comment.liked ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}
                fill={comment.liked ? 'currentColor' : 'none'}
              />
              {comment.likesCount > 0 && (
                <span
                  className={comment.liked ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}
                >
                  {comment.likesCount}
                </span>
              )}
            </motion.button>

            {!isReply && canReply && (
              <button
                onClick={() => setShowReplyForm((v) => !v)}
                className="px-2 py-1 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                Reply
              </button>
            )}

            {!isReply && comment.replyCount > 0 && (
              <button
                onClick={() => setShowReplies((v) => !v)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-primary hover:bg-primary-50 dark:hover:bg-primary/10 transition-colors"
              >
                <MessageCircle size={12} />
                {showReplies
                  ? 'Hide'
                  : `${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}`}
              </button>
            )}

            {(canEdit || canDelete) && (
              <div className="relative ml-auto" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  aria-label="Comment options"
                >
                  <MoreVertical size={13} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-6 z-20 w-32 bg-white dark:bg-[#1A1226] border border-gray-200 dark:border-[#2D1F4D] rounded-xl shadow-lg overflow-hidden">
                    {canEdit && (
                      <button
                        onClick={() => {
                          setMenuOpen(false)
                          setEditing(true)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <Pencil size={12} /> Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          setMenuOpen(false)
                          deleteComment.mutate(comment.id)
                        }}
                        disabled={deleteComment.isPending}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-2">
              <NewsCommentForm
                articleId={comment.articleId}
                parentCommentId={comment.id}
                compact
                onSuccess={() => {
                  setShowReplyForm(false)
                  setShowReplies(true)
                }}
              />
            </div>
          )}

          {showReplies && repliesLoading && (
            <div className="mt-2 flex justify-center">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            </div>
          )}

          {showReplies && repliesError && (
            <div className="mt-2 flex items-center gap-2 text-xs text-red-500 dark:text-red-400">
              <span>{getErrorMessage(repliesErrorObj)}</span>
              <button onClick={() => refetchReplies()} className="underline shrink-0">
                Retry
              </button>
            </div>
          )}

          {showReplies && !repliesError && replies.length > 0 && (
            <div className="mt-2 space-y-2">
              {replies.map((reply) => (
                <NewsCommentItem key={reply.id} comment={reply} canReply={canReply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
