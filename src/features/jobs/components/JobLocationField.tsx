import { MapPin } from 'lucide-react'
import { ERROR_CLASS, LABEL_CLASS, inputClass } from '../utils/formUtils'
import { JOB_LOCATION_MAX } from '../schemas'
import type { WorkMode } from '../types'

interface JobLocationFieldProps {
  workMode: WorkMode
  location: string
  onLocationChange: (value: string) => void
  error?: string
}

/**
 * Location is required for ON_SITE/HYBRID and forbidden for REMOTE, mirroring `JobService`'s
 * cross-field rule. Unlike `EventLocationField`, there's no map/pin here — `Job.location` is a
 * plain free-text string, not coordinates, so a text input is the whole story.
 */
export function JobLocationField({ workMode, location, onLocationChange, error }: Readonly<JobLocationFieldProps>) {
  if (workMode === 'REMOTE') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-gray-200 px-3.5 py-2.5 text-xs text-gray-500 dark:border-[#2D1F4D] dark:text-gray-400">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        This role is remote — no location needed.
      </div>
    )
  }

  return (
    <div>
      <label htmlFor="job-location" className={LABEL_CLASS}>
        Location <span className="text-red-500">*</span>
      </label>
      <input
        id="job-location"
        type="text"
        value={location}
        maxLength={JOB_LOCATION_MAX}
        placeholder="Kuala Lumpur, Malaysia"
        onChange={(e) => onLocationChange(e.target.value)}
        className={inputClass(!!error)}
      />
      {error && <p className={ERROR_CLASS}>{error}</p>}
    </div>
  )
}
