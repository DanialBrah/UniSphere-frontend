import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InfiniteData, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { connectApi } from '../api/connectApi'
import { connectKeys } from '../types'
import { getErrorMessage } from '../../../lib/utils'
import type { SpringPage } from '../../social/types'
import type { FollowStats, PersonSummary } from '../types'

type PeopleList = PersonSummary[]
type PeoplePages = InfiniteData<SpringPage<PersonSummary>>

const flip = (person: PersonSummary, userId: number, isFollowing: boolean) =>
  person.id === userId ? { ...person, isFollowing } : person

/**
 * The same person can appear in several caches at once — recommendations, search results, and
 * any followers/following list currently mounted. Rather than tracking which, this walks every
 * `['connect', …]` entry and patches whichever shape it finds, so every visible copy of that
 * person's follow button flips together.
 */
function patchAllPeopleCaches(queryClient: QueryClient, userId: number, isFollowing: boolean) {
  queryClient.setQueriesData({ queryKey: connectKeys.all }, (old: unknown) => {
    if (!old) return old

    // recommendations: PersonSummary[]
    if (Array.isArray(old)) {
      return (old as PeopleList).map((p) => flip(p, userId, isFollowing))
    }

    // search / followers / following: InfiniteData<SpringPage<PersonSummary>>
    if (typeof old === 'object' && 'pages' in old) {
      const data = old as PeoplePages
      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          content: page.content.map((p) => flip(p, userId, isFollowing)),
        })),
      }
    }

    return old
  })
}

export function useToggleFollow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => connectApi.toggleFollow(userId),

    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: connectKeys.all })
      const previous = queryClient.getQueriesData({ queryKey: connectKeys.all })

      // Derive the target state from any cached copy of this person; default to "not yet
      // following" so a first click optimistically follows.
      const statsKey = connectKeys.stats(userId)
      const cachedStats = queryClient.getQueryData<FollowStats>(statsKey)
      const currentlyFollowing = cachedStats?.isFollowing ?? findFollowState(queryClient, userId)
      const next = !currentlyFollowing

      patchAllPeopleCaches(queryClient, userId, next)
      if (cachedStats) {
        queryClient.setQueryData<FollowStats>(statsKey, {
          ...cachedStats,
          isFollowing: next,
          followersCount: Math.max(0, cachedStats.followersCount + (next ? 1 : -1)),
        })
      }

      return { previous }
    },

    onError: (error, _userId, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data))
      toast.error(getErrorMessage(error))
    },

    onSuccess: (result, userId) => {
      // Reconcile against the server's authoritative counts
      patchAllPeopleCaches(queryClient, userId, result.following)
      queryClient.setQueryData<FollowStats>(connectKeys.stats(userId), (old) =>
        old
          ? { ...old, isFollowing: result.following, followersCount: result.followersCount }
          : old,
      )
      // Deliberately NOT invalidating recommendations: the backend excludes people you follow,
      // so a refetch would make the card vanish the instant you follow it. Leave it in place
      // showing "Following" — it drops off naturally next time the list is fetched.
    },
  })
}

/** Best-effort lookup of a person's current follow state across any mounted people cache. */
function findFollowState(queryClient: QueryClient, userId: number): boolean {
  for (const [, data] of queryClient.getQueriesData({ queryKey: connectKeys.all })) {
    if (Array.isArray(data)) {
      const hit = (data as PeopleList).find((p) => p.id === userId)
      if (hit) return hit.isFollowing
    } else if (data && typeof data === 'object' && 'pages' in data) {
      for (const page of (data as PeoplePages).pages) {
        const hit = page.content.find((p) => p.id === userId)
        if (hit) return hit.isFollowing
      }
    }
  }
  return false
}
