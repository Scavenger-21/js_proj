'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Filter, Loader2, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHistory, useClearHistory } from '@/hooks/useHistory';
import { HistoryItem } from './HistoryItem';
import { HistoryEmptyState } from './HistoryEmptyState';
import { HttpMethod } from '@apiforge/shared';
import { METHOD_COLORS, METHOD_BG_STYLES } from '@/lib/constants';

const METHOD_FILTERS: { value: HttpMethod | undefined; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'PATCH', label: 'PATCH' },
];

export function HistoryList() {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<HttpMethod | undefined>(undefined);
  const [confirmClear, setConfirmClear] = useState(false);

  const { data, isLoading, refetch } = useHistory({
    search: search || undefined,
    method: methodFilter,
    limit: 100,
  });
  const clearMutation = useClearHistory();

  const handleClear = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    await clearMutation.mutateAsync();
    setConfirmClear(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex flex-col gap-2 p-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
      >
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
          <input
            type="text"
            placeholder="Filter by URL…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-8 text-xs rounded-lg text-text-primary placeholder:text-text-disabled focus:outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-secondary">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Method Filter + Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {METHOD_FILTERS.map((f) => (
              <button
                key={f.value ?? 'all'}
                onClick={() => setMethodFilter(f.value)}
                className={cn(
                  'px-2.5 py-1 text-2xs font-semibold font-mono rounded border transition-all',
                  methodFilter === f.value
                    ? f.value ? `${METHOD_COLORS[f.value]} ${METHOD_BG_STYLES[f.value]}` : 'text-text-primary bg-bg-subtle border-border-strong'
                    : 'text-text-tertiary border-transparent hover:text-text-secondary hover:bg-bg-elevated',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => refetch()}
              className="p-1.5 text-text-tertiary hover:text-text-secondary hover:bg-bg-elevated rounded border border-transparent hover:border-border transition-all"
              title="Refresh"
            >
              <RefreshCw size={12} />
            </button>
            {data?.total != null && data.total > 0 && (
              <button
                onClick={handleClear}
                disabled={clearMutation.isPending}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border transition-all',
                  confirmClear
                    ? 'text-white bg-red-500 border-red-500 hover:bg-red-600'
                    : 'text-text-tertiary hover:text-error hover:bg-error/10 border-transparent hover:border-error/20',
                )}
              >
                <Trash2 size={11} />
                {confirmClear ? 'Confirm Clear' : 'Clear All'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Count */}
      {data && data.total > 0 && (
        <div className="px-4 py-2 border-b border-border bg-bg-elevated/30 shrink-0">
          <span className="text-xs text-text-tertiary">
            {data.total} request{data.total !== 1 ? 's' : ''}
            {search && ` matching "${search}"`}
          </span>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 size={18} className="animate-spin text-accent" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <HistoryEmptyState />
        ) : (
          <AnimatePresence>
            {data.items.map((item, i) => (
              <HistoryItem key={item.id} item={item} index={i} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
