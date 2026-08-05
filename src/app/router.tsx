import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from '../components/layout/ProtectedRoute'
import { ProtectedLayout } from '../components/layout/ProtectedLayout'
import { PageSpinner } from '../components/ui/PageSpinner'

export const router = createBrowserRouter([
  {
    path: '/',
    HydrateFallback: PageSpinner,
    lazy: async () => {
      const { default: Component } = await import('../features/identity/pages/LandingPage')
      return { Component }
    },
  },
  {
    path: '/login',
    HydrateFallback: PageSpinner,
    lazy: async () => {
      const { default: Component } = await import('../features/identity/pages/LoginPage')
      return { Component }
    },
  },
  {
    path: '/register',
    HydrateFallback: PageSpinner,
    lazy: async () => {
      const { default: Component } = await import('../features/identity/pages/RegisterPage')
      return { Component }
    },
  },
  {
    path: '/forgot-password',
    HydrateFallback: PageSpinner,
    lazy: async () => {
      const { default: Component } = await import('../features/identity/pages/ForgotPasswordPage')
      return { Component }
    },
  },
  {
    path: '/reset-password',
    HydrateFallback: PageSpinner,
    lazy: async () => {
      const { default: Component } = await import('../features/identity/pages/ResetPasswordPage')
      return { Component }
    },
  },
  {
    element: <ProtectedRoute />,
    HydrateFallback: PageSpinner,
    children: [
      {
        element: <ProtectedLayout />,
        children: [
      {
        path: '/dashboard',
        lazy: async () => {
          const { default: Component } = await import('../features/identity/pages/DashboardPage')
          return { Component }
        },
      },
      {
        path: '/feed',
        lazy: async () => {
          const { default: Component } = await import('../features/social/pages/FeedPage')
          return { Component }
        },
      },
      {
        path: '/post/:id',
        lazy: async () => {
          const { default: Component } = await import('../features/social/pages/PostDetailPage')
          return { Component }
        },
      },
      {
        path: '/connect',
        lazy: async () => {
          const { default: Component } = await import('../features/connect/pages/ConnectPage')
          return { Component }
        },
      },
      {
        path: '/communities',
        lazy: async () => {
          const Component = () => <div className="p-6">Communities (Coming Soon)</div>
          return { Component }
        },
      },
      {
        path: '/messages',
        lazy: async () => {
          const { default: Component } = await import('../features/messaging/pages/MessagesPage')
          return { Component }
        },
      },
      {
        path: '/notifications',
        lazy: async () => {
          const { default: Component } = await import('../features/notifications/pages/NotificationsPage')
          return { Component }
        },
      },
      {
        path: '/marketplace',
        lazy: async () => {
          const Component = () => <div className="p-6">Marketplace (Coming Soon)</div>
          return { Component }
        },
      },
      {
        path: '/jobs',
        lazy: async () => {
          const Component = () => <div className="p-6">Jobs (Coming Soon)</div>
          return { Component }
        },
      },
      {
        path: '/events',
        lazy: async () => {
          const Component = () => <div className="p-6">Events (Coming Soon)</div>
          return { Component }
        },
      },
      {
        path: '/projects',
        lazy: async () => {
          const Component = () => <div className="p-6">Projects (Coming Soon)</div>
          return { Component }
        },
      },
      {
        path: '/study',
        lazy: async () => {
          const Component = () => <div className="p-6">Study Sessions (Coming Soon)</div>
          return { Component }
        },
      },
      {
        path: '/tutors',
        lazy: async () => {
          const Component = () => <div className="p-6">Tutoring (Coming Soon)</div>
          return { Component }
        },
      },
      {
        path: '/services',
        lazy: async () => {
          const Component = () => <div className="p-6">Services (Coming Soon)</div>
          return { Component }
        },
      },
      {
        path: '/lost-found',
        lazy: async () => {
          const Component = () => <div className="p-6">Lost & Found (Coming Soon)</div>
          return { Component }
        },
      },
      // Static news paths are declared before /news/:id for readability only — react-router v7
      // ranks routes by specificity, not declaration order, so /news/studio wins regardless.
      {
        path: '/news',
        lazy: async () => {
          const { default: Component } = await import('../features/news/pages/NewsPage')
          return { Component }
        },
      },
      {
        path: '/news/studio',
        lazy: async () => {
          const { default: Component } = await import('../features/news/pages/NewsStudioPage')
          return { Component }
        },
      },
      {
        path: '/news/editor',
        lazy: async () => {
          const { default: Component } = await import('../features/news/pages/NewsEditorPage')
          return { Component }
        },
      },
      {
        path: '/news/editor/:id',
        lazy: async () => {
          const { default: Component } = await import('../features/news/pages/NewsEditorPage')
          return { Component }
        },
      },
      {
        path: '/news/:id',
        lazy: async () => {
          const { default: Component } = await import('../features/news/pages/NewsDetailPage')
          return { Component }
        },
      },
      {
        path: '/map',
        lazy: async () => {
          const Component = () => <div className="p-6">Campus Map (Coming Soon)</div>
          return { Component }
        },
      },
      {
        path: '/bus',
        lazy: async () => {
          const Component = () => <div className="p-6">Bus Tracker (Coming Soon)</div>
          return { Component }
        },
      },
      {
        path: '/clubs',
        lazy: async () => {
          const Component = () => <div className="p-6">Clubs (Coming Soon)</div>
          return { Component }
        },
      },
      {
        path: '/timetable',
        lazy: async () => {
          const Component = () => <div className="p-6">Timetable (Coming Soon)</div>
          return { Component }
        },
      },
      {
        path: '/chatbot',
        lazy: async () => {
          const { default: Component } = await import('../features/campus/pages/ChatbotPage')
          return { Component }
        },
      },
      {
        path: '/profile/me',
        lazy: async () => {
          const { default: Component } = await import('../features/identity/pages/ProfilePage')
          return { Component }
        },
      },
      {
        path: '/profile/:id',
        lazy: async () => {
          const { default: Component } = await import('../features/identity/pages/UserProfilePage')
          return { Component }
        },
      },
        ],
      },
    ],
  },
])
