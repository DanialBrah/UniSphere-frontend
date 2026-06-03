import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { Logo } from '../../../../components/ui/Logo'
import { useThemeStore } from '../../../../stores/themeStore'

interface Props {
  children: ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: Props) {
  const { isDark, toggle } = useThemeStore()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0A1A] relative px-4 py-8">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-200/30 dark:bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary-100/40 dark:bg-primary/5 blur-3xl" />
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-md relative">
        <div className="bg-white dark:bg-[#130D22] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] shadow-xl p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Logo size={36} />
              <span className="text-xl font-bold text-gray-900 dark:text-white">UniSphere</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
