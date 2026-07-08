'use client';
import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponseHeadersProps {
  headers: Record<string, string>;
}

const IMPORTANT_HEADERS = new Set([
  'content-type', 'content-length', 'authorization', 'cache-control',
  'x-request-id', 'x-ratelimit-remaining', 'x-ratelimit-limit',
  'retry-after', 'location', 'access-control-allow-origin',
]);

function HeaderRow({ name, value }: { name: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const isImportant = IMPORTANT_HEADERS.has(name.toLowerCase());

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="group flex items-start gap-3 px-4 py-2 transition-all duration-200"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div className="w-[30%] min-w-0 pt-0.5">
        <span className={cn(
          'text-xs font-mono truncate block',
          isImportant ? 'text-accent' : 'text-text-secondary',
        )}>
          {name}
        </span>
      </div>
      <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
        <span className="text-xs font-mono text-text-primary break-all leading-relaxed py-0.5" style={{ color: '#e2e4f0' }}>{value}</span>
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 rounded-md transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#8b8ea0'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          {copied ? <Check size={11} className="text-success" /> : <Copy size={11} className="text-text-secondary" />}
        </button>
      </div>
    </div>
  );
}

export function ResponseHeaders({ headers }: ResponseHeadersProps) {
  const [showAll, setShowAll] = useState(false);
  const entries = Object.entries(headers);

  const importantEntries = entries.filter(([name]) => IMPORTANT_HEADERS.has(name.toLowerCase()));
  const otherEntries = entries.filter(([name]) => !IMPORTANT_HEADERS.has(name.toLowerCase()));

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header Count */}
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="text-2xs font-mono font-semibold text-text-tertiary uppercase tracking-wider">{entries.length} Headers</span>
        <button
          onClick={() => setShowAll((s) => !s)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-text-secondary rounded-lg transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {showAll ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          {showAll ? 'Collapse' : 'Show All'}
        </button>
      </div>

      {/* Important Headers */}
      {importantEntries.length > 0 && (
        <div>
          <div className="px-4 py-1.5" style={{ background: 'rgba(99,102,241,0.05)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-2xs text-accent uppercase tracking-widest font-semibold">Key Headers</span>
          </div>
          {importantEntries.map(([name, value]) => (
            <HeaderRow key={name} name={name} value={value} />
          ))}
        </div>
      )}

      {/* Other Headers */}
      {(showAll || importantEntries.length === 0) && otherEntries.length > 0 && (
        <div>
          {importantEntries.length > 0 && (
            <div className="px-4 py-1.5 mt-2" style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-2xs text-text-disabled uppercase tracking-widest font-semibold">Other Headers</span>
            </div>
          )}
          {otherEntries.map(([name, value]) => (
            <HeaderRow key={name} name={name} value={value} />
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <div className="flex items-center justify-center h-full text-text-disabled text-xs">
          No response headers
        </div>
      )}
    </div>
  );
}
