import { useAuth } from '../../../hooks/useAuth'
import { inputClass } from '../../social/utils/formUtils'
import { canUseUniversityVisibility } from '../utils/permissions'
import { VISIBILITY_HINT, VISIBILITY_LABEL } from '../utils/display'
import type { NewsVisibility } from '../types'

interface Props {
  value: NewsVisibility
  onChange: (value: NewsVisibility) => void
}

export function NewsVisibilitySelect({ value, onChange }: Props) {
  const { user } = useAuth()
  const universityAllowed = canUseUniversityVisibility(user)

  return (
    <div>
      <label
        htmlFor="news-visibility"
        className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2"
      >
        Visibility
      </label>

      <select
        id="news-visibility"
        value={value}
        onChange={(e) => onChange(e.target.value as NewsVisibility)}
        className={`${inputClass()} text-sm`}
      >
        <option value="PUBLIC">{VISIBILITY_LABEL.PUBLIC}</option>
        {/* Rendered disabled rather than hidden: a club account with no university link needs
            to know why the option isn't available, or it reads as a missing feature. The server
            returns a 400 for this case, so the control has to match. */}
        <option value="UNIVERSITY" disabled={!universityAllowed}>
          {universityAllowed
            ? VISIBILITY_LABEL.UNIVERSITY
            : `${VISIBILITY_LABEL.UNIVERSITY} — unavailable`}
        </option>
      </select>

      <p className="mt-1.5 text-[11px] text-gray-400 dark:text-gray-500">
        {!universityAllowed && value === 'PUBLIC'
          ? "Your account isn't linked to a university, so university-only news isn't available."
          : VISIBILITY_HINT[value]}
      </p>
    </div>
  )
}
