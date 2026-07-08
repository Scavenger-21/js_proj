'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  index?: number;
}

export function MetricCard({
  title, value, subtitle, trend, trendValue,
  icon: Icon, iconColor = 'text-accent', iconBg = 'bg-accent/10', index = 0,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 300, damping: 28 }}
      className="flex flex-col gap-3 p-4 bg-bg-elevated rounded-xl border border-border hover:border-border-strong transition-all duration-200 group"
    >
      <div className="flex items-start justify-between">
        <div className={cn('flex items-center justify-center w-8 h-8 rounded-lg border', iconBg,
          iconBg.includes('accent') ? 'border-accent/20' :
          iconBg.includes('green') ? 'border-green-400/20' :
          iconBg.includes('red') ? 'border-red-400/20' :
          iconBg.includes('amber') ? 'border-amber-400/20' : 'border-border',
        )}>
          <Icon size={15} className={iconColor} />
        </div>
        {trend && trendValue && (
          <div className={cn(
            'flex items-center gap-1 text-2xs font-medium px-1.5 py-0.5 rounded-sm',
            trend === 'up' ? 'text-green-400 bg-green-400/10' :
            trend === 'down' ? 'text-red-400 bg-red-400/10' :
            'text-text-tertiary bg-bg-subtle',
          )}>
            {trend === 'up' ? <TrendingUp size={9} /> : trend === 'down' ? <TrendingDown size={9} /> : <Minus size={9} />}
            {trendValue}
          </div>
        )}
      </div>

      <div>
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.07 + 0.15 }}
          className="text-2xl font-bold text-text-primary font-mono tracking-tight"
        >
          {value}
        </motion.div>
        <div className="text-xs text-text-secondary mt-0.5">{title}</div>
        {subtitle && <div className="text-2xs text-text-disabled mt-0.5">{subtitle}</div>}
      </div>
    </motion.div>
  );
}
