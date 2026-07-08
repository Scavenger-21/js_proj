'use client';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, Lock, Unlock, Key, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SecurityInsights, SecurityInsight, SecuritySeverity } from '@apiforge/shared';

interface SecurityPanelProps {
  security: SecurityInsights;
}

const SEVERITY_CONFIG: Record<SecuritySeverity, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  critical: { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/25', icon: ShieldAlert },
  warning: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/25', icon: AlertTriangle },
  info: { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/25', icon: Shield },
};

function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const gradeColor = score >= 90 ? '#22c55e' : score >= 75 ? '#34d399' : score >= 60 ? '#f59e0b' : score >= 45 ? '#f97316' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#27272a" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={gradeColor} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-text-primary" style={{ color: gradeColor }}>{grade}</span>
          <span className="text-xs text-text-tertiary font-mono">{score}</span>
        </div>
      </div>
      <span className="text-xs text-text-secondary">Security Score</span>
    </div>
  );
}

function InsightCard({ insight }: { insight: SecurityInsight }) {
  const config = SEVERITY_CONFIG[insight.severity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('p-3 rounded-lg border', config.bg, config.border)}
    >
      <div className="flex items-start gap-3">
        <Icon size={14} className={cn('shrink-0 mt-0.5', config.color)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-text-primary">{insight.title}</span>
            <span className={cn('text-2xs px-1.5 py-0.5 rounded-sm border font-mono uppercase', config.color, config.bg, config.border)}>
              {insight.severity}
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed mb-2">{insight.description}</p>
          {insight.affectedValue && (
            <code className="block px-2 py-1 text-xs font-mono text-text-tertiary bg-bg-base rounded border border-border/50 mb-2 truncate">
              {insight.affectedValue}
            </code>
          )}
          <div className="flex items-start gap-1.5">
            <CheckCircle2 size={11} className="text-green-400 shrink-0 mt-0.5" />
            <span className="text-xs text-text-secondary">{insight.recommendation}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function SecurityPanel({ security }: SecurityPanelProps) {
  const hasIssues = security.allInsights.length > 0;

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
      {/* Score Overview */}
      <div className="flex items-center gap-6 p-4 bg-bg-elevated rounded-lg border border-border">
        <ScoreRing score={security.score} grade={security.grade} />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            {security.score >= 90 ? 'Excellent Security' :
             security.score >= 75 ? 'Good Security' :
             security.score >= 60 ? 'Fair Security' :
             security.score >= 45 ? 'Poor Security' : 'Critical Issues'}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed mb-3">
            {hasIssues
              ? `${security.allInsights.length} security issue${security.allInsights.length > 1 ? 's' : ''} detected in this request.`
              : 'No security issues detected. This request follows best practices.'}
          </p>
          <div className="flex items-center gap-2">
            {security.insecureProtocol && (
              <span className="flex items-center gap-1 text-2xs px-1.5 py-0.5 bg-red-400/10 text-red-400 border border-red-400/20 rounded-sm">
                <Unlock size={9} /> HTTP
              </span>
            )}
            {security.tokenExposure && (
              <span className="flex items-center gap-1 text-2xs px-1.5 py-0.5 bg-red-400/10 text-red-400 border border-red-400/20 rounded-sm">
                <Key size={9} /> Token Exposed
              </span>
            )}
            {security.missingAuth && (
              <span className="flex items-center gap-1 text-2xs px-1.5 py-0.5 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-sm">
                <Shield size={9} /> No Auth
              </span>
            )}
            {!hasIssues && (
              <span className="flex items-center gap-1 text-2xs px-1.5 py-0.5 bg-green-400/10 text-green-400 border border-green-400/20 rounded-sm">
                <ShieldCheck size={9} /> All Clear
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      {security.allInsights.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Detected Issues</span>
          <div className="mt-2 space-y-2">
            {security.allInsights.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {security.recommendations.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Recommendations</span>
          <div className="mt-2 space-y-1.5">
            {security.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-bg-elevated rounded border border-border">
                <CheckCircle2 size={11} className="text-green-400 shrink-0 mt-0.5" />
                <span className="text-xs text-text-secondary">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
