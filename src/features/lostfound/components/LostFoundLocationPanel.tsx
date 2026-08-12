import { Info, MapPin, PackageCheck, ShieldCheck } from 'lucide-react'
import { StaticLocationMap } from '../../../components/map/StaticLocationMap'
import { createItemIcon, FOUND_COLOR, LOST_COLOR } from '../../../components/map/mapIcons'
import { ApproximateLocationBadge } from './LostFoundBadges'
import { APPROXIMATE_RADIUS_METERS, toLatLng } from '../utils/geo'
import { INCIDENT_PLACE_LABEL, PICKUP_PLACE_LABEL } from '../utils/display'
import type { LostFoundItemResponse } from '../types'

const CARD =
  'rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#2D1F4D] dark:bg-[#1A1226]'

/**
 * The incident and pickup locations, and — the harder half — an honest account of what has been
 * withheld and why.
 *
 * For a FOUND item viewed by anyone without an approved claim, the server coarsens the incident
 * coordinates to ~1.1 km and returns the entire pickup block as null. Rendered naively that is a
 * pin in the wrong place above an empty section, which reads as a bug rather than as a deliberate
 * anti-fraud measure. Every one of those states gets explicit copy here.
 */
export function LostFoundLocationPanel({ item }: Readonly<{ item: LostFoundItemResponse }>) {
  const accent = item.itemType === 'LOST' ? LOST_COLOR : FOUND_COLOR
  const incident = toLatLng(item.incidentLatitude, item.incidentLongitude)
  const pickup = toLatLng(item.pickupLatitude, item.pickupLongitude)

  const icon = createItemIcon({
    color: accent,
    category: item.category,
    approximate: item.coordinatesApproximate,
  })

  // Distinguishes "withheld by the privacy guard" from "the reporter never filled it in". Only a
  // FOUND item is ever masked, and only for a viewer who isn't the reporter, an admin, or an
  // approved claimant — `coordinatesApproximate` is precisely that condition.
  const isPickupWithheld =
    item.itemType === 'FOUND' && item.coordinatesApproximate && !item.pickupPlace && !pickup

  return (
    <section className="space-y-3">
      <div className={CARD}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
            <MapPin className="h-4 w-4 text-primary" />
            {INCIDENT_PLACE_LABEL[item.itemType].replace('?', '')}
          </h2>
          {item.coordinatesApproximate && <ApproximateLocationBadge />}
        </div>

        {item.incidentPlace && (
          <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">{item.incidentPlace}</p>
        )}

        {incident ? (
          <>
            <StaticLocationMap
              position={incident}
              icon={icon}
              accentColor={accent}
              approximateRadiusMeters={
                item.coordinatesApproximate ? APPROXIMATE_RADIUS_METERS : undefined
              }
              // A ~1.1 km circle needs room; zooming to street level would push it off screen and
              // imply a precision the coordinates don't have.
              zoom={item.coordinatesApproximate ? 14 : 17}
            />
            {item.coordinatesApproximate && (
              <p className="mt-2 flex gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Info className="h-3.5 w-3.5 shrink-0 translate-y-px" />
                This shows the general area, not the exact spot. Precise coordinates on found items
                are only revealed once a claim is approved — that&apos;s what stops someone
                guessing their way to an item that isn&apos;t theirs.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No map pin was added to this report.
          </p>
        )}
      </div>

      <div className={CARD}>
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
          <PackageCheck className="h-4 w-4 text-primary" />
          {PICKUP_PLACE_LABEL[item.itemType].replace('?', '')}
        </h2>

        {isPickupWithheld ? (
          <div className="flex gap-2.5 rounded-xl bg-primary-50 p-3 dark:bg-primary/10">
            <ShieldCheck className="h-4 w-4 shrink-0 translate-y-px text-primary" />
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-medium text-gray-900 dark:text-white">
                The collection point is hidden
              </p>
              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                It&apos;s shared with you as soon as the reporter approves your claim. If this is
                your item, submit a claim describing something about it only the owner would know.
              </p>
            </div>
          </div>
        ) : (
          <>
            {item.pickupPlace ? (
              <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">{item.pickupPlace}</p>
            ) : (
              !pickup && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {item.itemType === 'LOST'
                    ? 'The reporter hasn’t said where to return it — message them if you find it.'
                    : 'No collection point was given.'}
                </p>
              )
            )}

            {pickup && (
              <StaticLocationMap position={pickup} icon={icon} accentColor={accent} zoom={17} />
            )}

            {item.pickupInstructions && (
              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-gray-50 p-3 text-sm text-gray-700 dark:bg-white/5 dark:text-gray-300">
                {item.pickupInstructions}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}
