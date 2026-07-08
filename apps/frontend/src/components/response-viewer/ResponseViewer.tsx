'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store';
import { ResponseMetaBar } from './ResponseMetaBar';
import { ResponseBody } from './ResponseBody';
import { ResponseHeaders } from './ResponseHeaders';
import { DiagnosticsPanel } from '@/components/diagnostics/DiagnosticsPanel';
import { SecurityPanel } from '@/components/security/SecurityPanel';
import { FileText, ListTree, Stethoscope, Shield } from 'lucide-react';

type Tab = 'body' | 'headers' | 'diagnostics' | 'security';

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: 'default' | 'error' | 'warning';
}

function EmptyState({ error }: { error?: string | null }) {
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full gap-5 px-8"
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="flex items-center justify-center w-14 h-14 rounded-2xl"
          style={{
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.2)',
            boxShadow: '0 0 24px rgba(248,113,113,0.12)',
          }}
        >
          <AlertCircle size={24} className="text-error" />
        </motion.div>
        <div className="text-center max-w-sm">
          <p className="text-sm font-semibold text-text-primary mb-2">Request Failed</p>
          <p className="text-xs text-text-secondary leading-relaxed">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col items-center justify-center h-full gap-6 px-8"
    >
      {/* Floating icon */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="relative"
      >
        <div
          className="flex items-center justify-center w-16 h-16 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))',
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 0 32px rgba(99,102,241,0.12)',
          }}
        >
          <Send size={24} className="text-accent" style={{ filter: 'drop-shadow(0 0 6px rgba(99,102,241,0.5))' }} />
        </div>

        {/* Orbiting dot */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-accent" />
        </motion.div>

        {/* Sparkles */}
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
          className="absolute -bottom-1 -left-2"
        >
          <Sparkles size={12} className="text-accent/50" />
        </motion.div>
      </motion.div>

      <div className="text-center">
        <p className="text-sm font-semibold text-text-primary mb-1.5">No Response Yet</p>
        <p className="text-xs text-text-secondary leading-relaxed max-w-[200px]">
          Build your request and hit Send to see the response here.
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-text-tertiary">
        <kbd
          className="px-2 py-0.5 rounded-md text-2xs font-mono"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Enter
        </kbd>
        <span>to send</span>
      </div>
    </motion.div>
  );
}

export function ResponseViewer() {
  const { response, error, activeTab, setActiveTab, method, url, headers } = useStore();

  const hasError = response && response.statusCode >= 400;
  const security = response?.security as any;

  const sentHeaders: Record<string, string> = {};
  headers.filter((h) => h.enabled && h.key).forEach((h) => { sentHeaders[h.key] = h.value; });

  const tabs: TabConfig[] = [
    { id: 'body',        label: 'Response',    icon: FileText },
    { id: 'headers',     label: 'Headers',     icon: ListTree,    badge: response ? String(Object.keys(response.headers).length) : undefined },
    { id: 'diagnostics', label: 'Diagnostics', icon: Stethoscope, badge: hasError ? '!' : undefined, badgeVariant: hasError ? 'error' : 'default' },
    { id: 'security',    label: 'Security',    icon: Shield,       badge: security?.score != null ? String(security.score) : undefined },
  ];

  if (!response && !error) {
    return (
      <div className="flex flex-col h-full" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <EmptyState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <EmptyState error={error} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full"
      style={{ background: 'rgba(255,255,255,0.01)' }}
    >
      {/* Meta bar */}
      <ResponseMetaBar
        statusCode={response!.statusCode}
        statusText={response!.statusText}
        responseTime={response!.responseTime}
        responseSize={response!.responseSize}
      />

      {/* Tabs */}
      <div
        className="flex items-center px-4 gap-0.5 shrink-0 h-10"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
      >
        {tabs.map((tab) => {
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
                  layoutId="res-tab-bg"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Icon size={12} className={cn('relative z-10 shrink-0', isActive ? 'text-accent' : '')} />
              <span className="relative z-10">{tab.label}</span>
              {tab.badge && (
                <span
                  className={cn('relative z-10 px-1.5 py-0.5 text-2xs rounded-md font-mono')}
                  style={
                    tab.badgeVariant === 'error'
                      ? { background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }
                      : { background: 'rgba(255,255,255,0.06)', color: '#555770', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                >
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="res-tab-line"
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
            transition={{ duration: 0.12 }}
            className="h-full"
          >
            {activeTab === 'body'        && <ResponseBody body={response!.body} />}
            {activeTab === 'headers'     && <ResponseHeaders headers={response!.headers} />}
            {activeTab === 'diagnostics' && (
              <DiagnosticsPanel
                statusCode={response!.statusCode}
                url={url}
                method={method}
                requestHeaders={sentHeaders}
                responseHeaders={response!.headers}
                responseBody={response!.body}
                responseTime={response!.responseTime}
              />
            )}
            {activeTab === 'security' && security && <SecurityPanel security={security} />}
            {activeTab === 'security' && !security && (
              <div className="flex items-center justify-center h-full text-text-tertiary text-xs">
                No security data available
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
