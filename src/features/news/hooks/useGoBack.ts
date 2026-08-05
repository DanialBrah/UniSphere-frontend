import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * Steps back one history entry, falling back to `fallback` when there is nothing to step back
 * to — a deep link, a refresh, or a fresh tab.
 *
 * The important part is that it **never pushes**. A "Back" control that navigates forward to a
 * URL traps the user in a cycle with any other back control on the page it lands on:
 *
 *   /news/42 --back (pop)--> /news/editor/42 --back (push)--> /news/42 --back (pop)--> …
 *
 * which is exactly the loop this replaces.
 */
export function useGoBack(fallback: string) {
  const navigate = useNavigate()
  const location = useLocation()

  // react-router stamps the first entry of a session with the key 'default', so anything else
  // means there is a real entry behind us.
  const canGoBack = location.key !== 'default'

  return useCallback(() => {
    if (canGoBack) navigate(-1)
    else navigate(fallback, { replace: true })
  }, [canGoBack, fallback, navigate])
}
