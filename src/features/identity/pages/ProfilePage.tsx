import { useState } from 'react'
import { DashboardLayout }    from '../../../components/layout/DashboardLayout'
import { ProfileHeader }      from '../components/profile/ProfileHeader'
import { ProfileDetails }     from '../components/profile/ProfileDetails'
import { ProfileSkeleton }    from '../components/profile/ProfileSkeleton'
import { ProfileError }       from '../components/profile/ProfileError'
import { EditProfileModal }   from '../components/profile/EditProfileModal'
import { ProfilePostsTabs }   from '../../social/components/ProfilePostsTabs'
import { useProfile }         from '../hooks/useProfile'

export default function ProfilePage() {
  const { data: profile, isLoading, isError } = useProfile()
  const [showEdit, setShowEdit] = useState(false)

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h1>

        {isLoading && !profile && <ProfileSkeleton />}
        {isError && <ProfileError />}

        {profile && (
          <>
            <ProfileHeader user={profile} onEditClick={() => setShowEdit(true)} />
            <ProfileDetails user={profile} />
            <div className="mt-6">
              <ProfilePostsTabs userId={profile.id} />
            </div>
          </>
        )}

        {showEdit && profile && (
          <EditProfileModal profile={profile} onClose={() => setShowEdit(false)} />
        )}
      </div>
    </DashboardLayout>
  )
}
