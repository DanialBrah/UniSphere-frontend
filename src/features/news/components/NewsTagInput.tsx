import { useState } from 'react'
import { X } from 'lucide-react'
import { usePopularTags } from '../hooks/useNewsQueries'
import { inputClass } from '../../social/utils/formUtils'
import { NEWS_TAG_MAX, NEWS_TAGS_MAX } from '../schemas'

interface Props {
  tags: string[]
  onChange: (tags: string[]) => void
}

/**
 * Tags use replace semantics on the API — a non-null array replaces the whole set and [] clears
 * it — so this always holds the complete list and the editor always submits all of it. There is
 * no add/remove delta to send.
 */
export function NewsTagInput({ tags, onChange }: Props) {
  const [draft, setDraft] = useState('')
  const suggestions = usePopularTags(50)

  const atLimit = tags.length >= NEWS_TAGS_MAX

  function commit(raw: string) {
    const tag = raw.trim().slice(0, NEWS_TAG_MAX)
    if (!tag || atLimit) return
    // The server de-duplicates trimmed values, so match that here rather than sending dupes.
    if (tags.includes(tag)) {
      setDraft('')
      return
    }
    onChange([...tags, tag])
    setDraft('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit(draft)
      return
    }
    // Backspace on an empty box removes the last chip — the usual chip-input affordance.
    if (e.key === 'Backspace' && draft === '' && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  const unusedSuggestions = (suggestions.data ?? [])
    .filter(({ tag }) => !tags.includes(tag))
    .slice(0, 8)

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        Tags
      </label>

      {tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary-100 text-primary-700 dark:bg-primary/20 dark:text-primary-400"
            >
              #{tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                aria-label={`Remove tag ${tag}`}
                className="hover:text-red-500 transition-colors"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => commit(draft)}
        disabled={atLimit}
        maxLength={NEWS_TAG_MAX}
        placeholder={atLimit ? `Maximum ${NEWS_TAGS_MAX} tags` : 'Add a tag, press Enter'}
        className={`${inputClass()} text-sm`}
      />

      <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
        {tags.length}/{NEWS_TAGS_MAX} tags
      </p>

      {unusedSuggestions.length > 0 && !atLimit && (
        <div className="mt-2">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1.5">Popular</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {unusedSuggestions.map(({ tag }) => (
              <button
                key={tag}
                type="button"
                onClick={() => commit(tag)}
                className="text-[11px] px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
