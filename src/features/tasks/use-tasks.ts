import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { createTask, deleteTask, listTasks, updateTask } from '../../lib/api/tasks'
import type { TaskStatus, UpdateTaskInput } from '../../lib/api/tasks'
import { useSessionExpiry } from '../auth/use-auth'

function invalidateTasks(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ['tasks'] })
}

export function useTasks(status?: TaskStatus) {
  const expireSession = useSessionExpiry()

  return useQuery({
    queryKey: ['tasks', { status: status ?? null }],
    queryFn: async () => {
      try {
        return await listTasks({ status, limit: 100 })
      } catch (error) {
        expireSession(error)
        throw error
      }
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => invalidateTasks(queryClient),
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      updateTask(id, input),
    onSuccess: () => invalidateTasks(queryClient),
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => invalidateTasks(queryClient),
  })
}
