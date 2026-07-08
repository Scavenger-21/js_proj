'use client';
import { motion } from 'framer-motion';
import { Trash2, RotateCcw, Clock } from 'lucide-react';
import { cn, formatDate, formatDuration, getStatusBg, getMethodClasses, truncateUrl } from '@/lib/utils';
import { RequestHistory } from '@apiforge/shared';
import { useStore } from '@/store';
import { useDeleteHistoryItem } from '@/hooks/useHistory';
import { useRouter } from 'next/navigation';

interface HistoryItemProps {
  item: RequestHistory;
  index: number;
}

export function HistoryItem({ item, index }: HistoryItemProps) {
  const loadFromHistory = useStore((s) => s.loadFromHistory);
  const deleteMutation = useDeleteHistoryItem();
  const router = useRouter();

  const handleRerun = (e: React.MouseEvent) => {
    e.stopPropagation();
    loadFromHistory(item);
    router.push('/workspace');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(item.id);
  };

  const handleClick = () => {
    loadFromHistory(item);
    router.push('/workspace');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 400, damping: 30 }}
      onClick={handleClick}
      className="group flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'transparent',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Method Badge */}
      <span className={cn(
        'px-2 py-0.5 text-2xs font-semibold font-mono rounded shrink-0',
        getMethodClasses(item.method),
      )}>
        {item.method}
      </span>

      {/* URL + Meta */}
      <div className="flex-1 min-w-0">
        <span className="block text-xs font-mono text-text-primary truncate">
          {truncateUrl(item.url, 72)}
        </span>
        <div className="flex items-center gap-2 mt-0.5">
          <Clock size={9} className="text-text-disabled" />
          <span className="text-2xs text-text-disabled">{formatDate(item.createdAt)}</span>
          <span className="text-2xs text-text-disabled">·</span>
          <span className="text-2xs text-text-disabled font-mono">{formatDuration(item.responseTime)}</span>
        </div>
      </div>

      {/* Status Badge */}
      <span className="px-2 py-0.5 text-2xs font-mono font-semibold rounded-md border shrink-0"
        style={item.statusCode < 400
          ? { background: 'rgba(74,222,128,0.1)', color: '#4ade80', borderColor: 'rgba(74,222,128,0.2)' }
          : { background: 'rgba(248,113,113,0.1)', color: '#f87171', borderColor: 'rgba(248,113,113,0.2)' }
        }>
        {item.statusCode}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={handleRerun}
          className="p-1.5 rounded-lg text-text-tertiary transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#555770'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          title="Re-run request"
        >
          <RotateCcw size={12} />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="p-1.5 rounded-lg text-text-tertiary transition-all duration-200 disabled:opacity-50"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.25)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#555770'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          title="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  );
}
