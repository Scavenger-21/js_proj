import { HealthScore, HealthRating, HealthBreakdown } from '@apiforge/shared';
import { historyRepository } from '../repositories/history.repository';

// ─── Scoring Algorithms ───────────────────────────────────────────────────────

function scoreSuccessRate(rate: number): number {
  if (rate >= 99) return 100;
  if (rate >= 95) return 90;
  if (rate >= 90) return 75;
  if (rate >= 80) return 55;
  if (rate >= 70) return 35;
  return Math.max(0, rate * 0.3);
}

function scoreLatency(avgMs: number): number {
  if (avgMs <= 100) return 100;
  if (avgMs <= 300) return 90;
  if (avgMs <= 600) return 75;
  if (avgMs <= 1000) return 55;
  if (avgMs <= 2000) return 35;
  if (avgMs <= 5000) return 15;
  return 5;
}

function scoreReliability(totalRequests: number, consecutiveFailures: number): number {
  if (totalRequests === 0) return 50;
  const failureStreak = consecutiveFailures / Math.max(1, totalRequests);
  return Math.max(0, 100 - failureStreak * 200);
}

function scoreFailureFrequency(failureRate: number): number {
  if (failureRate === 0) return 100;
  if (failureRate <= 1) return 90;
  if (failureRate <= 5) return 70;
  if (failureRate <= 10) return 45;
  if (failureRate <= 25) return 20;
  return 5;
}

function getRating(score: number): HealthRating {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 55) return 'fair';
  if (score >= 30) return 'poor';
  return 'critical';
}

function buildExplanation(rating: HealthRating, score: number, breakdown: HealthBreakdown): string {
  const explanations: Record<HealthRating, string> = {
    excellent: `This endpoint is performing excellently with a health score of ${score}/100. Success rates, latency, and reliability are all within ideal thresholds.`,
    good: `This endpoint is performing well (${score}/100). Minor optimizations could improve performance further, but overall reliability is solid.`,
    fair: `This endpoint shows some issues (${score}/100). ${
      breakdown.latencyScore < 60
        ? 'Response latency is higher than recommended. '
        : ''
    }${breakdown.successRateScore < 60 ? 'Success rate is below acceptable thresholds. ' : ''}Review recent failures.`,
    poor: `This endpoint has significant problems (${score}/100). ${
      breakdown.successRateScore < 40 ? 'The success rate is critically low. ' : ''
    }Immediate investigation is recommended.`,
    critical: `This endpoint is in a critical state (${score}/100). It is failing frequently and/or showing extreme latency. Treat this as a production incident.`,
  };
  return explanations[rating];
}

// ─── Main Health Scoring ──────────────────────────────────────────────────────

export async function computeHealthScores(endpointFilter?: string): Promise<HealthScore[]> {
  // Fetch last 24 hours of data
  const from = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const to = new Date();
  const rows = await historyRepository.findAllForAnalytics(from, to);

  // Filter if specific endpoint requested
  const filtered = endpointFilter
    ? rows.filter((r) => r.url.includes(endpointFilter))
    : rows;

  // Group by normalized endpoint
  const endpoints = new Map<
    string,
    Array<{ isSuccess: boolean; responseTime: number; createdAt: Date }>
  >();

  for (const row of filtered) {
    let key: string;
    try {
      const u = new URL(row.url);
      key = `${u.protocol}//${u.hostname}${u.pathname}`;
    } catch {
      key = row.url;
    }
    const arr = endpoints.get(key) ?? [];
    arr.push({ isSuccess: row.isSuccess, responseTime: row.responseTime, createdAt: row.createdAt });
    endpoints.set(key, arr);
  }

  const scores: HealthScore[] = [];

  for (const [endpoint, data] of endpoints.entries()) {
    const total = data.length;
    const successCount = data.filter((d) => d.isSuccess).length;
    const successRate = total > 0 ? (successCount / total) * 100 : 0;
    const avgLatency =
      total > 0 ? data.reduce((sum, d) => sum + d.responseTime, 0) / total : 0;

    // Count consecutive failures (from most recent)
    const sorted = [...data].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    let consecutiveFailures = 0;
    for (const d of sorted) {
      if (!d.isSuccess) consecutiveFailures++;
      else break;
    }

    const failureRate = 100 - successRate;

    const breakdown: HealthBreakdown = {
      successRateScore: Math.round(scoreSuccessRate(successRate)),
      latencyScore: Math.round(scoreLatency(avgLatency)),
      reliabilityScore: Math.round(scoreReliability(total, consecutiveFailures)),
      failureFrequencyScore: Math.round(scoreFailureFrequency(failureRate)),
    };

    // Weighted average: success rate most important
    const score = Math.round(
      breakdown.successRateScore * 0.35 +
        breakdown.latencyScore * 0.25 +
        breakdown.reliabilityScore * 0.25 +
        breakdown.failureFrequencyScore * 0.15,
    );

    const rating = getRating(score);

    scores.push({
      endpoint,
      score,
      rating,
      explanation: buildExplanation(rating, score, breakdown),
      breakdown,
      totalRequests: total,
      lastChecked: new Date().toISOString(),
    });
  }

  return scores.sort((a, b) => a.score - b.score);
}
