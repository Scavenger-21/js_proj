import {
  ProxyRequest,
  ProxyResponse,
  HistoryListResponse,
  HistoryQueryParams,
  AnalyticsData,
  DiagnosticsRequest,
  DiagnosticsResult,
  HealthScore,
  DeleteResponse,
} from '@apiforge/shared';

// ─── Base Fetch ───────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.error?.message ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

// ─── Request Proxy ────────────────────────────────────────────────────────────

export const apiClient = {
  sendRequest: (payload: ProxyRequest) =>
    apiFetch<ProxyResponse & { security: unknown }>('/api/request', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // ─── History ───────────────────────────────────────────────────────────────

  getHistory: (params: HistoryQueryParams = {}) => {
    const qs = new URLSearchParams();
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.offset) qs.set('offset', String(params.offset));
    if (params.method) qs.set('method', params.method);
    if (params.search) qs.set('search', params.search);
    return apiFetch<HistoryListResponse>(`/api/history?${qs.toString()}`);
  },

  deleteHistoryItem: (id: string) =>
    apiFetch<DeleteResponse>(`/api/history/${id}`, { method: 'DELETE' }),

  clearHistory: () =>
    apiFetch<DeleteResponse>('/api/history', { method: 'DELETE' }),

  // ─── Analytics ─────────────────────────────────────────────────────────────

  getAnalytics: (from?: string, to?: string) => {
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    return apiFetch<AnalyticsData>(`/api/analytics?${qs.toString()}`);
  },

  // ─── Diagnostics ───────────────────────────────────────────────────────────

  runDiagnostics: (payload: DiagnosticsRequest) =>
    apiFetch<DiagnosticsResult>('/api/diagnostics', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // ─── Health ────────────────────────────────────────────────────────────────

  getHealth: (endpoint?: string) => {
    const qs = endpoint ? `?endpoint=${encodeURIComponent(endpoint)}` : '';
    return apiFetch<HealthScore[]>(`/api/health${qs}`);
  },
};
