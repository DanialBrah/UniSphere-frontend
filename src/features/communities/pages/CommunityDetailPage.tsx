import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { DashboardLayout } from '../../../components/layout/DashboardLayout'
import { CommunityBannerHeader } from '../components/CommunityBannerHeader'
import { CommunityTabs } from '../components/CommunityTabs'
import type { CommunityTab } from '../components/CommunityTabs'
import { CommunityPostsTab } from '../components/CommunityPostsTab'
import { CommunityChatTab } from '../components/CommunityChatTab'
import { CommunityAnnouncementsTab } from '../components/CommunityAnnouncementsTab'
import { CommunityMembersTab } from '../components/CommunityMembersTab'
import { CommunityManageTab } from '../components/CommunityManageTab'
import { useCommunity } from '../hooks/useCommunity'
import { getErrorMessage } from '../../../lib/utils'

function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="rounded-2xl bg-white dark:bg-[#130D22] border border-gray-200 dark:border-[#2D1F4D] overflow-hidden">
        <div className="w-full h-40 bg-gray-200 dark:bg-[#2D1F4D]" />
        <div className="p-5 space-y-2">
          <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-[#2D1F4D]" />
          <div className="h-3 w-1/4 rounded bg-gray-100 dark:bg-[#241a38]" />
        </div>
      </div>
    </div>
  )
}

export default function CommunityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const parsedId = id ? parseInt(id, 10) : NaN
  const communityId = !isNaN(parsedId) ? parsedId : null
  const navigate = useNavigate()
  const [tab, setTab] = useState<CommunityTab>('posts')

  const { data: community, isLoading, isError, error, refetch } = useCommunity(communityId ?? 0)

  const canManage = community?.viewerRole === 'ADMIN' || community?.viewerRole === 'MODERATOR'

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {isLoading && <DetailSkeleton />}

        {isError && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Couldn't load this community
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{getErrorMessage(error)}</p>
            <button onClick={() => refetch()} className="text-xs text-primary font-medium hover:underline">
              Retry
            </button>
          </div>
        )}

        {community && (
          <>
            <CommunityBannerHeader community={community} />
            <CommunityTabs active={tab} onChange={setTab} showManage={!!canManage} />

            {tab === 'posts' && (
              <CommunityPostsTab communityId={community.id} viewerRole={community.viewerRole} />
            )}
            {tab === 'chat' && (
              <CommunityChatTab communityId={community.id} viewerRole={community.viewerRole} />
            )}
            {tab === 'announcements' && (
              <CommunityAnnouncementsTab
                communityId={community.id}
                viewerRole={community.viewerRole}
                canManage={!!canManage}
              />
            )}
            {tab === 'members' && (
              <CommunityMembersTab communityId={community.id} viewerRole={community.viewerRole} />
            )}
            {tab === 'manage' && canManage && <CommunityManageTab community={community} />}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
