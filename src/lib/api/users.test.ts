import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './client'
import { listUsers } from './users'

describe('users API', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('consulta los usuarios asignables', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: [] })

    await listUsers()

    expect(get).toHaveBeenCalledWith('/users')
  })
})
