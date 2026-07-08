'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MethodSelector } from './MethodSelector';
import { UrlInput } from './UrlInput';
import { HeadersEditor } from './HeadersEditor';
import { BodyEditor } from './BodyEditor';
import { useRequest } from '@/hooks/useRequest';
import { useStore } from '@/store';
import { cn } from '@/lib/utils';
import { safeParseBody } from '@/lib/json-utils';
import { SlidersHorizontal, Code2 } from 'lucide-react';

type Tab = 'headers' | 'body';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'headers', label: 'Headers', icon: SlidersHorizontal },
  { id: 'body',    label: 'Body',    icon: Code2 },
];

export function RequestBuilder() {
  const [activeTab, setActiveTab] = useState<Tab>('headers');
  const method  = useStore((s) => s.method);
  const url     = useStore((s) => s.url);
  const headers = useStore((s) => s.headers);
  const body    = useStore((s) => s.body);
  const isSending = useStore((s) => s.isSending);
  const requestMutation = useRequest();

  const handleSend = () => {
    const enabledHeaders: Record<string, string> = {};
    headers.filter((h) => h.enabled && h.key).forEach((h) => {
      enabledHeaders[h.key] = h.value;
    });

    let parsedBody: unknown = undefined;
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      parsedBody = safeParseBody(body);
    }

    let finalUrl = url.trim();
    if (finalUrl && !/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    requestMutation.mutate({ method, url: finalUrl, headers: enabledHeaders, body: parsedBody });
  };

  const enabledHeaderCount = headers.filter((h) => h.enabled && h.key).length;

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Panel Header */}
      <div
        className="px-4 pt-4 pb-3 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Method selector */}
        <MethodSelector />

        {/* URL + Send */}
        <div className="mt-3">
          <UrlInput onSend={handleSend} isLoading={isSending} />
        </div>
      </div>

      {/* Tab Bar */}
      <div
        className="flex items-center px-4 gap-0.5 shrink-0 h-10"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium transition-all duration-200',
                isActive
                  ? 'text-text-primary'
                  : 'text-text-tertiary hover:text-text-secondary hover:bg-white/[0.04]',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="req-tab-bg"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon size={12} className={cn('relative z-10', isActive ? 'text-accent' : '')} />
              <span className="relative z-10">{tab.label}</span>
              {tab.id === 'headers' && enabledHeaderCount > 0 && (
                <span
                  className="relative z-10 ml-0.5 px-1.5 py-0.5 text-2xs rounded-md font-mono"
                  style={{
                    background: isActive ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)',
                    color: isActive ? '#818cf8' : '#555770',
                  }}
                >
                  {enabledHeaderCount}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="req-tab-line"
                  className="absolute bottom-0 left-3 right-3 h-px rounded-full"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            {activeTab === 'headers' ? <HeadersEditor /> : <BodyEditor />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
