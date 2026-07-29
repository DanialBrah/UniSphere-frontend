import { useEffect, useState } from 'react'

/**
 * Delays propagating a rapidly-changing value (e.g. a search input) until it settles.
 * Keeps search-as-you-type from firing a request per keystroke — which would also burn
 * through the API rate-limit budget.
 */
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])

  return debounced
}
