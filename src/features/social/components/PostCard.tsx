import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { fadeUp } from '../../../lib/animations'
import { useAuth } from '../../../hooks/useAuth'
import { RoleBadge } from './RoleBadge'
import { MediaGrid } from './MediaGrid'
import { PostActions } from './PostActions'
import { PostMenu } from './PostMenu'
import { CreatePostModal } from './CreatePostModal'
import type { PostResponse } from '../types'

interface Props {
  post: PostResponse
  expanded?: boolean
}

export function PostCard({ post, expanded = false }: Props) {
  const { user } = useAuth()
  const [showEdit, setShowEdit] = useState(false)

  const isOwner = user?.id === post.author.id

  const initials = post.author.displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const timestamp = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })

  return (
    <>
      <motion.div
        variants={fadeUp}
        className="bg-white dark:bg-[#1A1226] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] p-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {post.author.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.displayName}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">{initials}</span>
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {post.author.displayName}
                </span>
                <RoleBadge role={post.author.role} />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">{timestamp}</p>
            </div>
          </div>

          {isOwner && (
            <PostMenu postId={post.id} onEdit={() => setShowEdit(true)} />
          )}
        </div>

        {/* Title */}
        {post.title && (
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            {post.title}
          </h3>
        )}

        {/* Content */}
        {post.content && (
          <div className="mb-3">
            {expanded ? (
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {post.content}
              </p>
            ) : (
              <Link to={`/post/${post.id}`} className="block group">
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4 group-hover:text-gray-900 dark:group-hover:text-white transition-colors whitespace-pre-wrap">
                  {post.content}
                </p>
              </Link>
            )}
          </div>
        )}

        {/* Media */}
        {post.media.length > 0 && (
          <div className="mb-3">
            <MediaGrid media={post.media} />
          </div>
        )}

        {/* Actions */}
        <PostActions
          post={post}
          onCommentClick={
            expanded ? undefined : () => window.location.assign(`/post/${post.id}`)
          }
        />
      </motion.div>

      {showEdit && (
        <CreatePostModal existingPost={post} onClose={() => setShowEdit(false)} />
      )}
    </>
  )
}
