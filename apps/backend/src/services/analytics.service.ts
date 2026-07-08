import {
  AnalyticsData,
  TimeSeriesPoint,
  EndpointStats,
  LatencyPercentiles,
} from '@apiforge/shared';
import { historyRepository } from '../repositories/history.repository';

type HistoryRow = {
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  isSuccess: boolean;
  createdAt: Date;
};

function computePercentiles(sortedValues: number[]): LatencyPercentiles {
  const at = (pct: number) => {
    if (sortedValues.length === 0) return 0;
    const idx = Math.ceil((pct / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, idx)];
  };
  return { p50: at(50), p75: at(75), p90: at(90), p95: at(95), p99: at(99) };
}

function bucketByHour(rows: HistoryRow[], from: Date, to: Date): TimeSeriesPoint[] {
  const buckets = new Map<string, number>();
  // Initialize all hours
  const cursor = new Date(from);
  while (cursor <= to) {
    const key = cursor.toISOString().substring(0, 13) + ':00:00.000Z';
    buckets.set(key, 0);
    cursor.setHours(cursor.getHours() + 1);
  }
  // Fill data
  for (const row of rows) {
    const key = row.createdAt.toISOString().substring(0, 13) + ':00:00.000Z';
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return Array.from(buckets.entries()).map(([timestamp, value]) => ({ timestamp, value }));
}

function bucketLatencyByHour(rows: HistoryRow[], from: Date, to: Date): TimeSeriesPoint[] {
  const buckets = new Map<string, number[]>();
  const cursor = new Date(from);
  while (cursor <= to) {
    const key = cursor.toISOString().substring(0, 13) + ':00:00.000Z';
    buckets.set(key, []);
    cursor.setHours(cursor.getHours() + 1);
  }
  for (const row of rows) {
    const key = row.createdAt.toISOString().substring(0, 13) + ':00:00.000Z';
    const arr = buckets.get(key) ?? [];
    arr.push(row.responseTime);
    buckets.set(key, arr);
  }
  return Array.from(buckets.entries()).map(([timestamp, times]) => ({
    timestamp,
    value: times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0,
  }));
}

function computeTopEndpoints(rows: HistoryRow[]): EndpointStats[] {
  const map = new Map<
    string,
    { total: number; success: number; totalTime: number; lastCalled: Date }
  >();

  for (const row of rows) {
    // Normalize URL by stripping query params for grouping
    let endpoint: string;
    try {
      const u = new URL(row.url);
      endpoint = `${u.hostname}${u.pathname}`;
    } catch {
      endpoint = row.url;
    }

    const existing = map.get(endpoint) ?? {
      total: 0,
      success: 0,
      totalTime: 0,
      lastCalled: row.createdAt,
    };

    existing.total++;
    if (row.isSuccess) existing.success++;
    existing.totalTime += row.responseTime;
    if (row.createdAt > existing.lastCalled) existing.lastCalled = row.createdAt;
    map.set(endpoint, existing);
  }

  return Array.from(map.entries())
    .map(([url, stats]) => ({
      url,
      totalRequests: stats.total,
      successRate: stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0,
      averageResponseTime: stats.total > 0 ? Math.round(stats.totalTime / stats.total) : 0,
      lastCalled: stats.lastCalled.toISOString(),
    }))
    .sort((a, b) => b.totalRequests - a.totalRequests)
    .slice(0, 10);
}

export async function getAnalytics(from: Date, to: Date): Promise<AnalyticsData> {
  const rows = await historyRepository.findAllForAnalytics(from, to);

  const totalRequests = rows.length;
  const successCount = rows.filter((r) => r.isSuccess).length;
  const failureCount = totalRequests - successCount;

  const sortedTimes = [...rows.map((r) => r.responseTime)].sort((a, b) => a - b);
  const averageResponseTime =
    totalRequests > 0 ? Math.round(sortedTimes.reduce((a, b) => a + b, 0) / totalRequests) : 0;

  const successRate = totalRequests > 0 ? Math.round((successCount / totalRequests) * 100) : 0;

  const requestsByMethod: Record<string, number> = {};
  for (const row of rows) {
    requestsByMethod[row.method] = (requestsByMethod[row.method] ?? 0) + 1;
  }

  return {
    totalRequests,
    successCount,
    failureCount,
    averageResponseTime,
    successRate,
    requestsByMethod,
    requestsOverTime: bucketByHour(rows, from, to),
    latencyOverTime: bucketLatencyByHour(rows, from, to),
    topEndpoints: computeTopEndpoints(rows),
    latencyPercentiles: computePercentiles(sortedTimes),
    period: { from: from.toISOString(), to: to.toISOString() },
  };
}
