import { requestTokenRefresh } from './axios'
import { useAuthStore } from '../stores/authStore'

let started = false

/**
 * Restores the session on page load by exchanging the HttpOnly refresh cookie for a fresh access
 * token. This is what replaces persisting the token to Web Storage: nothing readable by JS
 * survives the reload, but the user still stays signed in.
 *
 * Runs at most once per page load. React StrictMode double-invokes effects in dev, and two
 * parallel refreshes would rotate the cookie twice — the second rotation invalidating the token
 * the first call just issued, silently signing the user out.
 */
export async function bootstrapAuth(): Promise<void> {
  if (started) return
  started = true

  try {
    const { accessToken, user } = await requestTokenRefresh()
    useAuthStore.getState().setAuth(accessToken, user)
  } catch {
    // No cookie, or an expired/revoked one — the user simply isn't signed in.
  } finally {
    // Always flip this: ProtectedRoute blocks on it, so failing to set it would
    // leave the app stuck on the loading spinner forever.
    useAuthStore.getState()._setHydrated()
  }
}
