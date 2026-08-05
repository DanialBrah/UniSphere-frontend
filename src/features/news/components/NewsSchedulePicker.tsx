import { CalendarClock } from 'lucide-react'
import { inputClass } from '../../social/utils/formUtils'
import { describeScheduleInServerTerms, isFutureInBrowserTime } from '../utils/dateUtils'

interface Props {
  /** A datetime-local value ("YYYY-MM-DDTHH:mm"), or "" for no schedule. */
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function NewsSchedulePicker({ value, onChange, disabled }: Props) {
  const hasValue = value.trim().length > 0
  const inPast = hasValue && !isFutureInBrowserTime(value)

  return (
    <div>
      <label
        htmlFor="news-schedule"
        className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2"
      >
        Schedule
      </label>

      <div className="flex items-center gap-2">
        <input
          id="news-schedule"
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`${inputClass(inPast)} text-sm flex-1`}
        />
        {hasValue && (
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={disabled}
            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-primary/40 hover:text-primary transition-colors shrink-0"
          >
            Clear
          </button>
        )}
      </div>

      {inPast && (
        <p className="mt-1.5 text-xs text-red-500">Pick a time in the future.</p>
      )}

      {/* The server stores a naive timestamp and evaluates @Future against its own clock, in
          its own zone — which the browser can't discover. Showing the UTC equivalent is the
          only honest way to tell an author when their article will actually go out. */}
      {hasValue && !inPast && (
        <p className="mt-1.5 flex items-start gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
          <CalendarClock size={12} className="shrink-0 mt-0.5" />
          <span>
            Publishing uses the server&rsquo;s timezone. Your pick is{' '}
            {describeScheduleInServerTerms(value)}.
          </span>
        </p>
      )}

      {!hasValue && (
        <p className="mt-1.5 text-[11px] text-gray-400 dark:text-gray-500">
          Leave empty to publish manually. A scheduled draft publishes itself.
        </p>
      )}
    </div>
  )
}
