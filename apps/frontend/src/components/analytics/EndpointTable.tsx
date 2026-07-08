'use client';
import { motion } from 'framer-motion';
import { ExternalLink, TrendingUp } from 'lucide-react';
import { EndpointStats } from '@apiforge/shared';
import { formatDuration, cn } from '@/lib/utils';

interface EndpointTableProps {
  endpoints: EndpointStats[];
}

function SuccessBar({ rate }: { rate: number }) {
  const color = rate >= 95 ? 'bg-green-400' : rate >= 80 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-bg-subtle rounded-full overflow-hidden max-w-20">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${rate}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full', color)}
        />
      </div>
      <span className={cn(
        'text-xs font-mono w-10 text-right',
        rate >= 95 ? 'text-green-400' : rate >= 80 ? 'text-amber-400' : 'text-red-400',
      )}>
        {rate}%
      </span>
    </div>
  );
}

export function EndpointTable({ endpoints }: EndpointTableProps) {
  if (endpoints.length === 0) {
    return (
      <div className="p-4 bg-bg-elevated rounded-xl border border-border">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Top Endpoints</h3>
        <div className="flex items-center justify-center h-20 text-text-disabled text-xs">
          No endpoint data yet
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-bg-elevated rounded-xl border border-border">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={14} className="text-text-tertiary" />
        <h3 className="text-sm font-semibold text-text-primary">Top Endpoints</h3>
        <span className="ml-auto text-xs text-text-tertiary">{endpoints.length} endpoints</span>
      </div>

      {/* Header */}
      <div className="grid grid-cols-[1fr_80px_80px_100px] gap-3 px-3 py-1.5 mb-1">
        {['Endpoint', 'Requests', 'Avg Time', 'Success Rate'].map((h) => (
          <span key={h} className="text-2xs text-text-disabled uppercase tracking-wider font-medium">{h}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-1">
        {endpoints.map((ep, i) => (
          <motion.div
            key={ep.url}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="grid grid-cols-[1fr_80px_80px_100px] gap-3 items-center px-3 py-2.5 rounded-lg hover:bg-bg-overlay transition-colors group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-mono text-text-primary truncate">{ep.url}</span>
              <ExternalLink
                size={10}
                className="shrink-0 text-text-disabled opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <span className="text-xs font-mono text-text-secondary">{ep.totalRequests.toLocaleString()}</span>
            <span className={cn(
              'text-xs font-mono',
              ep.averageResponseTime > 1000 ? 'text-red-400' :
              ep.averageResponseTime > 400 ? 'text-amber-400' : 'text-green-400',
            )}>
              {formatDuration(ep.averageResponseTime)}
            </span>
            <SuccessBar rate={ep.successRate} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
