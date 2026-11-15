import { useQuery } from '@tanstack/react-query'
import { listUsers } from '../../lib/api/users'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: listUsers,
    retry: false,
  })
}
