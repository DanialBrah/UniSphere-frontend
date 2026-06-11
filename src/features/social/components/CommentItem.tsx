import { useState, useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MoreVertical, MessageCircle, Pencil, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { RoleBadge } from './RoleBadge'
import { CommentForm } from './CommentForm'
import { useCommentReplies } from '../hooks/useCommentReplies'
import { useLikeComment } from '../hooks/useLikeComment'
import { useDeleteComment } from '../hooks/useDeleteComment'
import { useUpdateComment } from '../hooks/useUpdateComment'
import { useAuth } from '../../../hooks/useAuth'
import { inputClass } from '../utils/formUtils'
import type { CommentResponse } from '../types'

interface Props {
  comment: CommentResponse
  isReply?: boolean
}

export function CommentItem({ comment, isReply = false }: Props) {
  const { user } = useAuth()
  const [showReplies, setShowReplies] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const menuRef = useRef<HTMLDivElement>(null)

  const likeComment = useLikeComment(comment.postId)
  const deleteComment = useDeleteComment(comment.postId)
  const updateComment = useUpdateComment(comment.postId, comment.id)

  const { data: replies = [] } = useCommentReplies(comment.postId, comment.id, showReplies)

  const isOwner = user?.id === comment.author.id
  const timestamp = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })

  const initials = comment.author.displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

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
    await updateComment.mutateAsync(
      { content: editContent },
      { onSuccess: () => setEditing(false) },
    )
  }

  return (
    <div className={isReply ? 'pl-6 border-l-2 border-primary/20' : ''}>
      <div className="flex gap-2.5">
        {/* Avatar */}
        {comment.author.avatarUrl ? (
          <img
            src={comment.author.avatarUrl}
            alt={comment.author.displayName}
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[11px] font-bold">{initials}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Bubble */}
          <div className="bg-gray-50 dark:bg-[#1A1226] rounded-xl px-3 py-2.5 border border-gray-100 dark:border-[#2D1F4D]">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {comment.author.displayName}
              </span>
              <RoleBadge role={comment.author.role} />
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                {timestamp}
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
                    onClick={() => { setEditing(false); setEditContent(comment.content) }}
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

          {/* Action row */}
          <div className="flex items-center gap-1 mt-1 ml-1">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => likeComment.mutate(comment.id)}
              disabled={likeComment.isPending}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-60"
            >
              <Heart
                size={13}
                className={comment.liked ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}
                fill={comment.liked ? 'currentColor' : 'none'}
              />
              {comment.likesCount > 0 && (
                <span className={comment.liked ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}>
                  {comment.likesCount}
                </span>
              )}
            </motion.button>

            {!isReply && (
              <button
                onClick={() => setShowReplyForm((v) => !v)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
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
                {showReplies ? 'Hide' : `${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}`}
              </button>
            )}

            {isOwner && (
              <div className="relative ml-auto" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  <MoreVertical size={13} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-6 z-20 w-32 bg-white dark:bg-[#1A1226] border border-gray-200 dark:border-[#2D1F4D] rounded-xl shadow-lg overflow-hidden">
                    <button
                      onClick={() => { setMenuOpen(false); setEditing(true) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); deleteComment.mutate(comment.id) }}
                      disabled={deleteComment.isPending}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-2">
              <CommentForm
                postId={comment.postId}
                parentCommentId={comment.id}
                compact
                onSuccess={() => {
                  setShowReplyForm(false)
                  setShowReplies(true)
                }}
              />
            </div>
          )}

          {/* Replies */}
          {showReplies && replies.length > 0 && (
            <div className="mt-2 space-y-2">
              {replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
