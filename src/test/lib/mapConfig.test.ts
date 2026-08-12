import { describe, it, expect } from 'vitest'
import { parseCenter, type LatLngTuple } from '../../lib/mapConfig'

const FALLBACK: LatLngTuple = [3.0678, 101.5006]

/**
 * `VITE_MAP_DEFAULT_CENTER` is set by hand in a hosting dashboard, so a typo is a realistic
 * failure. It must degrade to the fallback rather than throw — every page that renders a map
 * imports this module at load time.
 */
describe('parseCenter', () => {
  it('parses a well-formed "lat,lng" pair', () => {
    expect(parseCenter('3.0678,101.5006', FALLBACK)).toEqual([3.0678, 101.5006])
  })

  it('tolerates surrounding whitespace', () => {
    expect(parseCenter(' 3.0678 , 101.5006 ', FALLBACK)).toEqual([3.0678, 101.5006])
  })

  it('parses negative coordinates', () => {
    expect(parseCenter('-33.8688,151.2093', FALLBACK)).toEqual([-33.8688, 151.2093])
  })

  it('falls back when the variable is unset', () => {
    expect(parseCenter(undefined, FALLBACK)).toEqual(FALLBACK)
    expect(parseCenter('', FALLBACK)).toEqual(FALLBACK)
  })

  it('falls back on a malformed pair rather than producing NaN', () => {
    expect(parseCenter('3.0678', FALLBACK)).toEqual(FALLBACK)
    expect(parseCenter('3.0678,101.5006,17', FALLBACK)).toEqual(FALLBACK)
    expect(parseCenter('north,east', FALLBACK)).toEqual(FALLBACK)
  })

  it('falls back on an out-of-range coordinate, e.g. a swapped lat/lng pair', () => {
    // 101.5 is a valid longitude but not a valid latitude — the classic transposition.
    expect(parseCenter('101.5006,3.0678', FALLBACK)).toEqual(FALLBACK)
    expect(parseCenter('3.0678,200', FALLBACK)).toEqual(FALLBACK)
  })

  it('accepts the exact bounds', () => {
    expect(parseCenter('90,180', FALLBACK)).toEqual([90, 180])
    expect(parseCenter('-90,-180', FALLBACK)).toEqual([-90, -180])
  })
})
