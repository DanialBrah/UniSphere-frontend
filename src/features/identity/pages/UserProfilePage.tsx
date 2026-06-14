import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { DashboardLayout }  from '../../../components/layout/DashboardLayout'
import { ProfileHeader }    from '../components/profile/ProfileHeader'
import { ProfileDetails }   from '../components/profile/ProfileDetails'
import { ProfileSkeleton }  from '../components/profile/ProfileSkeleton'
import { ProfileError }     from '../components/profile/ProfileError'
import { UserPostsFeed }    from '../../social/components/UserPostsFeed'
import { useUserById }      from '../hooks/useUserById'

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const parsedId = id ? parseInt(id, 10) : NaN
  const userId = !isNaN(parsedId) ? parsedId : null
  const navigate = useNavigate()
  const { data: user, isLoading, isError } = useUserById(userId)

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {isLoading && !user && <ProfileSkeleton />}
        {isError && <ProfileError />}

        {user && (
          <>
            <ProfileHeader user={user} />
            <ProfileDetails user={user} />
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Posts</h3>
              <UserPostsFeed userId={user.id} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
