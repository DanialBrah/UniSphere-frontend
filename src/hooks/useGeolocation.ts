import { useCallback, useEffect, useRef, useState } from 'react'
import type { LatLngTuple } from '../lib/mapConfig'

interface GeolocationState {
  position: LatLngTuple | null
  error: string | null
  isLoading: boolean
}

/**
 * Lives in shared `hooks/` rather than inside the Lost & Found feature because the component that
 * consumes it — `components/map/LocationPickerMap` — is shared too.
 */
const INITIAL: GeolocationState = { position: null, error: null, isLoading: false }

/**
 * The browser reports a Permissions-Policy block as PERMISSION_DENIED, exactly like a user saying
 * no. The two need different copy — one is fixable by the user, the other only by us — so the
 * message distinguishes them by whether a prompt could even have been shown.
 */
function describeError(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return 'Location access was blocked. Allow it in your browser settings, or place the pin by tapping the map.'
    case err.POSITION_UNAVAILABLE:
      return "Your location couldn't be determined. Try tapping the map instead."
    case err.TIMEOUT:
      return 'Finding your location took too long. Try again, or tap the map to place the pin.'
    default:
      return 'Something went wrong finding your location. Tap the map to place the pin instead.'
  }
}

/**
 * One-shot geolocation lookup, triggered explicitly by `request()`.
 *
 * Deliberately not automatic on mount: a permission prompt the user did not ask for is the kind of
 * thing that gets denied permanently, which would then block the button that actually needs it.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(INITIAL)

  // Guards against a `setState` after unmount — the callback can fire long after the user navigates.
  const isMounted = useRef(true)
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState({
        position: null,
        error: 'This browser does not support location lookup. Tap the map to place the pin.',
        isLoading: false,
      })
      return
    }

    setState({ position: null, error: null, isLoading: true })

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!isMounted.current) return
        setState({
          position: [pos.coords.latitude, pos.coords.longitude],
          error: null,
          isLoading: false,
        })
      },
      (err) => {
        if (!isMounted.current) return
        setState({ position: null, error: describeError(err), isLoading: false })
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
    )
  }, [])

  const reset = useCallback(() => setState(INITIAL), [])

  return { ...state, request, reset }
}
