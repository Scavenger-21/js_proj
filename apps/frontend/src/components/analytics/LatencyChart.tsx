'use client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { TimeSeriesPoint } from '@apiforge/shared';
import { formatDuration } from '@/lib/utils';
import { format } from 'date-fns';

interface LatencyChartProps {
  data: TimeSeriesPoint[];
  averageLatency: number;
}

function formatLabel(ts: string): string {
  try { return format(new Date(ts), 'HH:mm'); } catch { return ts; }
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const ms = payload[0].value;
  return (
    <div className="bg-bg-overlay border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-text-tertiary mb-1 font-mono">{label}</p>
      <p className={`text-xs font-semibold ${ms > 1000 ? 'text-red-400' : ms > 400 ? 'text-amber-400' : 'text-green-400'}`}>
        {formatDuration(ms)}
      </p>
    </div>
  );
}

export function LatencyChart({ data, averageLatency }: LatencyChartProps) {
  const chartData = data.map((d) => ({
    time: formatLabel(d.timestamp),
    latency: d.value,
  }));

  return (
    <div className="flex flex-col gap-3 p-4 bg-bg-elevated rounded-xl border border-border">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Response Latency</h3>
          <p className="text-xs text-text-tertiary mt-0.5">Average response time over time</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-text-tertiary">Average</span>
          <div className={`text-sm font-bold font-mono ${averageLatency > 1000 ? 'text-red-400' : averageLatency > 400 ? 'text-amber-400' : 'text-green-400'}`}>
            {formatDuration(averageLatency)}
          </div>
        </div>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={false} tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#71717a', fontSize: 10 }}
              axisLine={false} tickLine={false}
              tickFormatter={(v: number) => `${v}ms`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={averageLatency}
              stroke="#6366f1"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            <Line
              type="monotone"
              dataKey="latency"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#22c55e', stroke: '#18181b', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
