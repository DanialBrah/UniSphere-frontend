import { useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'

interface Props {
  currentAvatarUrl: string | null
  displayName: string
  onAvatarChange: (file: File | null) => void
}

export function AvatarUpload({ currentAvatarUrl, displayName, onAvatarChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl)
  const [hasChange, setHasChange] = useState(false)

  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setPreviewUrl(URL.createObjectURL(file))
    setHasChange(true)
    onAvatarChange(file)
  }

  function handleRemove() {
    setPreviewUrl(null)
    setHasChange(true)
    onAvatarChange(null)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={displayName}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-primary-100 dark:ring-primary/20"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center ring-4 ring-primary-100 dark:ring-primary/20">
            <span className="text-white text-xl font-bold">{initials}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          aria-label="Change avatar"
        >
          <Camera size={20} className="text-white" />
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex gap-3 text-xs">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-primary hover:underline"
        >
          {previewUrl ? 'Change photo' : 'Upload photo'}
        </button>
        {(previewUrl || hasChange) && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-red-500 hover:underline flex items-center gap-1"
          >
            <X size={11} /> Remove
          </button>
        )}
      </div>
    </div>
  )
}
