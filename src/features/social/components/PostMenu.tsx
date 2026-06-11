import { useState, useEffect, useRef } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useDeletePost } from '../hooks/useDeletePost'
import { useNavigate } from 'react-router-dom'

interface Props {
  postId: number
  onEdit: () => void
}

export function PostMenu({ postId, onEdit }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const deletePost = useDeletePost()
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  function handleDelete() {
    setOpen(false)
    deletePost.mutate(postId, {
      onSuccess: () => navigate('/feed'),
    })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        aria-label="Post options"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-[#1A1226] border border-gray-200 dark:border-[#2D1F4D] rounded-xl shadow-lg overflow-hidden">
          <button
            onClick={() => { setOpen(false); onEdit() }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <Pencil size={14} />
            Edit post
          </button>
          <button
            onClick={handleDelete}
            disabled={deletePost.isPending}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} />
            Delete post
          </button>
        </div>
      )}
    </div>
  )
}
