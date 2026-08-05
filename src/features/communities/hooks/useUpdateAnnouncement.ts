import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import { getErrorMessage } from '../../../lib/utils'
import type { UpdateAnnouncementRequest } from '../types'

export function useUpdateAnnouncement(communityId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      announcementId,
      ...body
    }: { announcementId: number } & UpdateAnnouncementRequest) =>
      communityApi.updateAnnouncement(communityId, announcementId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.announcementsInfinite(communityId) })
      toast.success('Announcement updated')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
