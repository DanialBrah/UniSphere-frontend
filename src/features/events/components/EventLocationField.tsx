import { Globe, MapPin } from 'lucide-react'
import { LocationPickerMap } from '../../../components/map/LocationPickerMap'
import { ERROR_CLASS, HINT_CLASS, LABEL_CLASS, inputClass } from '../utils/formUtils'
import { EVENT_VENUE_MAX } from '../schemas'
import type { LatLngTuple } from '../../../lib/mapConfig'

interface EventLocationFieldProps {
  online: boolean
  onOnlineChange: (online: boolean) => void
  onlineUrl: string
  onOnlineUrlChange: (value: string) => void
  venueName: string
  onVenueNameChange: (value: string) => void
  position: LatLngTuple | null
  onPositionChange: (position: LatLngTuple | null) => void
  onlineUrlError?: string
  venueNameError?: string
  coordinateError?: string
}

/**
 * The Online / In-person toggle plus whichever field set applies — mutually exclusive, mirroring
 * `EventService`'s cross-field rule that `online` forbids venue/coordinates and vice versa.
 *
 * A physical event needs a real pin (not just a place name) so it can actually appear on the map —
 * unlike Lost & Found, where the pin is optional and the place name alone is a valid answer.
 */
export function EventLocationField({
  online,
  onOnlineChange,
  onlineUrl,
  onOnlineUrlChange,
  venueName,
  onVenueNameChange,
  position,
  onPositionChange,
  onlineUrlError,
  venueNameError,
  coordinateError,
}: Readonly<EventLocationFieldProps>) {
  return (
    <fieldset className="space-y-3 rounded-2xl border border-gray-200 p-4 dark:border-[#2D1F4D]">
      <legend className="px-1.5 text-sm font-semibold text-gray-900 dark:text-white">
        Where is this happening? <span className="text-red-500">*</span>
      </legend>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onOnlineChange(false)}
          className={[
            'flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors',
            !online
              ? 'border-primary bg-primary text-white'
              : 'border-gray-200 bg-white text-gray-600 hover:border-primary/40 dark:border-[#2D1F4D] dark:bg-[#1A1226] dark:text-gray-400',
          ].join(' ')}
        >
          <MapPin className="h-4 w-4" />
          In person
        </button>
        <button
          type="button"
          onClick={() => onOnlineChange(true)}
          className={[
            'flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors',
            online
              ? 'border-primary bg-primary text-white'
              : 'border-gray-200 bg-white text-gray-600 hover:border-primary/40 dark:border-[#2D1F4D] dark:bg-[#1A1226] dark:text-gray-400',
          ].join(' ')}
        >
          <Globe className="h-4 w-4" />
          Online
        </button>
      </div>

      {online ? (
        <div>
          <label htmlFor="event-online-url" className={LABEL_CLASS}>
            Join link <span className="text-red-500">*</span>
          </label>
          <input
            id="event-online-url"
            type="text"
            value={onlineUrl}
            placeholder="https://meet.example.com/…"
            onChange={(e) => onOnlineUrlChange(e.target.value)}
            className={inputClass(!!onlineUrlError)}
          />
          {onlineUrlError && <p className={ERROR_CLASS}>{onlineUrlError}</p>}
          {!onlineUrlError && (
            <p className={HINT_CLASS}>Shown to attendees once they register.</p>
          )}
        </div>
      ) : (
        <>
          <div>
            <label htmlFor="event-venue" className={LABEL_CLASS}>
              Venue name <span className="text-red-500">*</span>
            </label>
            <input
              id="event-venue"
              type="text"
              value={venueName}
              maxLength={EVENT_VENUE_MAX}
              placeholder="Main auditorium, Block A"
              onChange={(e) => onVenueNameChange(e.target.value)}
              className={inputClass(!!venueNameError)}
            />
            {venueNameError && <p className={ERROR_CLASS}>{venueNameError}</p>}
          </div>

          <div>
            <span className={LABEL_CLASS}>
              Pin it on the map <span className="text-red-500">*</span>
            </span>
            <LocationPickerMap
              value={position}
              onChange={onPositionChange}
              hint="Required — this is what puts the event on the map."
            />
            {coordinateError && <p className={ERROR_CLASS}>{coordinateError}</p>}
          </div>
        </>
      )}
    </fieldset>
  )
}
