import { useQuery } from '@tanstack/react-query'
import { listUsers } from '../../lib/api/users'

export function useUsers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['users'],
    queryFn: listUsers,
    retry: false,
    enabled: options?.enabled ?? true,
  })
}
