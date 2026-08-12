import { Crosshair, Loader2, X } from 'lucide-react'

const RADIUS_OPTIONS = [1, 5, 15] as const

interface NearMeToggleProps {
  isActive: boolean
  isLocating: boolean
  error: string | null
  radiusKm: number
  onEnable: () => void
  onDisable: () => void
  onRadiusChange: (radiusKm: number) => void
}

/**
 * Switches the board from "everything on campus" to "what's near me", backed by `/items/nearby`.
 *
 * Location is requested only on click, never on mount: an unprompted permission dialog is the kind
 * of thing people deny permanently, which would then block the one button that needs it.
 *
 * Note the site currently ships `Permissions-Policy: geolocation=(self)` in vercel.json — if that
 * ever reverts to `geolocation=()`, this button silently fails in production while working
 * perfectly in local dev.
 */
export function NearMeToggle({
  isActive,
  isLocating,
  error,
  radiusKm,
  onEnable,
  onDisable,
  onRadiusChange,
}: Readonly<NearMeToggleProps>) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={isActive ? onDisable : onEnable}
          disabled={isLocating}
          className={[
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60',
            isActive
              ? 'border-primary bg-primary text-white'
              : 'border-gray-200 bg-white text-gray-600 hover:border-primary/40 hover:text-primary dark:border-[#2D1F4D] dark:bg-[#1A1226] dark:text-gray-400',
          ].join(' ')}
        >
          {isLocating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Crosshair className="h-3.5 w-3.5" />
          )}
          Near me
          {isActive && <X className="h-3.5 w-3.5" />}
        </button>

        {isActive &&
          RADIUS_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => onRadiusChange(option)}
              className={[
                'rounded-md px-2 py-1 text-[11px] transition-colors',
                radiusKm === option
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-primary dark:bg-white/5 dark:text-gray-400',
              ].join(' ')}
            >
              {option} km
            </button>
          ))}
      </div>

      {error && <p className="text-xs text-amber-600 dark:text-amber-400">{error}</p>}

      {isActive && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Sorted by distance. Items reported without a pin aren&apos;t included.
        </p>
      )}
    </div>
  )
}
