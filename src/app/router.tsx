import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'

const LandingPage = lazy(() => import('../features/identity/pages/LandingPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div className="min-h-screen bg-white dark:bg-[#16171d]" />}>
        <LandingPage />
      </Suspense>
    ),
  },
])
