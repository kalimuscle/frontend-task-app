import { useQuery } from '@tanstack/react-query'
import { getHealthcheck } from '../../lib/api/healthcheck'

export function useHealthcheck() {
  return useQuery({
    queryKey: ['healthcheck'],
    queryFn: getHealthcheck,
    refetchInterval: 20_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
    retry: 1,
  })
}
