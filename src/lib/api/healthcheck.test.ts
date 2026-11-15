import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from './client'
import { getHealthcheck } from './healthcheck'

describe('healthcheck API', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('consulta el estado del servidor', async () => {
    const get = vi.spyOn(apiClient, 'get').mockResolvedValue({ data: {} })

    await getHealthcheck()

    expect(get).toHaveBeenCalledWith('/healthcheck')
  })
})
