import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Pin, MoreVertical } from 'lucide-react'
import { CreateAnnouncementModal } from './CreateAnnouncementModal'
import { ConfirmModal } from './ConfirmModal'
import { useDeleteAnnouncement } from '../hooks/useDeleteAnnouncement'
import type { CommunityAnnouncementResponse } from '../types'

interface Props {
  communityId: number
  announcement: CommunityAnnouncementResponse
  /** Any ADMIN/MODERATOR may edit or remove any announcement, not just its own author. */
  canManage: boolean
}

export function CommunityAnnouncementCard({ communityId, announcement, canManage }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { mutate: deleteAnnouncement, isPending: isDeleting } = useDeleteAnnouncement(communityId)

  const timestamp = formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })

  return (
    <div
      className={`rounded-2xl border p-4 ${
        announcement.pinned
          ? 'bg-primary/5 border-primary/30'
          : 'bg-white dark:bg-[#1A1226] border-gray-200 dark:border-[#2D1F4D]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {announcement.pinned && <Pin size={13} className="text-primary shrink-0" />}
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {announcement.title}
          </h3>
        </div>

        {canManage && (
          <div className="relative shrink-0">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5"
            >
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-7 z-20 w-32 rounded-xl bg-white dark:bg-[#1A1226] border border-gray-200 dark:border-[#2D1F4D] shadow-lg overflow-hidden">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      setShowEdit(true)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      setShowDeleteConfirm(true)
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1.5 whitespace-pre-wrap">
        {announcement.content}
      </p>

      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
        {announcement.authorName} · {timestamp}
      </p>

      {showEdit && (
        <CreateAnnouncementModal
          communityId={communityId}
          existingAnnouncement={announcement}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete this announcement?"
          body="This can't be undone."
          confirmLabel="Delete"
          destructive
          isPending={isDeleting}
          onConfirm={() =>
            deleteAnnouncement(announcement.id, { onSuccess: () => setShowDeleteConfirm(false) })
          }
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}
