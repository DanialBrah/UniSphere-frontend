import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { bootstrapAuth } from './lib/authBootstrap'

export default function App() {
  // Silent re-auth from the HttpOnly refresh cookie. ProtectedRoute holds the UI on a spinner
  // until this settles, so a signed-in user is never briefly bounced to /login on reload.
  useEffect(() => {
    void bootstrapAuth()
  }, [])

  return <RouterProvider router={router} />
}
