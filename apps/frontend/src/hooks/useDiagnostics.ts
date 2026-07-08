'use client';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { DiagnosticsRequest } from '@apiforge/shared';

export function useDiagnostics() {
  return useMutation({
    mutationFn: (payload: DiagnosticsRequest) => apiClient.runDiagnostics(payload),
  });
}
