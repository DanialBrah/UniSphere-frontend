import { describe, it, expect } from 'vitest'
import { latLngBounds } from 'leaflet'
import {
  APPROXIMATE_RADIUS_METERS,
  boundsToMapBounds,
  formatDistance,
  hasCoordinates,
  isQueryableBounds,
  roundBounds,
  roundCoordinate,
  toLatLng,
} from '../../../../features/lostfound/utils/geo'

describe('boundsToMapBounds', () => {
  it('maps a Leaflet viewport onto the four params /items/map expects', () => {
    const bounds = latLngBounds([3.06, 101.49], [3.08, 101.51])

    expect(boundsToMapBounds(bounds)).toEqual({
      minLat: 3.06,
      maxLat: 3.08,
      minLng: 101.49,
      maxLng: 101.51,
    })
  })

  it('clamps latitudes past the poles, which Leaflet reports when zoomed right out', () => {
    // The server rejects anything outside [-90, 90] with a 400, so this has to be clamped
    // client-side rather than passed through.
    const bounds = latLngBounds([-120, -200], [120, 200])
    const result = boundsToMapBounds(bounds)

    expect(result.minLat).toBe(-90)
    expect(result.maxLat).toBe(90)
    expect(result.minLng).toBe(-180)
    expect(result.maxLng).toBe(180)
  })
})

describe('isQueryableBounds', () => {
  it('accepts a normal viewport', () => {
    expect(
      isQueryableBounds({ minLat: 3.06, maxLat: 3.08, minLng: 101.49, maxLng: 101.51 }),
    ).toBe(true)
  })

  it('rejects an inverted viewport rather than letting the server 400', () => {
    expect(
      isQueryableBounds({ minLat: 3.08, maxLat: 3.06, minLng: 101.49, maxLng: 101.51 }),
    ).toBe(false)
    expect(
      isQueryableBounds({ minLat: 3.06, maxLat: 3.08, minLng: 101.51, maxLng: 101.49 }),
    ).toBe(false)
  })

  it('rejects a degenerate viewport where both edges coincide', () => {
    expect(isQueryableBounds({ minLat: 3.06, maxLat: 3.06, minLng: 101.4, maxLng: 101.5 })).toBe(
      false,
    )
  })
})

describe('roundBounds', () => {
  it('quantises to 4 dp so a sub-pixel pan does not mint a new query key', () => {
    expect(
      roundBounds({
        minLat: 3.0612345678,
        maxLat: 3.0812349999,
        minLng: 101.4912344,
        maxLng: 101.5112346,
      }),
    ).toEqual({ minLat: 3.0612, maxLat: 3.0812, minLng: 101.4912, maxLng: 101.5112 })
  })

  it('produces the same key for two viewports a few centimetres apart', () => {
    const a = roundBounds({ minLat: 3.06120001, maxLat: 3.08, minLng: 101.49, maxLng: 101.51 })
    const b = roundBounds({ minLat: 3.06120009, maxLat: 3.08, minLng: 101.49, maxLng: 101.51 })

    expect(a).toEqual(b)
  })
})

describe('roundCoordinate', () => {
  it('trims to 7 decimals to match DECIMAL(10,7) and @Digits(integer=3, fraction=7)', () => {
    expect(roundCoordinate(3.06781234567891)).toBe(3.0678123)
    expect(roundCoordinate(101.500612345678)).toBe(101.5006123)
  })

  it('leaves an already-short coordinate untouched', () => {
    expect(roundCoordinate(3.0678)).toBe(3.0678)
  })
})

describe('toLatLng', () => {
  it('returns a tuple only when both halves are present', () => {
    expect(toLatLng(3.0678, 101.5006)).toEqual([3.0678, 101.5006])
  })

  it('returns null for a half pair, which the server rejects with a 400', () => {
    expect(toLatLng(3.0678, null)).toBeNull()
    expect(toLatLng(null, 101.5006)).toBeNull()
    expect(toLatLng(null, null)).toBeNull()
  })

  it('treats 0,0 as a real coordinate rather than a falsy blank', () => {
    expect(toLatLng(0, 0)).toEqual([0, 0])
  })
})

describe('hasCoordinates', () => {
  it('is true only when both incident fields are set', () => {
    expect(hasCoordinates({ incidentLatitude: 3.06, incidentLongitude: 101.5 })).toBe(true)
    expect(hasCoordinates({ incidentLatitude: 3.06, incidentLongitude: null })).toBe(false)
    expect(hasCoordinates({ incidentLatitude: null, incidentLongitude: null })).toBe(false)
  })

  it('does not treat a zero coordinate as missing', () => {
    expect(hasCoordinates({ incidentLatitude: 0, incidentLongitude: 0 })).toBe(true)
  })
})

describe('formatDistance', () => {
  it('uses metres below a kilometre', () => {
    expect(formatDistance(0.42)).toBe('420 m away')
    expect(formatDistance(0)).toBe('0 m away')
  })

  it('uses one decimal of kilometres above', () => {
    expect(formatDistance(1.34)).toBe('1.3 km away')
    expect(formatDistance(12)).toBe('12.0 km away')
  })

  it('returns an empty string for a value that cannot be rendered', () => {
    expect(formatDistance(Number.NaN)).toBe('')
    expect(formatDistance(-1)).toBe('')
  })
})

describe('APPROXIMATE_RADIUS_METERS', () => {
  it('matches the ~1.1 km the server’s 2 dp rounding implies', () => {
    // lost-found.coarse-coordinate-scale = 2, and 0.01 degrees of latitude is ~1.11 km.
    expect(APPROXIMATE_RADIUS_METERS).toBe(1100)
  })
})
