export function inputClass(hasError: boolean): string {
  return [
    'w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-[#0F0A1A] border transition-colors',
    'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    hasError
      ? 'border-red-400 dark:border-red-500'
      : 'border-gray-200 dark:border-[#2D1F4D] hover:border-gray-300 dark:hover:border-primary/30',
  ].join(' ')
}
