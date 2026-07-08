'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useHealth(endpoint?: string) {
  return useQuery({
    queryKey: ['health', endpoint],
    queryFn: () => apiClient.getHealth(endpoint),
    staleTime: 30000,
    refetchInterval: 60000,
  });
}
