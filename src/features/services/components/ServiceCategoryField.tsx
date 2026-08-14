import { SERVICE_CATEGORY_SUGGESTIONS } from '../utils/categories'
import { SERVICE_CATEGORY_MAX } from '../schemas'
import { ERROR_CLASS, HINT_CLASS, LABEL_CLASS, inputClass } from '../utils/formUtils'

interface ServiceCategoryFieldProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

/**
 * Plain text underneath — `category` is a freeform `VARCHAR(100)` server-side with no backend
 * taxonomy — but the suggestion chips steer providers toward a consistent, filterable vocabulary
 * instead of everyone inventing their own spelling of "Tutoring".
 */
export function ServiceCategoryField({ value, onChange, error }: Readonly<ServiceCategoryFieldProps>) {
  return (
    <div>
      <label htmlFor="service-category" className={LABEL_CLASS}>
        Category <span className="text-red-500">*</span>
      </label>
      <input
        id="service-category"
        type="text"
        maxLength={SERVICE_CATEGORY_MAX}
        placeholder="e.g. Tutoring"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass(!!error)}
      />

      <div className="mt-2 flex flex-wrap gap-1.5">
        {SERVICE_CATEGORY_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onChange(suggestion)}
            className={[
              'rounded-md px-2 py-1 text-[11px] transition-colors',
              value === suggestion
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:text-primary dark:bg-white/5 dark:text-gray-400',
            ].join(' ')}
          >
            {suggestion}
          </button>
        ))}
      </div>

      {error && <p className={ERROR_CLASS}>{error}</p>}
      {!error && <p className={HINT_CLASS}>Pick a suggestion or type your own — it helps people filter Browse.</p>}
    </div>
  )
}
