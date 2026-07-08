'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useStore } from '@/store';
import { METHOD_COLORS } from '@/lib/constants';
import type { HttpMethod } from '@apiforge/shared';

const METHODS: { value: HttpMethod; label: string }[] = [
  { value: 'GET',    label: 'GET' },
  { value: 'POST',   label: 'POST' },
  { value: 'PUT',    label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'PATCH',  label: 'PATCH' },
];

const METHOD_GLASS: Record<HttpMethod, string> = {
  GET:     'rgba(74,222,128,0.15)',
  POST:    'rgba(129,140,248,0.15)',
  PUT:     'rgba(251,191,36,0.15)',
  DELETE:  'rgba(248,113,113,0.15)',
  PATCH:   'rgba(192,132,252,0.15)',
  HEAD:    'rgba(34,211,238,0.15)',
  OPTIONS: 'rgba(148,163,184,0.1)',
};

const METHOD_BORDER: Record<HttpMethod, string> = {
  GET:     'rgba(74,222,128,0.3)',
  POST:    'rgba(129,140,248,0.3)',
  PUT:     'rgba(251,191,36,0.3)',
  DELETE:  'rgba(248,113,113,0.3)',
  PATCH:   'rgba(192,132,252,0.3)',
  HEAD:    'rgba(34,211,238,0.3)',
  OPTIONS: 'rgba(148,163,184,0.2)',
};

export function MethodSelector() {
  const method    = useStore((s) => s.method);
  const setMethod = useStore((s) => s.setMethod);

  return (
    <div
      className="flex gap-1 p-1 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {METHODS.map((m) => {
        const isActive = method === m.value;
        return (
          <button
            key={m.value}
            onClick={() => setMethod(m.value)}
            className={cn(
              'relative flex-1 py-1.5 rounded-lg text-xs font-bold font-mono transition-all duration-200',
              isActive ? METHOD_COLORS[m.value] : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            {isActive && (
              <motion.div
                layoutId="method-pill"
                className="absolute inset-0 rounded-lg"
                style={{
                  background: METHOD_GLASS[m.value],
                  border: `1px solid ${METHOD_BORDER[m.value]}`,
                  boxShadow: `0 2px 12px ${METHOD_GLASS[m.value]}`,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
