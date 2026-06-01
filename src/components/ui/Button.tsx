import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'ghost'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps {
  children:  ReactNode
  variant?:  Variant
  size?:     Size
  to?:       string
  href?:     string
  type?:     'button' | 'submit' | 'reset'
  onClick?:  () => void
  disabled?: boolean
  className?: string
  target?:   string
}

const VARIANT: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-700 shadow-sm shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-px',
  outline: 'border border-primary/40 text-primary hover:bg-primary-100 dark:hover:bg-primary/10',
  ghost:   'text-gray-700 dark:text-primary-50 border border-gray-200 dark:border-[#2D1F4D] hover:border-primary/40 hover:text-primary',
}

const SIZE: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-8 py-3.5 text-base rounded-xl gap-2',
}

export function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  to,
  href,
  type     = 'button',
  onClick,
  disabled = false,
  className = '',
  target,
}: ButtonProps) {
  const base = `inline-flex items-center font-semibold transition-all ${VARIANT[variant]} ${SIZE[size]} ${className}`

  if (to)   return <Link to={to} className={base}>{children}</Link>
  if (href)  return (
    <a href={href} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} className={base}>
      {children}
    </a>
  )
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}
