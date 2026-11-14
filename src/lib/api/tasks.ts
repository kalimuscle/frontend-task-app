import { apiClient } from './client'

export type TaskStatus = 'pending' | 'in_progress' | 'done'

export interface Task {
  id: string
  title: string
  status: TaskStatus
  assigneeId: string
  createdAt: string
  updatedAt: string
}

export interface TasksResponse {
  items: Task[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export async function listTasks() {
  const response = await apiClient.get<TasksResponse>('/tasks')

  return response.data
}
