// ─── HTTP Methods ────────────────────────────────────────────────────────────

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// ─── Proxy Request / Response ────────────────────────────────────────────────

export interface ProxyRequest {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface ProxyResponse {
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
  responseTime: number;
  responseSize: number;
  historyId: string;
  isBinary?: boolean;
}

// ─── Request History ─────────────────────────────────────────────────────────

export interface RequestHistory {
  id: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body: unknown | null;
  statusCode: number;
  responseBody: unknown;
  responseHeaders: Record<string, string>;
  responseTime: number;
  responseSize: number;
  isSuccess: boolean;
  createdAt: string;
}

export interface HistoryListResponse {
  items: RequestHistory[];
  total: number;
  hasMore: boolean;
}

export interface HistoryQueryParams {
  limit?: number;
  offset?: number;
  method?: HttpMethod;
  search?: string;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface LatencyPercentiles {
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
}

export interface EndpointStats {
  url: string;
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  lastCalled: string;
}

export interface AnalyticsData {
  totalRequests: number;
  successCount: number;
  failureCount: number;
  averageResponseTime: number;
  successRate: number;
  requestsByMethod: Record<string, number>;
  requestsOverTime: TimeSeriesPoint[];
  latencyOverTime: TimeSeriesPoint[];
  topEndpoints: EndpointStats[];
  latencyPercentiles: LatencyPercentiles;
  period: {
    from: string;
    to: string;
  };
}

// ─── Diagnostics ─────────────────────────────────────────────────────────────

export type DiagnosticsCategory =
  | 'AUTH_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'CLIENT_ERROR'
  | 'SERVER_ERROR'
  | 'GATEWAY_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'NETWORK_ERROR'
  | 'TIMEOUT';

export type DiagnosticsSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface DiagnosticsCause {
  title: string;
  description: string;
  probability: number; // 0-100
}

export interface DiagnosticsFix {
  title: string;
  description: string;
  code?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DiagnosticsResult {
  errorCode: number;
  category: DiagnosticsCategory;
  title: string;
  summary: string;
  causes: DiagnosticsCause[];
  fixes: DiagnosticsFix[];
  confidence: number; // 0-100
  severity: DiagnosticsSeverity;
  learnMoreUrl?: string;
}

export interface DiagnosticsRequest {
  statusCode: number;
  url: string;
  method: HttpMethod;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  responseBody: unknown;
  responseTime: number;
}

// ─── Security Insights ───────────────────────────────────────────────────────

export type SecuritySeverity = 'info' | 'warning' | 'critical';

export interface SecurityInsight {
  type: string;
  title: string;
  description: string;
  severity: SecuritySeverity;
  recommendation: string;
  affectedValue?: string;
}

export interface SecurityInsights {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  insecureProtocol: SecurityInsight | null;
  missingAuth: SecurityInsight | null;
  tokenExposure: SecurityInsight | null;
  suspiciousHeaders: SecurityInsight[];
  allInsights: SecurityInsight[];
  recommendations: string[];
}

// ─── Endpoint Health ─────────────────────────────────────────────────────────

export type HealthRating = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface HealthBreakdown {
  successRateScore: number;
  latencyScore: number;
  reliabilityScore: number;
  failureFrequencyScore: number;
}

export interface HealthScore {
  endpoint: string;
  score: number; // 0-100
  rating: HealthRating;
  explanation: string;
  breakdown: HealthBreakdown;
  totalRequests: number;
  lastChecked: string;
}

// ─── API Error ───────────────────────────────────────────────────────────────

export interface APIErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    requestId?: string;
  };
}

// ─── Delete Response ─────────────────────────────────────────────────────────

export interface DeleteResponse {
  deleted: boolean | number;
  id?: string;
}
