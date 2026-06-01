import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { Logo } from '../ui/Logo'
import { useThemeStore } from '../../stores/themeStore'

const NAV_LINKS = [
  { label: 'Features',     href: '#features'   },
  { label: 'For You',      href: '#for-you'    },
  { label: 'How It Works', href: '#highlights' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)
  const { isDark, toggle }      = useThemeStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-[#0F0A1A]/95 backdrop-blur-md border-b border-primary-100 dark:border-[#2D1F4D] shadow-sm shadow-primary/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 select-none shrink-0">
            <Logo size={30} />
            <span className="text-base font-bold tracking-tight">
              <span className="text-primary-800 dark:text-primary-200">Uni</span>
              <span className="text-primary dark:text-primary-400">sphere</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm font-medium text-gray-500 dark:text-primary-400/80 hover:text-primary dark:hover:text-primary-400 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Desktop right — theme toggle + CTAs */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme toggle */}
            <motion.button
              type="button"
              onClick={toggle}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg text-gray-500 dark:text-primary-400/80 hover:text-primary dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary/10 transition-colors"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isDark ? 'sun' : 'moon'}
                  initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0,   scale: 1   }}
                  exit={{    opacity: 0, rotate:  90, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex"
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-primary dark:text-primary-400 border border-primary/30 dark:border-primary/40 rounded-lg hover:bg-primary-100 dark:hover:bg-primary/10 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-700 transition-colors shadow-sm shadow-primary/30"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile right — theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <motion.button
              type="button"
              onClick={toggle}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg text-gray-500 dark:text-primary-400/80 hover:text-primary transition-colors"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isDark ? 'sun' : 'moon'}
                  initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0,   scale: 1   }}
                  exit={{    opacity: 0, rotate:  90, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex"
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              className="p-2 text-gray-500 dark:text-primary-400/80 hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0  }}
            exit={{    opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white dark:bg-[#0F0A1A] border-b border-primary-100 dark:border-[#2D1F4D] px-4 pb-5"
          >
            <div className="flex flex-col gap-1 pt-2">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="py-2.5 text-sm font-medium text-gray-500 dark:text-primary-400/80 hover:text-primary transition-colors"
                >
                  {label}
                </a>
              ))}
              <div className="flex gap-2 pt-3 mt-1 border-t border-primary-100 dark:border-[#2D1F4D]">
                <Link
                  to="/login"
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-primary dark:text-primary-400 border border-primary/30 rounded-lg hover:bg-primary-100 dark:hover:bg-primary/10 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
