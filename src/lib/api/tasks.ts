import { apiClient } from './client'

export type TaskStatus = 'pending' | 'in_progress' | 'done'

export interface Task {
  id: string
  title: string
  status: TaskStatus
  creatorId: string
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

export interface ListTasksParams {
  status?: TaskStatus
  page?: number
  limit?: number
}

export interface CreateTaskInput {
  title: string
  assigneeId: string
  status: TaskStatus
}

export interface UpdateTaskInput {
  title?: string
  status?: TaskStatus
  assigneeId?: string
}

export async function listTasks(params: ListTasksParams = {}) {
  const query = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    ...(params.status ? { status: params.status } : {}),
  }
  const response = await apiClient.get<TasksResponse>('/tasks', { params: query })

  return response.data
}

export async function createTask(input: CreateTaskInput) {
  const response = await apiClient.post<Task>('/tasks', input)

  return response.data
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  const response = await apiClient.patch<Task>(`/tasks/${id}`, input)

  return response.data
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`)
}
