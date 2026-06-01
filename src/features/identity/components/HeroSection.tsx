import { motion } from 'framer-motion'
import { ArrowRight, Zap, Star, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../../../components/ui/Logo'
import { fadeUp, stagger } from '../../../lib/animations'

const FLOATING_BADGES = [
  { label: '🚌 Live Bus Tracking',  pos: '-left-10 top-6',    color: 'border-emerald-200 text-emerald-700 dark:text-emerald-400' },
  { label: '🎫 12 Events Today',    pos: '-right-6 top-1/3',  color: 'border-primary-200 text-primary dark:text-primary-400' },
  { label: '💼 New Jobs Posted',    pos: '-left-8 bottom-10', color: 'border-blue-200 text-blue-700 dark:text-blue-400' },
]

const MOCK_POSTS = [
  { name: 'Sarah M.',   role: 'Computer Science · Year 3', time: '2m ago',  color: 'bg-primary-600' },
  { name: 'James K.',   role: 'Engineering · Year 2',      time: '15m ago', color: 'bg-blue-500'    },
  { name: 'UniSphere',  role: 'Campus News',               time: '1h ago',  color: 'bg-primary-800' },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-white dark:bg-[#0F0A1A]">

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary/10 dark:to-transparent blur-3xl opacity-70" />
        <div className="absolute bottom-0 -left-20 w-96 h-96 rounded-full bg-primary-50 dark:bg-primary/5 blur-3xl" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#7C3AED 1px, transparent 1px), linear-gradient(to right, #7C3AED 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* ── Left: copy ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-primary bg-primary-100 dark:bg-primary/15 border border-primary-200 dark:border-primary/30 rounded-full">
                <Zap size={12} />
                Now in Beta · Join thousands of students
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-[4.25rem] font-bold text-gray-900 dark:text-primary-50 leading-[1.05] tracking-tight"
            >
              Your Campus.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-800 via-primary to-primary-400">
                Connected.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-500 dark:text-primary-400/80 leading-relaxed max-w-lg"
            >
              UniSphere brings together everything university life has to offer — social networking, events, jobs, maps, and more — in one verified, campus-only platform.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5"
              >
                Get Started Free <ArrowRight size={16} />
              </Link>
              <a
                href="#highlights"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-primary-100 border border-gray-200 dark:border-[#2D1F4D] rounded-xl hover:border-primary/40 hover:text-primary transition-all"
              >
                See How It Works
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 pt-1">
              <div className="flex -space-x-2">
                {['bg-primary-400', 'bg-blue-400', 'bg-emerald-400', 'bg-pink-400'].map((c, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white dark:border-[#0F0A1A] flex items-center justify-center text-xs text-white font-bold`}>
                    {['A', 'B', 'C', 'D'][i]}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={11} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-400 dark:text-primary-400/60">
                  Trusted by students at 50+ universities
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: product mockup ── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-md">

              {/* Main card — purple gradient */}
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-primary-200 dark:border-primary/30">

                {/* App header */}
                <div className="bg-gradient-to-r from-primary-800 to-primary px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Logo size={22} />
                    <span className="text-sm font-bold text-white">UniSphere</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-white/70">Live</span>
                  </div>
                </div>

                {/* Feed body */}
                <div className="bg-white dark:bg-[#1A1226] p-4 flex flex-col gap-3">
                  {MOCK_POSTS.map(post => (
                    <div key={post.name} className="flex items-start gap-3 p-3 rounded-xl bg-primary-50 dark:bg-primary/8 border border-primary-100 dark:border-primary/15">
                      <div className={`w-9 h-9 rounded-full ${post.color} shrink-0 flex items-center justify-center text-xs text-white font-bold`}>
                        {post.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-bold text-gray-800 dark:text-primary-100 truncate">{post.name}</span>
                          <CheckCircle size={10} className="text-primary shrink-0" />
                          <span className="text-[10px] text-gray-400 ml-auto shrink-0">{post.time}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-primary-400/60 mb-2">{post.role}</p>
                        <div className="h-1.5 bg-primary-100 dark:bg-primary/15 rounded-full w-full mb-1" />
                        <div className="h-1.5 bg-primary-100 dark:bg-primary/15 rounded-full w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating badges */}
              {FLOATING_BADGES.map((badge, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3 + i * 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
                  className={`absolute ${badge.pos} px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-[#1A1226] border ${badge.color} shadow-md`}
                >
                  {badge.label}
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-[#0F0A1A] to-transparent pointer-events-none" />
    </section>
  )
}
