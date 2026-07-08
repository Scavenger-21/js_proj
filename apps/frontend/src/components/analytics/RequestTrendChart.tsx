'use client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { TimeSeriesPoint } from '@apiforge/shared';
import { format } from 'date-fns';

interface RequestTrendChartProps {
  data: TimeSeriesPoint[];
  title: string;
}

function formatLabel(timestamp: string): string {
  try {
    return format(new Date(timestamp), 'HH:mm');
  } catch {
    return timestamp;
  }
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-overlay border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-text-tertiary mb-1 font-mono">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-semibold text-text-primary">
          {p.value} {p.name}
        </p>
      ))}
    </div>
  );
}

export function RequestTrendChart({ data, title }: RequestTrendChartProps) {
  const chartData = data.map((d) => ({
    time: formatLabel(d.timestamp),
    requests: d.value,
  }));

  return (
    <div className="flex flex-col gap-3 p-4 bg-bg-elevated rounded-xl border border-border">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <p className="text-xs text-text-tertiary mt-0.5">Requests over time</p>
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="requestGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#71717a', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="requests"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#requestGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#6366f1', stroke: '#18181b', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
