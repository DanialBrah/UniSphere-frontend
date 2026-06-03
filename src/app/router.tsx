import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: async () => {
      const { default: Component } = await import('../features/identity/pages/LandingPage')
      return { Component }
    },
  },
  {
    path: '/login',
    lazy: async () => {
      const { default: Component } = await import('../features/identity/pages/LoginPage')
      return { Component }
    },
  },
  {
    path: '/register',
    lazy: async () => {
      const { default: Component } = await import('../features/identity/pages/RegisterPage')
      return { Component }
    },
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        lazy: async () => {
          const { default: Component } = await import('../features/identity/pages/DashboardPage')
          return { Component }
        },
      },
    ],
  },
])
