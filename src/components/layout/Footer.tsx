import { Logo } from '../ui/Logo'

const COLUMNS = [
  {
    title: 'Product',
    links: ['Features', 'Events', 'Jobs', 'Marketplace', 'Campus Maps'],
  },
  {
    title: 'For',
    links: ['Students', 'Alumni', 'Employers', 'Universities', 'Clubs'],
  },
  {
    title: 'Company',
    links: ['About', 'Blog', 'Careers', 'Contact'],
  },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-white dark:bg-[#0F0A1A] border-t border-primary-100 dark:border-[#2D1F4D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Logo size={26} />
              <span className="text-sm font-bold tracking-tight">
                <span className="text-primary-800 dark:text-primary-200">Uni</span>
                <span className="text-primary dark:text-primary-400">sphere</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-primary-400/70 leading-relaxed max-w-[200px]">
              The all-in-one campus super-app for university communities.
            </p>
            <p className="mt-4 text-xs text-primary font-semibold tracking-widest uppercase">
              Campus Connected
            </p>
          </div>

          {/* Link columns */}
          {COLUMNS.map(col => (
            <div key={col.title}>
              <h4 className="text-xs font-bold text-gray-900 dark:text-primary-100 uppercase tracking-widest mb-4">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map(link => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-500 dark:text-primary-400/70 hover:text-primary dark:hover:text-primary-400 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-primary-100 dark:border-[#2D1F4D]">
          <p className="text-xs text-gray-400 dark:text-primary-400/50">
            © {year} UniSphere. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a href="#" className="text-xs text-gray-400 dark:text-primary-400/50 hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-gray-400 dark:text-primary-400/50 hover:text-primary transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
