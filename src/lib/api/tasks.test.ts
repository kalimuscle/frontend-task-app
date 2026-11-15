import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './client'
import { createTask, deleteTask, listTasks, updateTask } from './tasks'

const emptyPage = {
  items: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
}

describe('tasks API', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lista las tareas con la página, el límite y el filtro de estado', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: emptyPage })

    await listTasks({ status: 'done', page: 1, limit: 100 })

    expect(get).toHaveBeenCalledWith('/tasks', {
      params: { page: 1, limit: 100, status: 'done' },
    })
  })

  it('omite el filtro de estado cuando no se indica', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: emptyPage })

    await listTasks()

    expect(get).toHaveBeenCalledWith('/tasks', { params: { page: 1, limit: 20 } })
  })

  it('crea una tarea con su título, responsable y estado', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: {} })

    await createTask({
      title: 'Preparar la entrega',
      assigneeId: 'user-1',
      status: 'pending',
    })

    expect(post).toHaveBeenCalledWith('/tasks', {
      title: 'Preparar la entrega',
      assigneeId: 'user-1',
      status: 'pending',
    })
  })

  it('actualiza una tarea con los campos enviados', async () => {
    const patch = vi.spyOn(apiClient, 'patch').mockResolvedValue({ data: {} })

    await updateTask('task-1', { status: 'done' })

    expect(patch).toHaveBeenCalledWith('/tasks/task-1', { status: 'done' })
  })

  it('elimina una tarea por su identificador', async () => {
    const remove = vi
      .spyOn(apiClient, 'delete')
      .mockResolvedValue({ data: undefined })

    await deleteTask('task-1')

    expect(remove).toHaveBeenCalledWith('/tasks/task-1')
  })
})
