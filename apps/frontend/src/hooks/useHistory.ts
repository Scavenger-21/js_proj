'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { HistoryQueryParams } from '@apiforge/shared';

export const HISTORY_KEY = ['history'] as const;

export function useHistory(params: HistoryQueryParams = {}) {
  return useQuery({
    queryKey: [...HISTORY_KEY, params],
    queryFn: () => apiClient.getHistory(params),
    staleTime: 5000,
  });
}

export function useDeleteHistoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteHistoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HISTORY_KEY });
    },
  });
}

export function useClearHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.clearHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HISTORY_KEY });
    },
  });
}
