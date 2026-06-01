import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: async () => {
      const { default: Component } = await import('../features/identity/pages/LandingPage')
      return { Component }
    },
  },
])
