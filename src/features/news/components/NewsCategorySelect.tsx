import { inputClass } from '../../social/utils/formUtils'
import { CATEGORY_LABEL, CATEGORY_ORDER } from '../utils/display'
import type { NewsCategory } from '../types'

interface Props {
  value: NewsCategory
  onChange: (value: NewsCategory) => void
}

export function NewsCategorySelect({ value, onChange }: Props) {
  return (
    <div>
      <label
        htmlFor="news-category"
        className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2"
      >
        Category
      </label>
      <select
        id="news-category"
        value={value}
        onChange={(e) => onChange(e.target.value as NewsCategory)}
        className={`${inputClass()} text-sm`}
      >
        {CATEGORY_ORDER.map((category) => (
          <option key={category} value={category}>
            {CATEGORY_LABEL[category]}
          </option>
        ))}
      </select>
    </div>
  )
}
