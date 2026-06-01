import { motion } from 'framer-motion'
import { Calendar, CheckCircle } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { fadeUp, stagger, slideLeft, slideRight } from '../../../lib/animations'

function BulletList({ items, color }: { items: string[]; color: string }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map(item => (
        <li key={item} className="flex items-center gap-2 text-sm text-gray-500 dark:text-primary-400/80">
          <CheckCircle size={15} className={`${color} shrink-0`} />
          {item}
        </li>
      ))}
    </ul>
  )
}

// ── Highlight 1: Live Bus Tracking ────────────────────────────────────────────

function BusTrackingVisual() {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#1A1226] border border-primary-100 dark:border-[#2D1F4D] p-5 shadow-lg shadow-primary/5">
      <div className="relative h-52 rounded-xl bg-[#0d3b2e]/60 dark:bg-[#0a2a1e] overflow-hidden mb-4">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(to right, #4ade80 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Route line */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 200">
          <path d="M 30 160 Q 80 80 150 100 T 270 60" stroke="#4ade80" strokeWidth="2.5" fill="none" strokeDasharray="6 3" opacity="0.7" />
        </svg>
        {/* Animated bus dot */}
        <motion.div
          animate={{ x: [0, 60, 120, 160], y: [0, -25, -18, -42] }}
          transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          className="absolute left-[12%] top-[68%]"
        >
          <div className="relative">
            <div className="w-5 h-5 rounded-full bg-emerald-400 border-2 border-white shadow-lg shadow-emerald-400/50" />
            <div className="absolute inset-0 w-5 h-5 rounded-full bg-emerald-400 animate-ping opacity-40" />
          </div>
        </motion.div>
        {/* Stop markers */}
        {[[18,76],[48,47],[78,53],[91,37]].map(([x, y], i) => (
          <div key={i} className="absolute w-2.5 h-2.5 rounded-full bg-white/60 border border-emerald-400/40" style={{ left: `${x}%`, top: `${y}%` }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-primary-100">Bus Route A</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">ETA: 3 min</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Speed</p>
          <p className="text-sm font-bold text-gray-700 dark:text-primary-200">32 km/h</p>
        </div>
      </div>
    </div>
  )
}

// ── Highlight 2: Events & Ticketing ───────────────────────────────────────────

function EventTicketingVisual() {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#1A1226] border border-primary-100 dark:border-[#2D1F4D] p-5 shadow-lg shadow-primary/5">
      {/* Event card */}
      <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary/10 dark:to-primary/5 border border-primary-200 dark:border-primary/25 p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <Badge variant="purple" className="mb-2">Tech Summit</Badge>
            <h3 className="text-sm font-bold text-gray-900 dark:text-primary-100">Campus Innovation Day 2026</h3>
            <p className="text-xs text-gray-500 dark:text-primary-400/70 mt-1">June 15 · Main Hall · 9:00 AM</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-md shadow-primary/30">
            <Calendar size={18} className="text-white" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white/60 dark:bg-white/5 px-2 py-1 rounded text-gray-500 dark:text-primary-400/70 border border-primary-100 dark:border-primary/20">Free · 200 seats</span>
          <span className="text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-500/20">Open</span>
        </div>
      </div>
      {/* QR ticket */}
      <div className="flex items-center gap-4 bg-primary-50 dark:bg-primary/8 border border-primary-100 dark:border-primary/15 rounded-xl p-3">
        <div className="w-14 h-14 rounded-lg bg-white p-1.5 shrink-0 shadow-sm">
          <div className="w-full h-full grid grid-cols-3 gap-0.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={`rounded-[1px] ${[0,2,6,8,4].includes(i) ? 'bg-gray-900' : 'bg-white'}`} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-900 dark:text-primary-100">Your Ticket</p>
          <p className="text-xs text-gray-400 dark:text-primary-400/60">Scan at entrance</p>
          <p className="text-xs text-primary font-semibold mt-0.5">#TKT-20260615-0042</p>
        </div>
      </div>
    </div>
  )
}

// ── Highlight 3: Verified Network ─────────────────────────────────────────────

function VerifiedNetworkVisual() {
  const PROFILES = [
    { name: 'Aisha Tan',       role: 'Computer Science · Year 3',   color: 'bg-primary-500' },
    { name: 'Marcus Lee',      role: 'Alumni · Software Engineer',   color: 'bg-blue-500'    },
    { name: 'Dr. Priya Sharma', role: 'University · Engineering',    color: 'bg-emerald-500' },
  ]
  return (
    <div className="rounded-2xl bg-white dark:bg-[#1A1226] border border-primary-100 dark:border-[#2D1F4D] p-5 shadow-lg shadow-primary/5 flex flex-col gap-3">
      {PROFILES.map(p => (
        <div key={p.name} className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 dark:bg-primary/8 border border-primary-100 dark:border-primary/15">
          <div className={`w-10 h-10 rounded-full ${p.color} flex items-center justify-center text-sm text-white font-bold shrink-0`}>
            {p.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-gray-900 dark:text-primary-100 truncate">{p.name}</span>
              <CheckCircle size={12} className="text-primary shrink-0" />
            </div>
            <p className="text-xs text-gray-400 dark:text-primary-400/60 truncate">{p.role}</p>
          </div>
          <button
            type="button"
            className="text-xs text-primary font-semibold border border-primary/30 px-2.5 py-1 rounded-lg hover:bg-primary-100 transition-colors shrink-0"
          >
            Connect
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Highlights section ────────────────────────────────────────────────────────

export function Highlights() {
  return (
    <section id="highlights" className="py-20 bg-primary-50 dark:bg-[#1A1226]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section heading */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
            Standout features
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-primary-50 tracking-tight">
            Built for how campus actually works
          </motion.h2>
        </motion.div>

        <div className="flex flex-col gap-20">

          {/* 1 — Bus Tracking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={slideLeft} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
              <Badge variant="green" className="mb-4">Live Tracking</Badge>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-primary-50 tracking-tight mb-4">
                Never miss the campus bus again
              </h2>
              <p className="text-gray-500 dark:text-primary-400/80 leading-relaxed mb-6">
                Track every campus shuttle in real time. See arrival times, routes, and capacity — all on an interactive map. No guessing, no waiting in the rain.
              </p>
              <BulletList
                items={['Real-time GPS updates via WebSocket', 'Interactive campus map', 'Push notification on bus arrival']}
                color="text-emerald-500"
              />
            </motion.div>
            <motion.div variants={slideRight} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
              <BusTrackingVisual />
            </motion.div>
          </div>

          {/* 2 — Events & Ticketing */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={slideRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="order-last lg:order-first"
            >
              <EventTicketingVisual />
            </motion.div>
            <motion.div
              variants={slideLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="order-first lg:order-last"
            >
              <Badge variant="purple" className="mb-4">Events & Ticketing</Badge>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-primary-50 tracking-tight mb-4">
                Discover events. Get your ticket instantly.
              </h2>
              <p className="text-gray-500 dark:text-primary-400/80 leading-relaxed mb-6">
                From campus talks to concerts — find, register, and pay for events in seconds. Your digital QR ticket lives right in the app.
              </p>
              <BulletList
                items={['Browse & filter campus events', 'Tiered ticketing with live seat count', 'QR code tickets — no printing needed']}
                color="text-primary"
              />
            </motion.div>
          </div>

          {/* 3 — Verified Network */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={slideLeft} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
              <Badge variant="blue" className="mb-4">Verified Network</Badge>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-primary-50 tracking-tight mb-4">
                A campus network you can trust
              </h2>
              <p className="text-gray-500 dark:text-primary-400/80 leading-relaxed mb-6">
                Every member is verified with a matric card or student email. No bots, no outsiders — just a genuine, trusted community of students, alumni, and educators.
              </p>
              <BulletList
                items={['Matric card & student email verification', 'Role-based profiles — Student, Alumni, Employer', 'University-scoped communities']}
                color="text-blue-500"
              />
            </motion.div>
            <motion.div variants={slideRight} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
              <VerifiedNetworkVisual />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
