import { motion } from 'framer-motion'
import { fadeUp, stagger } from '../../../lib/animations'
import { USER_TYPES } from '../constants/landingData'

export function WhoItsFor() {
  return (
    <section id="for-you" className="py-20 bg-white dark:bg-[#0F0A1A]">
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
            For everyone on campus
          </motion.p>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-primary-50 tracking-tight mb-4">
            Built for your role
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 dark:text-primary-400/80 max-w-xl mx-auto">
            Whether you're a student, an alumnus, an employer, or a university — UniSphere adapts to who you are.
          </motion.p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {USER_TYPES.map(type => {
            const Icon = type.icon
            return (
              <motion.div
                key={type.role}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="group rounded-2xl border border-primary-100 dark:border-[#2D1F4D] bg-white dark:bg-[#1A1226] overflow-hidden hover:border-primary/30 hover:shadow-xl hover:shadow-primary/8 transition-all"
              >
                {/* Coloured gradient top bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${type.gradient}`} />

                <div className="p-6">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-4 shadow-md`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-primary-50 mb-1">
                    {type.role}
                  </h3>
                  <p className="text-sm font-semibold text-primary dark:text-primary-400 mb-3">
                    {type.tagline}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-primary-400/70 leading-relaxed">
                    {type.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
