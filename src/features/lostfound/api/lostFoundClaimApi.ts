import api from '../../../lib/axios'
import type {
  ApiResponse,
  CreateLostFoundClaimRequest,
  LostFoundClaimDecisionRequest,
  LostFoundClaimResponse,
  LostFoundClaimStatus,
  SpringPage,
} from '../types'

const unwrap = <T>(r: { data: ApiResponse<T> }): T => r.data.data
const unwrapPage = <T>(r: { data: ApiResponse<SpringPage<T>> }): SpringPage<T> => r.data.data

type QueryParams = Record<string, string | number>

/**
 * Collection operations nest under the item; single-claim operations are flat. A claim id is
 * globally unique, so requiring the item id on a PATCH would add a redundant consistency check.
 *
 * There is no DELETE — claims are audit history. Withdrawal is `decide(claimId, 'CANCELLED')`.
 *
 * Rate limit: `/lost-found/items/*&#47;claims` is capped at 10 requests per 60 s per user, and that
 * covers the GET as well as the POST. Never poll `listForItem`.
 */
export const lostFoundClaimApi = {
  submit: (itemId: number, body: CreateLostFoundClaimRequest): Promise<LostFoundClaimResponse> =>
    api
      .post<ApiResponse<LostFoundClaimResponse>>(`/lost-found/items/${itemId}/claims`, body)
      .then(unwrap),

  /** Reporters and admins see every claim; a claimant sees only their own; anyone else gets 403. */
  listForItem: (
    itemId: number,
    status: LostFoundClaimStatus | null,
    page: number,
    size = 20,
  ): Promise<SpringPage<LostFoundClaimResponse>> => {
    const params: QueryParams = { page, size }
    if (status) params.status = status
    return api
      .get<ApiResponse<SpringPage<LostFoundClaimResponse>>>(
        `/lost-found/items/${itemId}/claims`,
        { params },
      )
      .then(unwrapPage)
  },

  listMine: (
    status: LostFoundClaimStatus | null,
    page: number,
    size = 20,
  ): Promise<SpringPage<LostFoundClaimResponse>> => {
    const params: QueryParams = { page, size }
    if (status) params.status = status
    return api
      .get<ApiResponse<SpringPage<LostFoundClaimResponse>>>('/lost-found/claims/me', { params })
      .then(unwrapPage)
  },

  get: (claimId: number): Promise<LostFoundClaimResponse> =>
    api.get<ApiResponse<LostFoundClaimResponse>>(`/lost-found/claims/${claimId}`).then(unwrap),

  /**
   * One endpoint for all three outcomes. APPROVED and REJECTED belong to the item's reporter;
   * CANCELLED to the claimant. Approving is a single server transaction that also flips the item
   * to CLAIMED and auto-rejects every sibling claim — invalidate the item detail alongside.
   */
  decide: (
    claimId: number,
    body: LostFoundClaimDecisionRequest,
  ): Promise<LostFoundClaimResponse> =>
    api
      .patch<ApiResponse<LostFoundClaimResponse>>(`/lost-found/claims/${claimId}`, body)
      .then(unwrap),
}
