import type { ReactNode } from 'react'

type Variant = 'purple' | 'green' | 'blue' | 'gray'

interface BadgeProps {
  children: ReactNode
  variant?: Variant
  className?: string
}

const VARIANT: Record<Variant, string> = {
  purple: 'bg-primary-100 text-primary border-primary-200 dark:bg-primary/15 dark:text-primary-400 dark:border-primary/30',
  green:  'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  blue:   'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  gray:   'bg-gray-50 text-gray-600 border-gray-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10',
}

export function Badge({ children, variant = 'purple', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold border rounded-full ${VARIANT[variant]} ${className}`}>
      {children}
    </span>
  )
}
