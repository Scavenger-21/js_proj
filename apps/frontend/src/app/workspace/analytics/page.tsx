'use client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, CheckCircle2, XCircle, Clock, Percent,
  TrendingUp, Activity, Loader2,
} from 'lucide-react';
import { MetricCard } from '@/components/analytics/MetricCard';
import { RequestTrendChart } from '@/components/analytics/RequestTrendChart';
import { LatencyChart } from '@/components/analytics/LatencyChart';
import { EndpointTable } from '@/components/analytics/EndpointTable';
import { useAnalytics } from '@/hooks/useAnalytics';
import { formatDuration } from '@/lib/utils';

const DATE_RANGES = [
  { label: '1h', hours: 1 },
  { label: '6h', hours: 6 },
  { label: '24h', hours: 24 },
  { label: '7d', hours: 168 },
];

export default function AnalyticsPage() {
  const [rangeHours, setRangeHours] = useState(24);

  // Memoize the dates to prevent infinite re-rendering loops
  const { from, to } = useMemo(() => {
    return {
      from: new Date(Date.now() - rangeHours * 60 * 60 * 1000).toISOString(),
      to: new Date().toISOString(),
    };
  }, [rangeHours]);

  const { data, isLoading } = useAnalytics(from, to);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-accent" />
          <span className="text-sm text-text-secondary">Loading analytics…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Analytics Overview</h2>
            <p className="text-sm text-text-tertiary mt-0.5">
              {data ? `${data.totalRequests.toLocaleString()} total requests in range` : 'No data'}
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1 p-1 rounded-lg transition-all" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {DATE_RANGES.map((r) => (
              <button
                key={r.label}
                onClick={() => setRangeHours(r.hours)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                  rangeHours === r.hours
                    ? 'text-white shadow-md'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                style={rangeHours === r.hours ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: '1px solid rgba(255,255,255,0.1)' } : {}}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {!data || data.totalRequests === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-64 gap-4 bg-bg-elevated rounded-xl border border-border"
          >
            <BarChart3 size={32} className="text-text-disabled" />
            <div className="text-center">
              <p className="text-sm font-semibold text-text-primary">No Data Yet</p>
              <p className="text-xs text-text-tertiary mt-1">Send some API requests to see analytics here.</p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Requests"
                value={data.totalRequests.toLocaleString()}
                icon={BarChart3}
                iconColor="text-accent"
                iconBg="bg-accent/10"
                index={0}
              />
              <MetricCard
                title="Successful"
                value={data.successCount.toLocaleString()}
                subtitle={`${data.successRate}% success rate`}
                icon={CheckCircle2}
                iconColor="text-green-400"
                iconBg="bg-green-400/10"
                index={1}
              />
              <MetricCard
                title="Failed"
                value={data.failureCount.toLocaleString()}
                subtitle={`${100 - data.successRate}% failure rate`}
                icon={XCircle}
                iconColor="text-red-400"
                iconBg="bg-red-400/10"
                index={2}
              />
              <MetricCard
                title="Avg Latency"
                value={formatDuration(data.averageResponseTime)}
                subtitle={`p95: ${formatDuration(data.latencyPercentiles.p95)}`}
                icon={Clock}
                iconColor="text-amber-400"
                iconBg="bg-amber-400/10"
                index={3}
              />
            </div>

            {/* Percentile Cards */}
            <div className="grid grid-cols-5 gap-3">
              {[
                { label: 'p50', value: data.latencyPercentiles.p50 },
                { label: 'p75', value: data.latencyPercentiles.p75 },
                { label: 'p90', value: data.latencyPercentiles.p90 },
                { label: 'p95', value: data.latencyPercentiles.p95 },
                { label: 'p99', value: data.latencyPercentiles.p99 },
              ].map((p, i) => (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex flex-col items-center gap-1 p-3 rounded-lg transition-all"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span className="text-2xs text-text-tertiary font-mono uppercase">{p.label}</span>
                  <span className={`text-sm font-bold font-mono ${p.value > 1000 ? 'text-red-400' : p.value > 400 ? 'text-amber-400' : 'text-green-400'}`} style={{ textShadow: '0 0 12px currentColor' }}>
                    {formatDuration(p.value)}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <RequestTrendChart data={data.requestsOverTime} title="Request Volume" />
              <LatencyChart data={data.latencyOverTime} averageLatency={data.averageResponseTime} />
            </div>

            {/* Method Distribution */}
            {Object.keys(data.requestsByMethod).length > 0 && (
              <div className="p-4 rounded-xl transition-all" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 className="text-sm font-semibold text-text-primary mb-4">Requests by Method</h3>
                <div className="flex items-end gap-3 h-20">
                  {Object.entries(data.requestsByMethod).map(([method, count]) => {
                    const pct = data.totalRequests > 0 ? (count / data.totalRequests) * 100 : 0;
                    const colors: Record<string, string> = {
                      GET: 'bg-green-400',
                      POST: 'bg-indigo-400',
                      PUT: 'bg-amber-400',
                      DELETE: 'bg-red-400',
                      PATCH: 'bg-purple-400',
                    };
                    const glowColors: Record<string, string> = {
                      GET: 'rgba(74,222,128,0.4)',
                      POST: 'rgba(99,102,241,0.4)',
                      PUT: 'rgba(251,191,36,0.4)',
                      DELETE: 'rgba(248,113,113,0.4)',
                      PATCH: 'rgba(168,85,247,0.4)',
                    };
                    return (
                      <div key={method} className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-xs font-mono text-text-secondary">{count}</span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(4, pct)}%` }}
                          transition={{ duration: 0.7, ease: 'easeOut', type: 'spring' }}
                          className={`w-full rounded-t-md ${colors[method] ?? 'bg-text-tertiary'} min-h-1`}
                          style={{ boxShadow: `0 -4px 12px ${glowColors[method] ?? 'transparent'}` }}
                        />
                        <span className={`text-2xs font-mono font-bold ${method === 'GET' ? 'text-green-400' : method === 'POST' ? 'text-indigo-400' : method === 'PUT' ? 'text-amber-400' : method === 'DELETE' ? 'text-red-400' : 'text-purple-400'}`}>
                          {method}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Endpoint Table */}
            <EndpointTable endpoints={data.topEndpoints} />
          </>
        )}
      </div>
    </div>
  );
}
