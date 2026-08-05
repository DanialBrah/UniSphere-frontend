import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import { getErrorMessage } from '../../../lib/utils'

export function useDeleteAnnouncement(communityId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (announcementId: number) =>
      communityApi.deleteAnnouncement(communityId, announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.announcementsInfinite(communityId) })
      toast.success('Announcement deleted')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
