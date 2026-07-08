'use client';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useStore } from '@/store';
import { ProxyRequest } from '@apiforge/shared';

export function useRequest() {
  const setResponse = useStore((s) => s.setResponse);
  const setError = useStore((s) => s.setError);
  const setIsSending = useStore((s) => s.setIsSending);
  const setActiveTab = useStore((s) => s.setActiveTab);

  return useMutation({
    mutationFn: (payload: ProxyRequest) => apiClient.sendRequest(payload),
    onMutate: () => {
      setIsSending(true);
    },
    onSuccess: (data) => {
      setResponse(data);
      setActiveTab('body');
      setIsSending(false);
    },
    onError: (error: Error) => {
      setError(error.message);
      setIsSending(false);
    },
  });
}
