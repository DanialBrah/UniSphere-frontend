import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { FEATURES } from '../../constants/landingData'

const FEATURE_ROUTES: Record<string, string> = {
  'Social Feed':        '/feed',
  'Community':          '/communities',
  'Messages':           '/messages',
  'Marketplace':        '/marketplace',
  'Jobs & Internships': '/jobs',
  'Events':             '/events',
  'Projects':           '/projects',
  'Study Sessions':     '/study',
  'Tutoring':           '/tutors',
  'Lost & Found':       '/lost-found',
  'Campus News':        '/news',
  'Campus Maps':        '/map',
  'Live Bus Tracking':  '/bus',
  'Clubs':              '/clubs',
  'Timetable':          '/timetable',
  'Campus Chatbot':     '/chatbot',
}

function FeatureCard({ title, description, icon: Icon }: {
  title: string
  description: string
  icon: LucideIcon
}) {
  const route = FEATURE_ROUTES[title]

  const inner = (
    <div className="bg-white dark:bg-[#130D22] rounded-xl border border-gray-200 dark:border-[#2D1F4D] p-4 flex flex-col gap-3 h-full transition-all hover:shadow-md hover:border-primary-300 dark:hover:border-primary/40 group">
      <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary/10 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary/20 transition-colors">
        <Icon size={18} className="text-primary-600 dark:text-primary-400" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm text-gray-900 dark:text-white">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{description}</p>
      </div>
      {!route && (
        <span className="self-start text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 font-medium">
          Coming soon
        </span>
      )}
    </div>
  )

  if (route) return <Link to={route} className="block h-full">{inner}</Link>
  return inner
}

export function FeaturesSection() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Explore UniSphere</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Everything campus life has to offer</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {FEATURES.map((feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
          />
        ))}
      </div>
    </div>
  )
}
