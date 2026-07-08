'use client';
import { motion } from 'framer-motion';
import { Clock, HardDrive, CheckCircle2, XCircle, Zap } from 'lucide-react';
import { cn, formatBytes, formatDuration, getStatusBg } from '@/lib/utils';

interface ResponseMetaBarProps {
  statusCode: number;
  statusText: string;
  responseTime: number;
  responseSize: number;
}

function getStatusStyle(code: number) {
  if (code < 300) return {
    bg: 'rgba(74,222,128,0.1)',
    border: 'rgba(74,222,128,0.25)',
    text: '#4ade80',
    glow: '0 0 12px rgba(74,222,128,0.15)',
  };
  if (code < 400) return {
    bg: 'rgba(251,191,36,0.1)',
    border: 'rgba(251,191,36,0.25)',
    text: '#fbbf24',
    glow: '0 0 12px rgba(251,191,36,0.15)',
  };
  if (code < 500) return {
    bg: 'rgba(251,191,36,0.1)',
    border: 'rgba(251,191,36,0.25)',
    text: '#fbbf24',
    glow: '0 0 12px rgba(251,191,36,0.15)',
  };
  return {
    bg: 'rgba(248,113,113,0.1)',
    border: 'rgba(248,113,113,0.25)',
    text: '#f87171',
    glow: '0 0 12px rgba(248,113,113,0.15)',
  };
}

function getLatencyColor(ms: number) {
  if (ms < 300)  return '#4ade80';
  if (ms < 1000) return '#fbbf24';
  return '#f87171';
}

function getLatencyLabel(ms: number) {
  if (ms < 300)  return 'Fast';
  if (ms < 1000) return 'Moderate';
  return 'Slow';
}

export function ResponseMetaBar({ statusCode, statusText, responseTime, responseSize }: ResponseMetaBarProps) {
  const statusStyle = getStatusStyle(statusCode);
  const isSuccess   = statusCode < 400;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="flex items-center gap-3 px-4 py-2.5 shrink-0"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Status Code */}
      <motion.div
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono"
        style={{
          background: statusStyle.bg,
          border: `1px solid ${statusStyle.border}`,
          color: statusStyle.text,
          boxShadow: statusStyle.glow,
        }}
      >
        {isSuccess
          ? <CheckCircle2 size={11} />
          : <XCircle size={11} />
        }
        <span>{statusCode}</span>
        <span className="opacity-60 font-normal">{statusText}</span>
      </motion.div>

      {/* Divider */}
      <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

      {/* Response Time */}
      <div className="flex items-center gap-1.5 text-xs">
        <Clock size={11} className="text-text-tertiary" />
        <span className="font-mono font-medium" style={{ color: getLatencyColor(responseTime) }}>
          {formatDuration(responseTime)}
        </span>
      </div>

      {/* Divider */}
      <div className="h-4 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

      {/* Response Size */}
      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
        <HardDrive size={11} className="text-text-tertiary" />
        <span className="font-mono font-medium">{formatBytes(responseSize)}</span>
      </div>

      {/* Latency badge (right) */}
      <div className="ml-auto flex items-center gap-2">
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-2xs font-medium"
          style={{
            background: `${getLatencyColor(responseTime)}14`,
            border: `1px solid ${getLatencyColor(responseTime)}33`,
            color: getLatencyColor(responseTime),
          }}
        >
          <Zap size={10} />
          <span>{getLatencyLabel(responseTime)}</span>
        </div>
      </div>
    </motion.div>
  );
}
