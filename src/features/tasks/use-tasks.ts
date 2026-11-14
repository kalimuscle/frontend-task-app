import { useQuery } from '@tanstack/react-query'
import { listTasks } from '../../lib/api/tasks'

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: listTasks,
  })
}
