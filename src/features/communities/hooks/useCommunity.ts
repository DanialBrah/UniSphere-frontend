import { useQuery } from '@tanstack/react-query'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'

export function useCommunity(communityId: number) {
  return useQuery({
    queryKey: communityKeys.detail(communityId),
    queryFn: () => communityApi.getById(communityId),
    enabled: communityId > 0,
  })
}
