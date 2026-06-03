import { motion } from 'framer-motion'
import { GraduationCap, Award, Briefcase, Users } from 'lucide-react'
import type { RegisterRole } from '../../hooks/useRegister'
import { fadeUp, stagger } from '../../../../lib/animations'

const ROLES: {
  role: RegisterRole
  icon: typeof GraduationCap
  label: string
  description: string
  gradient: string
}[] = [
  { role: 'STUDENT',  icon: GraduationCap, label: 'Student',  description: 'Campus student with matric number', gradient: 'from-primary-500 to-primary-700' },
  { role: 'ALUMNI',   icon: Award,         label: 'Alumni',   description: 'Graduate staying connected',        gradient: 'from-blue-500 to-indigo-600'     },
  { role: 'EMPLOYER', icon: Briefcase,     label: 'Employer', description: 'Post jobs, find campus talent',     gradient: 'from-emerald-500 to-teal-600'    },
  { role: 'CLUB',     icon: Users,         label: 'Club',     description: 'Student club or organization',      gradient: 'from-pink-500 to-rose-600'       },
]

interface Props {
  onSelect: (role: RegisterRole) => void
}

export function RolePickerGrid({ onSelect }: Props) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 gap-3"
    >
      {ROLES.map(({ role, icon: Icon, label, description, gradient }) => (
        <motion.button
          key={role}
          variants={fadeUp}
          type="button"
          onClick={() => onSelect(role)}
          className="flex flex-col items-center text-center p-4 rounded-xl border-2 border-gray-100 dark:border-[#2D1F4D] hover:border-primary-300 dark:hover:border-primary/40 hover:shadow-md transition-all group"
        >
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform`}>
            <Icon size={20} className="text-white" />
          </div>
          <p className="font-semibold text-sm text-gray-900 dark:text-white">{label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{description}</p>
        </motion.button>
      ))}
    </motion.div>
  )
}
