/**
 * Field styling, duplicated verbatim from `social/utils/formUtils` and
 * `communities/utils/formUtils`. This repo has no shared `<Input>` primitive — `components/ui/`
 * holds only Button, Badge, Logo and PageSpinner — so a third copy follows the house pattern
 * rather than inventing a UI kit for one feature.
 */
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

export const LABEL_CLASS =
  'block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5'

export const HINT_CLASS = 'mt-1 text-xs text-gray-500 dark:text-gray-400'

export const ERROR_CLASS = 'mt-1 text-xs text-red-500'
