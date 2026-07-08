import { create, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import { HttpMethod, ProxyResponse, RequestHistory } from '@apiforge/shared';

// ─── Shared Utilities ─────────────────────────────────────────────────────────
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// ─── Request Slice ─────────────────────────────────────────────────────────────
interface Header {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

const defaultHeaders: Header[] = [
  { id: generateId(), key: 'Content-Type', value: 'application/json', enabled: true },
  { id: generateId(), key: 'Accept', value: 'application/json', enabled: true },
];

interface RequestSlice {
  method: HttpMethod;
  url: string;
  headers: Header[];
  body: string;
  isSending: boolean;
  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setHeaders: (headers: Header[]) => void;
  addHeader: () => void;
  removeHeader: (id: string) => void;
  updateHeader: (id: string, field: 'key' | 'value' | 'enabled', value: string | boolean) => void;
  setBody: (body: string) => void;
  setIsSending: (isSending: boolean) => void;
  loadFromHistory: (item: RequestHistory) => void;
  reset: () => void;
}

const createRequestSlice: StateCreator<StoreState, [["zustand/devtools", never]], [], RequestSlice> = (set) => ({
  method: 'GET',
  url: '',
  headers: defaultHeaders,
  body: '',
  isSending: false,
  setMethod: (method) => set({ method }, false, 'request/setMethod'),
  setUrl: (url) => set({ url }, false, 'request/setUrl'),
  setHeaders: (headers) => set({ headers }, false, 'request/setHeaders'),
  addHeader: () => set((state) => ({
    headers: [...state.headers, { id: generateId(), key: '', value: '', enabled: true }],
  }), false, 'request/addHeader'),
  removeHeader: (id) => set((state) => ({
    headers: state.headers.filter((h) => h.id !== id),
  }), false, 'request/removeHeader'),
  updateHeader: (id, field, value) => set((state) => ({
    headers: state.headers.map((h) => h.id === id ? { ...h, [field]: value } : h),
  }), false, 'request/updateHeader'),
  setBody: (body) => set({ body }, false, 'request/setBody'),
  setIsSending: (isSending) => set({ isSending }, false, 'request/setIsSending'),
  loadFromHistory: (item) => {
    const headers: Header[] = Object.entries(
      (item.headers as Record<string, string>) ?? {},
    ).map(([key, value]) => ({ id: generateId(), key, value, enabled: true }));
    set({
      method: item.method,
      url: item.url,
      headers: headers.length > 0 ? headers : defaultHeaders,
      body: item.body && typeof item.body === 'object' ? JSON.stringify(item.body, null, 2) : String(item.body ?? ''),
    }, false, 'request/loadFromHistory');
  },
  reset: () => set({
    method: 'GET',
    url: '',
    headers: defaultHeaders,
    body: '',
    isSending: false,
  }, false, 'request/reset'),
});

// ─── Response Slice ────────────────────────────────────────────────────────────
interface ResponseSlice {
  response: (ProxyResponse & { security: unknown }) | null;
  error: string | null;
  activeTab: 'body' | 'headers' | 'diagnostics' | 'security';
  setResponse: (response: (ProxyResponse & { security: unknown }) | null) => void;
  setError: (error: string | null) => void;
  setActiveTab: (tab: 'body' | 'headers' | 'diagnostics' | 'security') => void;
  clear: () => void;
}

const createResponseSlice: StateCreator<StoreState, [["zustand/devtools", never]], [], ResponseSlice> = (set) => ({
  response: null,
  error: null,
  activeTab: 'body',
  setResponse: (response) => set({ response, error: null }, false, 'response/setResponse'),
  setError: (error) => set({ error, response: null }, false, 'response/setError'),
  setActiveTab: (activeTab) => set({ activeTab }, false, 'response/setActiveTab'),
  clear: () => set({ response: null, error: null, activeTab: 'body' }, false, 'response/clear'),
});

// ─── UI Slice ─────────────────────────────────────────────────────────────────
interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: 'default' | 'success' | 'error' | 'warning';
}

interface UISlice {
  isSidebarCollapsed: boolean;
  activePanel: 'request' | 'history' | 'analytics' | 'health';
  toasts: Toast[];
  toggleSidebar: () => void;
  setActivePanel: (panel: 'request' | 'history' | 'analytics' | 'health') => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const createUISlice: StateCreator<StoreState, [["zustand/devtools", never]], [], UISlice> = (set) => ({
  isSidebarCollapsed: false,
  activePanel: 'request',
  toasts: [],
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }), false, 'ui/toggleSidebar'),
  setActivePanel: (activePanel) => set({ activePanel }, false, 'ui/setActivePanel'),
  addToast: (toast) => set((state) => ({
    toasts: [...state.toasts, { ...toast, id: generateId() }],
  }), false, 'ui/addToast'),
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  }), false, 'ui/removeToast'),
});

// ─── Combined Store ────────────────────────────────────────────────────────────
type StoreState = RequestSlice & ResponseSlice & UISlice;

export const useStore = create<StoreState>()(
  devtools(
    (...a) => ({
      ...createRequestSlice(...a),
      ...createResponseSlice(...a),
      ...createUISlice(...a),
    }),
    { name: 'APIForge' }
  )
);
