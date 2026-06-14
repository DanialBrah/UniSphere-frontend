import { useQuery } from '@tanstack/react-query'
import { userApi } from '../api/userApi'

export function useUserById(id: number | null) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userApi.getUserById(id!),
    enabled: id !== null,
    staleTime: 2 * 60 * 1000,
  })
}
