import { LocationPickerMap } from '../../../components/map/LocationPickerMap'
import { ERROR_CLASS, HINT_CLASS, LABEL_CLASS, inputClass } from '../utils/formUtils'
import { LF_PLACE_MAX } from '../schemas'
import type { LatLngTuple } from '../../../lib/mapConfig'

interface LostFoundLocationFieldProps {
  label: string
  placeholder: string
  hint?: string
  place: string
  onPlaceChange: (value: string) => void
  position: LatLngTuple | null
  onPositionChange: (position: LatLngTuple | null) => void
  placeError?: string
  coordinateError?: string
  required?: boolean
}

/**
 * A place name and a map pin as one field, used for both coordinate pairs on the report form.
 *
 * The two are complementary rather than redundant: the text is what a human reads ("Level 2,
 * library"), the pin is what the map and the proximity matcher use. Either alone is a valid
 * answer, which matches the server rule that a FOUND item needs a pickup place *or* pickup
 * coordinates.
 */
export function LostFoundLocationField({
  label,
  placeholder,
  hint,
  place,
  onPlaceChange,
  position,
  onPositionChange,
  placeError,
  coordinateError,
  required = false,
}: Readonly<LostFoundLocationFieldProps>) {
  const fieldId = `lf-place-${label.replaceAll(/\W+/g, '-').toLowerCase()}`

  return (
    <fieldset className="space-y-2.5 rounded-2xl border border-gray-200 p-4 dark:border-[#2D1F4D]">
      <legend className="px-1.5 text-sm font-semibold text-gray-900 dark:text-white">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </legend>

      <div>
        <label htmlFor={fieldId} className={LABEL_CLASS}>
          Place name
        </label>
        <input
          id={fieldId}
          type="text"
          value={place}
          maxLength={LF_PLACE_MAX}
          onChange={(e) => onPlaceChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass(!!placeError)}
        />
        {placeError && <p className={ERROR_CLASS}>{placeError}</p>}
        {hint && !placeError && <p className={HINT_CLASS}>{hint}</p>}
      </div>

      <div>
        <span className={LABEL_CLASS}>Pin it on the map</span>
        <LocationPickerMap
          value={position}
          onChange={onPositionChange}
          hint="Optional, but a pin makes the item far easier for someone to find."
        />
        {coordinateError && <p className={ERROR_CLASS}>{coordinateError}</p>}
      </div>
    </fieldset>
  )
}
