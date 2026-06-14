import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { DashboardLayout }    from '../../../components/layout/DashboardLayout'
import { ProfileHeader }      from '../components/profile/ProfileHeader'
import { ProfileDetails }     from '../components/profile/ProfileDetails'
import { ProfileSkeleton }    from '../components/profile/ProfileSkeleton'
import { ProfileError }       from '../components/profile/ProfileError'
import { EditProfileModal }   from '../components/profile/EditProfileModal'
import { ProfilePostsTabs }   from '../../social/components/ProfilePostsTabs'
import { useProfile }         from '../hooks/useProfile'
import { useDeleteAccount }   from '../hooks/useDeleteAccount'

function DeleteAccountModal({ onConfirm, onCancel, isPending }: {
  onConfirm: () => void
  onCancel: () => void
  isPending: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={!isPending ? onCancel : undefined}
    >
      <div
        className="bg-white dark:bg-[#130D22] rounded-2xl border border-gray-200 dark:border-[#2D1F4D] shadow-xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mx-auto mb-4">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-1">
          Delete account?
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          This action is permanent and cannot be undone. All your data will be removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-[#2D1F4D] text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {isPending ? 'Deleting…' : 'Delete account'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { data: profile, isLoading, isError } = useProfile()
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount()
  const [showEdit, setShowEdit] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

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

            {/* Danger Zone */}
            <div className="mt-8 rounded-2xl border border-red-200 dark:border-red-900/40 p-6">
              <h2 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Danger Zone</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-300 dark:border-red-800 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 size={14} />
                Delete my account
              </button>
            </div>
          </>
        )}

        {showEdit && profile && (
          <EditProfileModal profile={profile} onClose={() => setShowEdit(false)} />
        )}

        {showDeleteModal && (
          <DeleteAccountModal
            onConfirm={() => deleteAccount()}
            onCancel={() => setShowDeleteModal(false)}
            isPending={isDeleting}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
