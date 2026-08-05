import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'
import { getErrorMessage } from '../../../lib/utils'

export function useCreateCommunity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: communityApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communityKeys.discoverInfinite() })
      queryClient.invalidateQueries({ queryKey: communityKeys.mineInfinite() })
      toast.success('Community created')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}
