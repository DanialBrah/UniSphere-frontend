export function inputClass(hasError?: boolean): string {
  return [
    'w-full px-3 py-2.5 rounded-xl text-sm border bg-white dark:bg-[#1A1226]',
    'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
    'focus:outline-none focus:ring-2 focus:ring-primary/50',
    'transition-colors',
    hasError
      ? 'border-red-400 dark:border-red-500'
      : 'border-gray-200 dark:border-[#2D1F4D] focus:border-primary dark:focus:border-primary',
  ].join(' ')
}
