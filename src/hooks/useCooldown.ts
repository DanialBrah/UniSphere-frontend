import { useEffect, useState } from 'react'
import { parseApiError } from '../lib/utils'

/** Ticks down the `Retry-After` window carried by a 429 error. Returns the
 *  seconds remaining (0 = inactive). Re-arms whenever `error` changes identity. */
export function useCooldown(error: unknown): number {
  const [seenError, setSeenError] = useState(error)
  const [remaining, setRemaining] = useState(0)

  // Seed a fresh countdown during render when a new error comes in — React's
  // documented pattern for adjusting state from a changed prop, instead of
  // calling setState synchronously inside an effect.
  if (error !== seenError) {
    setSeenError(error)
    setRemaining(parseApiError(error).retryAfterSeconds ?? 0)
  }

  useEffect(() => {
    if (remaining === 0) return
    const id = setTimeout(() => setRemaining((prev) => Math.max(0, prev - 1)), 1000)
    return () => clearTimeout(id)
  }, [remaining])

  return remaining
}
