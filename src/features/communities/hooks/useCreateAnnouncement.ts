import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import { getErrorMessage } from '../../../lib/utils'
import type { CreateAnnouncementRequest } from '../types'

export function useCreateAnnouncement(communityId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateAnnouncementRequest) =>
      communityApi.createAnnouncement(communityId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.announcementsInfinite(communityId) })
      toast.success('Announcement posted')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
