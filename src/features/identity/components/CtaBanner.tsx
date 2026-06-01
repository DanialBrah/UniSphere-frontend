import { motion } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { fadeUp, stagger } from '../../../lib/animations'

export function CtaBanner() {
  return (
    <section className="relative py-24 overflow-hidden">

      {/* Purple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary to-primary-400" />

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-primary-900/40 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(to right, white 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.div variants={fadeUp} className="mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-white/15 border border-white/25 rounded-full">
              <Zap size={12} />
              Free for all verified students
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-5"
          >
            Ready to join your campus community?
          </motion.h2>

          <motion.p variants={fadeUp} className="text-lg text-white/75 mb-10 max-w-lg mx-auto">
            Sign up today with your student email or matric card and get instant access to everything UniSphere has to offer.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 mb-6">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-bold text-primary bg-white rounded-xl hover:bg-primary-50 transition-all shadow-xl shadow-black/20 hover:shadow-black/30 hover:-translate-y-0.5"
            >
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all"
            >
              Sign In
            </Link>
          </motion.div>

          <motion.p variants={fadeUp} className="text-sm text-white/50">
            Free for students · No credit card required · Verified campus access only
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
