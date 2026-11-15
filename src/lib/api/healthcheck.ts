import { apiClient } from './client'

export interface HealthcheckReport {
  status: string
  server: {
    status: string
    uptimeSeconds: number
    timestamp: string
  }
  database: {
    status: string
    latencyMs: number
  }
}

export async function getHealthcheck() {
  const response = await apiClient.get<HealthcheckReport>('/healthcheck')

  return response.data
}
