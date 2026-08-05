import { useQuery } from '@tanstack/react-query'
import { communityApi } from '../api/communityApi'
import { communityKeys } from '../types'

/** Only fetch once the caller is known to be a member — the endpoint 403s otherwise. */
export function useCommunityChatAccess(communityId: number, enabled: boolean) {
  return useQuery({
    queryKey: communityKeys.chatAccess(communityId),
    queryFn: () => communityApi.getChatAccess(communityId),
    enabled: enabled && communityId > 0,
  })
}
