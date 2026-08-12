import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { lostFoundApi } from '../api/lostFoundApi'
import { lostFoundErrorMessage } from '../utils/lostFoundErrors'
import { STATUS_LABEL } from '../utils/display'
import { lostFoundKeys } from '../types'
import type {
  CreateLostFoundItemRequest,
  LostFoundItemResponse,
  LostFoundStatusUpdateRequest,
  UpdateLostFoundItemRequest,
} from '../types'

/**
 * Every list surface that could contain the changed item. Stats too — the board header shows
 * counts by type and status, so any create, status change or delete moves them.
 */
function invalidateItemLists(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: lostFoundKeys.lists() })
  queryClient.invalidateQueries({ queryKey: lostFoundKeys.searches() })
  queryClient.invalidateQueries({ queryKey: lostFoundKeys.mineAll() })
  queryClient.invalidateQueries({ queryKey: lostFoundKeys.maps() })
  queryClient.invalidateQueries({ queryKey: lostFoundKeys.stats() })
}

export function useCreateLostFoundItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateLostFoundItemRequest) => lostFoundApi.create(body),
    onSuccess: (item: LostFoundItemResponse) => {
      queryClient.setQueryData(lostFoundKeys.detail(item.id), item)
      invalidateItemLists(queryClient)
      toast.success(item.itemType === 'LOST' ? 'Lost item reported' : 'Found item reported')
    },
    onError: (err) => toast.error(lostFoundErrorMessage(err)),
  })
}

export function useUpdateLostFoundItem(itemId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateLostFoundItemRequest) => lostFoundApi.update(itemId, body),
    onSuccess: (item: LostFoundItemResponse) => {
      queryClient.setQueryData(lostFoundKeys.detail(item.id), item)
      invalidateItemLists(queryClient)
      // Editing the title, category or location changes the inputs the matcher scores on.
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.matches(item.id) })
      toast.success('Report updated')
    },
    onError: (err) => toast.error(lostFoundErrorMessage(err)),
  })
}

export function useChangeLostFoundStatus(itemId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: LostFoundStatusUpdateRequest) => lostFoundApi.changeStatus(itemId, body),
    onSuccess: (item: LostFoundItemResponse) => {
      queryClient.setQueryData(lostFoundKeys.detail(item.id), item)
      invalidateItemLists(queryClient)
      // Reopening a CLAIMED item leaves the approved claim as history, so the claim list changes
      // shape without any claim mutation having run.
      queryClient.invalidateQueries({ queryKey: lostFoundKeys.itemClaimsAll(item.id) })
      toast.success(`Marked as ${STATUS_LABEL[item.status].toLowerCase()}`)
    },
    onError: (err) => toast.error(lostFoundErrorMessage(err)),
  })
}

export function useDeleteLostFoundItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: number) => lostFoundApi.remove(itemId),
    onSuccess: (_data, itemId) => {
      // Removed rather than invalidated: the row is soft-deleted server-side, so a refetch of this
      // key would 404 and leave an error state cached behind the redirect.
      queryClient.removeQueries({ queryKey: lostFoundKeys.detail(itemId) })
      queryClient.removeQueries({ queryKey: lostFoundKeys.matches(itemId) })
      queryClient.removeQueries({ queryKey: lostFoundKeys.itemClaimsAll(itemId) })
      invalidateItemLists(queryClient)
      toast.success('Report deleted')
    },
    onError: (err) => toast.error(lostFoundErrorMessage(err)),
  })
}
