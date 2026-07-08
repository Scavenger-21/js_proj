'use client';
import { motion } from 'framer-motion';
import { HealthScore, HealthRating } from '@apiforge/shared';
import { cn, getHealthRatingColor, getHealthScoreColor } from '@/lib/utils';
import { Activity, Clock, ShieldCheck, BarChart2 } from 'lucide-react';

interface HealthScoreCardProps {
  health: HealthScore;
  index: number;
}

const RATING_LABELS: Record<HealthRating, string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
  critical: 'Critical',
};

function ScoreGauge({ score }: { score: number }) {
  const color = getHealthScoreColor(score);
  const size = 64;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // Half circle
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-end justify-center" style={{ width: size, height: size / 2 + 8 }}>
      <svg width={size} height={size / 2 + strokeWidth} viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}>
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none" stroke="#27272a" strokeWidth={strokeWidth} strokeLinecap="round"
        />
        <motion.path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute bottom-0 inset-x-0 flex flex-col items-center">
        <span className="text-lg font-bold font-mono" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

function BreakdownBar({ label, score, icon: Icon }: { label: string; score: number; icon: React.ElementType }) {
  const color = score >= 75 ? 'bg-green-400' : score >= 50 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <Icon size={11} className="text-text-tertiary shrink-0" />
      <span className="text-2xs text-text-secondary w-24 shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-bg-subtle rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.4 }}
          className={cn('h-full rounded-full', color)}
        />
      </div>
      <span className="text-2xs font-mono text-text-tertiary w-8 text-right">{score}</span>
    </div>
  );
}

export function HealthScoreCard({ health, index }: HealthScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 300, damping: 28 }}
      className="flex flex-col gap-4 p-4 bg-bg-elevated rounded-xl border border-border hover:border-border-strong transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-sm border font-mono',
              health.rating === 'excellent' ? 'text-green-400 bg-green-400/10 border-green-400/20' :
              health.rating === 'good' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
              health.rating === 'fair' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
              health.rating === 'poor' ? 'text-orange-400 bg-orange-400/10 border-orange-400/20' :
              'text-red-400 bg-red-400/10 border-red-400/20',
            )}>
              {RATING_LABELS[health.rating]}
            </span>
          </div>
          <p className="text-xs font-mono text-text-primary truncate">{health.endpoint}</p>
          <p className="text-2xs text-text-tertiary mt-1">{health.totalRequests.toLocaleString()} requests</p>
        </div>
        <ScoreGauge score={health.score} />
      </div>

      {/* Explanation */}
      <p className="text-xs text-text-secondary leading-relaxed border-t border-border pt-3">
        {health.explanation}
      </p>

      {/* Breakdown */}
      <div className="space-y-2 border-t border-border pt-3">
        <span className="text-2xs text-text-disabled uppercase tracking-wider font-medium">Score Breakdown</span>
        <BreakdownBar label="Success Rate" score={health.breakdown.successRateScore} icon={ShieldCheck} />
        <BreakdownBar label="Latency" score={health.breakdown.latencyScore} icon={Clock} />
        <BreakdownBar label="Reliability" score={health.breakdown.reliabilityScore} icon={Activity} />
        <BreakdownBar label="Failure Freq." score={health.breakdown.failureFrequencyScore} icon={BarChart2} />
      </div>
    </motion.div>
  );
}
