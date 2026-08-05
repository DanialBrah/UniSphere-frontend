import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Table,
} from 'lucide-react'
import { applyMarkdown, type MarkdownAction } from '../utils/markdownActions'

const ACTIONS: { id: MarkdownAction; icon: typeof Bold; label: string }[] = [
  { id: 'bold', icon: Bold, label: 'Bold' },
  { id: 'italic', icon: Italic, label: 'Italic' },
  { id: 'strikethrough', icon: Strikethrough, label: 'Strikethrough' },
  { id: 'h2', icon: Heading2, label: 'Heading' },
  { id: 'h3', icon: Heading3, label: 'Subheading' },
  { id: 'bulletList', icon: List, label: 'Bulleted list' },
  { id: 'numberedList', icon: ListOrdered, label: 'Numbered list' },
  { id: 'quote', icon: Quote, label: 'Quote' },
  { id: 'code', icon: Code, label: 'Code' },
  { id: 'link', icon: Link2, label: 'Link' },
  { id: 'table', icon: Table, label: 'Table' },
]

interface Props {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (next: string) => void
  disabled?: boolean
}

export function MarkdownToolbar({ textareaRef, value, onChange, disabled }: Props) {
  function run(action: MarkdownAction) {
    const textarea = textareaRef.current
    if (!textarea) return

    const result = applyMarkdown(value, textarea.selectionStart, textarea.selectionEnd, action)
    onChange(result.text)

    // React re-renders before the DOM value updates, so the selection has to be restored on
    // the next frame — otherwise the caret jumps to the end after every button press.
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd)
    })
  }

  return (
    <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 border-b border-gray-200 dark:border-[#2D1F4D]">
      {ACTIONS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => run(id)}
          disabled={disabled}
          title={label}
          aria-label={label}
          className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-primary transition-colors disabled:opacity-40"
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  )
}
