'use client';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useAnalytics(from?: string, to?: string) {
  return useQuery({
    queryKey: ['analytics', from, to],
    queryFn: () => apiClient.getAnalytics(from, to),
    staleTime: 30000,
    refetchInterval: 60000, // auto-refresh every minute
  });
}
