import { useState } from 'react'
import type { ReactNode } from 'react'
import { Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { inputClass } from './formUtils'

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs text-red-500">{message}</p>
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {children}
    </label>
  )
}

export function PasswordInput({
  registered,
  error,
  placeholder = '••••••••',
}: {
  registered: UseFormRegisterReturn
  error?: string
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        {...registered}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        className={inputClass(!!error) + ' pr-10'}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}

export function OptionalSection({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-dashed border-gray-200 dark:border-[#2D1F4D] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        <span>Optional details</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </div>
  )
}

export function SubmitButton({ isPending, label = 'Create account', type = 'submit' }: { isPending: boolean; label?: string; type?: 'button' | 'submit' | 'reset' }) {
  return (
    <button
      type={type}
      disabled={isPending}
      className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
    >
      {isPending && (
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {isPending ? 'Creating account…' : label}
    </button>
  )
}
