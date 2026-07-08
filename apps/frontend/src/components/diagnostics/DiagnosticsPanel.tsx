'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, ShieldAlert, Server, Clock, Wifi,
  ChevronRight, Lightbulb, Target, Zap, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDiagnostics } from '@/hooks/useDiagnostics';
import { DiagnosticsResult, DiagnosticsCategory } from '@apiforge/shared';

interface DiagnosticsPanelProps {
  statusCode: number;
  url: string;
  method: string;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  responseBody: unknown;
  responseTime: number;
}

const CATEGORY_CONFIG: Record<DiagnosticsCategory, { icon: React.ElementType; color: string; bg: string }> = {
  AUTH_ERROR: { icon: ShieldAlert, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
  AUTHORIZATION_ERROR: { icon: ShieldAlert, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
  NOT_FOUND: { icon: Target, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
  RATE_LIMITED: { icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  CLIENT_ERROR: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
  SERVER_ERROR: { icon: Server, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  GATEWAY_ERROR: { icon: Wifi, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  SERVICE_UNAVAILABLE: { icon: Server, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  NETWORK_ERROR: { icon: Wifi, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  TIMEOUT: { icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
};

function ConfidenceBar({ confidence }: { confidence: number }) {
  const color = confidence >= 80 ? 'bg-green-400' : confidence >= 60 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-bg-subtle rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          className={cn('h-full rounded-full', color)}
        />
      </div>
      <span className="text-xs font-mono text-text-secondary w-10 text-right">{confidence}%</span>
    </div>
  );
}

function DiagnosticsContent({ result }: { result: DiagnosticsResult }) {
  const config = CATEGORY_CONFIG[result.category] ?? CATEGORY_CONFIG.CLIENT_ERROR;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col gap-4 p-4 overflow-y-auto h-full"
    >
      {/* Header */}
      <div className={cn('flex items-start gap-3 p-3 rounded-lg border', config.bg)}>
        <div className={cn('flex items-center justify-center w-8 h-8 rounded-md bg-bg-base/50 shrink-0', config.bg)}>
          <Icon size={15} className={config.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs font-semibold font-mono uppercase tracking-wider', config.color)}>
              {result.category.replace('_', ' ')}
            </span>
            <span className="text-xs text-text-disabled">HTTP {result.errorCode}</span>
          </div>
          <h3 className="text-sm font-semibold text-text-primary">{result.title}</h3>
          <p className="text-xs text-text-secondary mt-1 leading-relaxed">{result.summary}</p>
        </div>
      </div>

      {/* Confidence */}
      <div className="p-3 bg-bg-elevated rounded-lg border border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-text-secondary">Diagnostic Confidence</span>
          <span className="text-xs text-text-tertiary">{result.confidence >= 80 ? 'High' : result.confidence >= 60 ? 'Medium' : 'Low'}</span>
        </div>
        <ConfidenceBar confidence={result.confidence} />
      </div>

      {/* Likely Causes */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={13} className="text-text-tertiary" />
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Likely Causes</span>
        </div>
        <div className="space-y-2">
          {result.causes.map((cause, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3 p-3 bg-bg-elevated rounded-lg border border-border"
            >
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 shrink-0 mt-0.5">
                <span className="text-2xs font-bold">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-medium text-text-primary">{cause.title}</span>
                  <span className="text-2xs text-text-tertiary font-mono shrink-0">{cause.probability}%</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{cause.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Suggested Fixes */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={13} className="text-text-tertiary" />
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Suggested Fixes</span>
        </div>
        <div className="space-y-2">
          {result.fixes.map((fix, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="p-3 bg-bg-elevated rounded-lg border border-border"
            >
              <div className="flex items-center gap-2 mb-1">
                <ChevronRight size={11} className="text-green-400 shrink-0" />
                <span className="text-xs font-medium text-text-primary">{fix.title}</span>
                <span className={cn(
                  'ml-auto text-2xs px-1.5 py-0.5 rounded-sm border font-mono',
                  fix.priority === 'high' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                  fix.priority === 'medium' ? 'text-amber-400 bg-amber-400/10 border-amber-400/20' :
                  'text-text-tertiary bg-bg-subtle border-border',
                )}>
                  {fix.priority}
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{fix.description}</p>
              {fix.code && (
                <code className="block mt-2 px-2 py-1 text-xs font-mono bg-bg-base text-green-400 rounded border border-border/50">
                  {fix.code}
                </code>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function DiagnosticsPanel(props: DiagnosticsPanelProps) {
  const { mutate, data, isPending, error } = useDiagnostics();

  useEffect(() => {
    if (props.statusCode >= 400) {
      mutate({
        statusCode: props.statusCode,
        url: props.url,
        method: props.method as any,
        requestHeaders: props.requestHeaders,
        responseHeaders: props.responseHeaders,
        responseBody: props.responseBody,
        responseTime: props.responseTime,
      });
    }
  }, [props.statusCode, props.url]);

  if (props.statusCode < 400) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-text-disabled">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-400/10 border border-green-400/20">
          <Zap size={18} className="text-green-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-text-secondary">Request Successful</p>
          <p className="text-xs mt-1">No diagnostics needed for {props.statusCode} responses.</p>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-text-disabled">
        <Loader2 size={20} className="animate-spin text-accent" />
        <span className="text-xs text-text-secondary">Analyzing error…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-text-disabled">
        <AlertTriangle size={18} />
        <span className="text-xs">Failed to run diagnostics</span>
      </div>
    );
  }

  return <DiagnosticsContent result={data} />;
}
