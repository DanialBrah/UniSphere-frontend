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
          const { default: Component } = await import('../features/communities/pages/CommunitiesPage')
          return { Component }
        },
      },
      {
        path: '/community/:id',
        lazy: async () => {
          const { default: Component } = await import('../features/communities/pages/CommunityDetailPage')
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
      // /jobs/new and /jobs/:jobId/edit both out-rank /jobs/:jobId because a static segment beats
      // a dynamic one, regardless of the order they're declared in.
      {
        path: '/jobs',
        lazy: async () => {
          const { default: Component } = await import('../features/jobs/pages/JobsBoardPage')
          return { Component }
        },
      },
      {
        path: '/jobs/new',
        lazy: async () => {
          const { default: Component } = await import('../features/jobs/pages/JobFormPage')
          return { Component }
        },
      },
      {
        path: '/jobs/:jobId',
        lazy: async () => {
          const { default: Component } = await import('../features/jobs/pages/JobDetailPage')
          return { Component }
        },
      },
      {
        path: '/jobs/:jobId/edit',
        lazy: async () => {
          const { default: Component } = await import('../features/jobs/pages/JobFormPage')
          return { Component }
        },
      },
      // /events/new and /events/:eventId/edit both out-rank /events/:eventId because a static
      // segment beats a dynamic one, regardless of the order they're declared in.
      {
        path: '/events',
        lazy: async () => {
          const { default: Component } = await import('../features/events/pages/EventsBoardPage')
          return { Component }
        },
      },
      {
        path: '/events/new',
        lazy: async () => {
          const { default: Component } = await import('../features/events/pages/EventFormPage')
          return { Component }
        },
      },
      {
        path: '/events/:eventId',
        lazy: async () => {
          const { default: Component } = await import('../features/events/pages/EventDetailPage')
          return { Component }
        },
      },
      {
        path: '/events/:eventId/edit',
        lazy: async () => {
          const { default: Component } = await import('../features/events/pages/EventFormPage')
          return { Component }
        },
      },
      // /projects/new and /projects/:projectId/edit both out-rank /projects/:projectId because a
      // static segment beats a dynamic one, regardless of the order they're declared in.
      {
        path: '/projects',
        lazy: async () => {
          const { default: Component } = await import('../features/projects/pages/ProjectsBoardPage')
          return { Component }
        },
      },
      {
        path: '/projects/new',
        lazy: async () => {
          const { default: Component } = await import('../features/projects/pages/ProjectFormPage')
          return { Component }
        },
      },
      {
        path: '/projects/:projectId',
        lazy: async () => {
          const { default: Component } = await import('../features/projects/pages/ProjectDetailPage')
          return { Component }
        },
      },
      {
        path: '/projects/:projectId/edit',
        lazy: async () => {
          const { default: Component } = await import('../features/projects/pages/ProjectFormPage')
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
      // Same specificity note as the news block below: /lost-found/new and
      // /lost-found/claims/:claimId both out-rank /lost-found/:itemId because a static segment
      // beats a dynamic one, regardless of the order they're declared in.
      {
        path: '/lost-found',
        lazy: async () => {
          const { default: Component } = await import(
            '../features/lostfound/pages/LostFoundBoardPage'
          )
          return { Component }
        },
      },
      {
        path: '/lost-found/new',
        lazy: async () => {
          const { default: Component } = await import(
            '../features/lostfound/pages/LostFoundReportPage'
          )
          return { Component }
        },
      },
      // Where a LOST_FOUND_CLAIM notification lands: its targetId is a claim id, not an item id,
      // so this route resolves the claim and forwards to the item.
      {
        path: '/lost-found/claims/:claimId',
        lazy: async () => {
          const { default: Component } = await import(
            '../features/lostfound/pages/LostFoundClaimRedirectPage'
          )
          return { Component }
        },
      },
      {
        path: '/lost-found/:itemId',
        lazy: async () => {
          const { default: Component } = await import(
            '../features/lostfound/pages/LostFoundDetailPage'
          )
          return { Component }
        },
      },
      {
        path: '/lost-found/:itemId/edit',
        lazy: async () => {
          const { default: Component } = await import(
            '../features/lostfound/pages/LostFoundReportPage'
          )
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
          const { default: Component } = await import('../features/campus/pages/CampusMapPage')
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
