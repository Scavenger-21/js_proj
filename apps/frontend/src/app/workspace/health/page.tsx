'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Search, Loader2, RefreshCw, X } from 'lucide-react';
import { HealthScoreCard } from '@/components/health/HealthScoreCard';
import { useHealth } from '@/hooks/useHealth';

export default function HealthPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading, refetch, isFetching } = useHealth();

  const filtered = (data ?? []).filter((h) =>
    search ? h.endpoint.toLowerCase().includes(search.toLowerCase()) : true,
  );

  const avgScore = filtered.length > 0
    ? Math.round(filtered.reduce((sum, h) => sum + h.score, 0) / filtered.length)
    : null;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Endpoint Health</h2>
            <p className="text-sm text-text-tertiary mt-0.5">
              {filtered.length > 0
                ? `${filtered.length} endpoint${filtered.length > 1 ? 's' : ''} · Average score: ${avgScore}`
                : 'Health scores based on last 24 hours of traffic'}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-2 text-xs text-text-secondary bg-bg-elevated hover:bg-bg-subtle border border-border hover:border-border-strong rounded-lg transition-all"
          >
            <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-disabled" />
          <input
            type="text"
            placeholder="Filter endpoints…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-8 text-sm bg-bg-elevated border border-border rounded-lg text-text-primary placeholder:text-text-disabled focus:outline-none focus:border-accent/50 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-disabled hover:text-text-secondary">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={24} className="animate-spin text-accent" />
              <span className="text-sm text-text-secondary">Computing health scores…</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-64 gap-4 bg-bg-elevated rounded-xl border border-border"
          >
            <Activity size={32} className="text-text-disabled" />
            <div className="text-center">
              <p className="text-sm font-semibold text-text-primary">No Health Data</p>
              <p className="text-xs text-text-tertiary mt-1">
                {search
                  ? `No endpoints matching "${search}"`
                  : 'Send requests to see endpoint health scores here.'}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((health, i) => (
              <HealthScoreCard key={health.endpoint} health={health} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
