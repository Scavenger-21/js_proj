'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store';

export function HeadersEditor() {
  const headers      = useStore((s) => s.headers);
  const addHeader    = useStore((s) => s.addHeader);
  const removeHeader = useStore((s) => s.removeHeader);
  const updateHeader = useStore((s) => s.updateHeader);

  const enabledCount = headers.filter((h) => h.enabled && h.key).length;

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === headers.length - 1) addHeader();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-secondary">Request Headers</span>
          {enabledCount > 0 && (
            <span
              className="px-1.5 py-0.5 text-2xs font-mono rounded-md"
              style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
            >
              {enabledCount}
            </span>
          )}
        </div>
        <button
          onClick={addHeader}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary rounded-lg transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          <Plus size={11} />
          <span>Add Header</span>
        </button>
      </div>

      {/* Column Labels */}
      <div
        className="grid grid-cols-[1fr_1fr_56px] gap-2 px-4 py-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      >
        <span className="text-2xs text-text-disabled font-semibold uppercase tracking-widest">Key</span>
        <span className="text-2xs text-text-disabled font-semibold uppercase tracking-widest">Value</span>
        <span className="text-2xs text-text-disabled font-semibold uppercase tracking-widest text-center">Act</span>
      </div>

      {/* Headers List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {headers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-24 text-text-disabled gap-1.5"
            >
              <span className="text-xl">📋</span>
              <span className="text-xs">No headers yet</span>
            </motion.div>
          ) : (
            headers.map((header, index) => (
              <motion.div
                key={header.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: header.enabled ? 1 : 0.4, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.14 }}
                className="grid grid-cols-[1fr_1fr_56px] gap-2 px-4 py-1.5 group"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              >
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => updateHeader(header.id, 'key', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  placeholder="X-API-Key"
                  className="h-7 px-2 text-xs font-mono rounded-lg text-text-primary placeholder:text-text-disabled focus:outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                />
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => updateHeader(header.id, 'value', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  placeholder="value"
                  className="h-7 px-2 text-xs font-mono rounded-lg text-text-secondary placeholder:text-text-disabled focus:outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                />
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => updateHeader(header.id, 'enabled', !header.enabled)}
                    className="transition-colors duration-150"
                    title={header.enabled ? 'Disable' : 'Enable'}
                  >
                    {header.enabled
                      ? <ToggleRight size={15} className="text-accent" style={{ filter: 'drop-shadow(0 0 4px rgba(99,102,241,0.5))' }} />
                      : <ToggleLeft  size={15} className="text-text-disabled" />
                    }
                  </button>
                  <button
                    onClick={() => removeHeader(header.id)}
                    className="text-text-disabled hover:text-error transition-colors duration-150 opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
