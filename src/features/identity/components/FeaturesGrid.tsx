import { motion } from 'framer-motion'
import { fadeUp, stagger } from '../../../lib/animations'
import { FEATURES } from '../constants/landingData'

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 bg-primary-50 dark:bg-[#1A1226]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-12"
        >
          <motion.p variants={fadeUp} className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
            Everything in one place
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-primary-50 tracking-tight mb-4">
            20+ features built for campus life
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 dark:text-primary-400/80 max-w-xl mx-auto">
            From verified networking to live bus tracking — UniSphere replaces a dozen apps with one cohesive platform.
          </motion.p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          {FEATURES.map(feature => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group p-4 rounded-xl bg-white dark:bg-[#0F0A1A] border border-primary-100 dark:border-[#2D1F4D] hover:border-primary/40 hover:shadow-md hover:shadow-primary/8 transition-all cursor-default"
              >
                <div className="w-9 h-9 rounded-lg bg-primary-100 dark:bg-primary/15 flex items-center justify-center mb-3 group-hover:bg-primary-200 dark:group-hover:bg-primary/25 transition-colors">
                  <Icon size={17} className="text-primary dark:text-primary-400" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-primary-100 mb-1 leading-snug">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-primary-400/70 leading-snug">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
