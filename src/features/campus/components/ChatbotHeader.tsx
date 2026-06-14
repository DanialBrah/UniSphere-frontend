import { Bot, Loader2, Trash2 } from 'lucide-react'

interface Props {
  hasMessages: boolean
  isClearing: boolean
  onClear: () => void
}

export function ChatbotHeader({ hasMessages, isClearing, onClear }: Props) {
  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-[#2D1F4D] flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Campus Assistant</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Powered by Gemini AI</p>
        </div>
      </div>

      <button
        onClick={onClear}
        disabled={isClearing || !hasMessages}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="Clear conversation"
      >
        {isClearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        Clear
      </button>
    </div>
  )
}
