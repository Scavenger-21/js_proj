import { SecurityInsights, SecurityInsight, SecuritySeverity } from '@apiforge/shared';

// ─── Pattern Detectors ───────────────────────────────────────────────────────

const TOKEN_PATTERNS = [
  { pattern: /[?&](api[_-]?key|apikey)=([^&]+)/i, name: 'API Key' },
  { pattern: /[?&](access[_-]?token|token)=([^&]+)/i, name: 'Access Token' },
  { pattern: /[?&](secret|secret[_-]?key)=([^&]+)/i, name: 'Secret Key' },
  { pattern: /[?&](password|passwd|pwd)=([^&]+)/i, name: 'Password' },
  { pattern: /[?&](auth|authorization)=([^&]+)/i, name: 'Authorization Token' },
];

const SUSPICIOUS_HEADER_NAMES = [
  'x-internal-secret',
  'x-master-key',
  'x-admin-key',
  'x-bypass-auth',
  'x-debug-mode',
  'x-override-auth',
];

function detectInsecureProtocol(url: string): SecurityInsight | null {
  if (url.startsWith('http://')) {
    return {
      type: 'INSECURE_PROTOCOL',
      title: 'Insecure HTTP Protocol',
      description:
        'This request uses HTTP instead of HTTPS. Data transmitted over HTTP is not encrypted and can be intercepted by network attackers (man-in-the-middle attacks).',
      severity: 'critical' as SecuritySeverity,
      recommendation: 'Switch to HTTPS to encrypt data in transit.',
      affectedValue: url.replace(/^http:\/\//, 'https://'),
    };
  }
  return null;
}

function detectTokenExposure(url: string): SecurityInsight | null {
  for (const { pattern, name } of TOKEN_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      const exposedValue = match[2];
      const masked = exposedValue.substring(0, 4) + '****' + exposedValue.slice(-4);
      return {
        type: 'TOKEN_EXPOSURE',
        title: `${name} Exposed in URL`,
        description: `A ${name} (${masked}) was detected as a query parameter in the URL. URLs are logged in server access logs, browser history, and Referer headers — this can expose credentials.`,
        severity: 'critical' as SecuritySeverity,
        recommendation: `Move the ${name} to an Authorization or X-API-Key header instead of the URL query string.`,
        affectedValue: masked,
      };
    }
  }
  return null;
}

function detectMissingAuth(headers: Record<string, string>): SecurityInsight | null {
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  const hasAuth =
    'authorization' in lower ||
    'x-api-key' in lower ||
    'x-auth-token' in lower ||
    'cookie' in lower ||
    'api-key' in lower;

  if (!hasAuth) {
    return {
      type: 'MISSING_AUTH',
      title: 'No Authentication Header',
      description:
        'This request does not include any authentication headers. If this endpoint requires authentication, the request may fail with 401 or expose a security vulnerability by succeeding without credentials.',
      severity: 'warning' as SecuritySeverity,
      recommendation:
        'Add an Authorization header (e.g., Bearer token or API key) to authenticate the request.',
    };
  }
  return null;
}

function detectSuspiciousHeaders(headers: Record<string, string>): SecurityInsight[] {
  const insights: SecurityInsight[] = [];
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));

  for (const suspicious of SUSPICIOUS_HEADER_NAMES) {
    if (suspicious in lower) {
      insights.push({
        type: 'SUSPICIOUS_HEADER',
        title: `Suspicious Header: ${suspicious}`,
        description: `The header "${suspicious}" has a name pattern associated with debugging or internal bypass mechanisms. Sending such headers to external APIs may indicate a configuration error.`,
        severity: 'warning' as SecuritySeverity,
        recommendation: `Review why "${suspicious}" is being sent. Remove it unless explicitly required by the API.`,
        affectedValue: suspicious,
      });
    }
  }

  // Detect JWT tokens in Authorization for format analysis
  const authValue = lower['authorization'] ?? '';
  if (authValue.startsWith('Bearer ')) {
    const token = authValue.slice(7);
    const parts = token.split('.');
    if (parts.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        const exp = payload['exp'];
        if (exp && typeof exp === 'number') {
          const expiresAt = new Date(exp * 1000);
          if (expiresAt < new Date()) {
            insights.push({
              type: 'EXPIRED_JWT',
              title: 'JWT Token Is Expired',
              description: `The Bearer JWT token expired on ${expiresAt.toLocaleString()}. The server will reject this request with 401.`,
              severity: 'critical' as SecuritySeverity,
              recommendation: 'Obtain a new JWT token and update the Authorization header.',
              affectedValue: `Expired: ${expiresAt.toISOString()}`,
            });
          }
        }
      } catch {
        // Not a valid JWT — skip
      }
    }
  }

  return insights;
}

function computeSecurityScore(
  insecureProtocol: SecurityInsight | null,
  tokenExposure: SecurityInsight | null,
  missingAuth: SecurityInsight | null,
  suspiciousHeaders: SecurityInsight[],
): number {
  let score = 100;

  if (insecureProtocol) score -= 30;
  if (tokenExposure) score -= 35;
  if (missingAuth) score -= 10;

  for (const h of suspiciousHeaders) {
    if (h.severity === 'critical') score -= 20;
    else if (h.severity === 'warning') score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

function getGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

// ─── Main Security Analysis ───────────────────────────────────────────────────

export function analyzeRequestSecurity(
  url: string,
  headers: Record<string, string>,
): SecurityInsights {
  const insecureProtocol = detectInsecureProtocol(url);
  const tokenExposure = detectTokenExposure(url);
  const missingAuth = detectMissingAuth(headers);
  const suspiciousHeaders = detectSuspiciousHeaders(headers);

  const allInsights: SecurityInsight[] = [
    ...(insecureProtocol ? [insecureProtocol] : []),
    ...(tokenExposure ? [tokenExposure] : []),
    ...(missingAuth ? [missingAuth] : []),
    ...suspiciousHeaders,
  ];

  const score = computeSecurityScore(insecureProtocol, tokenExposure, missingAuth, suspiciousHeaders);
  const grade = getGrade(score);

  const recommendations = allInsights.map((i) => i.recommendation);

  return {
    score,
    grade,
    insecureProtocol,
    missingAuth,
    tokenExposure,
    suspiciousHeaders,
    allInsights,
    recommendations,
  };
}
