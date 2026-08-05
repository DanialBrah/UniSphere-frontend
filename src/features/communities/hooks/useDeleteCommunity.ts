import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import { getErrorMessage } from '../../../lib/utils'

export function useDeleteCommunity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (communityId: number) => communityApi.remove(communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.discoverInfinite() })
      queryClient.invalidateQueries({ queryKey: communityKeys.mineInfinite() })
      toast.success('Community deleted')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
