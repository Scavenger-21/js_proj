import {
  DiagnosticsResult,
  DiagnosticsRequest,
  DiagnosticsCategory,
  DiagnosticsSeverity,
  DiagnosticsCause,
  DiagnosticsFix,
} from '@apiforge/shared';

// ─── Rule Definition ─────────────────────────────────────────────────────────

interface DiagnosticsRule {
  category: DiagnosticsCategory;
  severity: DiagnosticsSeverity;
  title: string;
  summary: (ctx: DiagnosticsRequest) => string;
  causes: (ctx: DiagnosticsRequest) => DiagnosticsCause[];
  fixes: (ctx: DiagnosticsRequest) => DiagnosticsFix[];
  confidence: (ctx: DiagnosticsRequest) => number;
}

// ─── Signal Detectors ────────────────────────────────────────────────────────

function hasAuthHeader(headers: Record<string, string>): boolean {
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  return 'authorization' in lower || 'x-api-key' in lower || 'cookie' in lower;
}

function hasTokenInUrl(url: string): boolean {
  return /[?&](token|api_key|apikey|access_token|secret|key)=/i.test(url);
}

function responseContains(body: unknown, ...terms: string[]): boolean {
  const str = typeof body === 'string' ? body : JSON.stringify(body ?? '');
  return terms.some((t) => str.toLowerCase().includes(t.toLowerCase()));
}

function isJsonError(body: unknown): string | null {
  if (typeof body === 'object' && body !== null) {
    const b = body as Record<string, unknown>;
    return (b['message'] ?? b['error'] ?? b['detail'] ?? null) as string | null;
  }
  return null;
}

// ─── Rules Map ───────────────────────────────────────────────────────────────

const RULES: Record<number, DiagnosticsRule> = {
  400: {
    category: 'CLIENT_ERROR',
    severity: 'medium',
    title: 'Bad Request',
    summary: (ctx) => {
      const msg = isJsonError(ctx.responseBody);
      return msg
        ? `Server rejected the request: "${msg}"`
        : `The server could not process the request to ${ctx.url} due to malformed syntax or invalid parameters.`;
    },
    causes: (ctx) => {
      const causes: DiagnosticsCause[] = [
        {
          title: 'Malformed request body',
          description: 'The request body is not valid JSON or has an incorrect structure.',
          probability: 70,
        },
        {
          title: 'Missing required fields',
          description: 'The API requires fields that were not included in the request.',
          probability: 60,
        },
        {
          title: 'Invalid parameter values',
          description: 'One or more parameters have invalid types or values.',
          probability: 50,
        },
      ];
      if (responseContains(ctx.responseBody, 'Content-Type')) {
        causes.unshift({
          title: 'Wrong Content-Type header',
          description: 'The server expected a different content type (e.g., application/json vs multipart/form-data).',
          probability: 80,
        });
      }
      return causes.sort((a, b) => b.probability - a.probability);
    },
    fixes: (_ctx) => [
      {
        title: 'Validate request body',
        description: 'Check that your request body is valid JSON and matches the API documentation.',
        priority: 'high',
      },
      {
        title: 'Check required fields',
        description: 'Review the API documentation to ensure all required fields are present.',
        priority: 'high',
      },
      {
        title: 'Set Content-Type header',
        description: 'Add Content-Type: application/json to your request headers.',
        code: 'Content-Type: application/json',
        priority: 'medium',
      },
    ],
    confidence: (ctx) => {
      let score = 75;
      if (isJsonError(ctx.responseBody)) score += 15;
      return Math.min(100, score);
    },
  },

  401: {
    category: 'AUTH_ERROR',
    severity: 'high',
    title: 'Unauthorized',
    summary: () =>
      'Authentication is required but was not provided or is invalid. The server cannot verify your identity.',
    causes: (ctx) => {
      const causes: DiagnosticsCause[] = [];
      if (!hasAuthHeader(ctx.requestHeaders)) {
        causes.push({
          title: 'No authentication credentials provided',
          description: 'The request was sent without an Authorization header, API key, or session cookie.',
          probability: 95,
        });
      } else {
        causes.push({
          title: 'Invalid or expired token',
          description: 'The provided credentials have expired or are invalid.',
          probability: 85,
        });
        causes.push({
          title: 'Wrong authentication scheme',
          description: 'The Authorization header format does not match what the server expects (e.g., Bearer vs Basic).',
          probability: 60,
        });
      }
      if (hasTokenInUrl(ctx.url)) {
        causes.push({
          title: 'Token in URL instead of header',
          description: 'The API key was passed as a URL query parameter; the server may require it in a header instead.',
          probability: 70,
        });
      }
      return causes.sort((a, b) => b.probability - a.probability);
    },
    fixes: (ctx) => {
      const fixes: DiagnosticsFix[] = [
        {
          title: 'Add Authorization header',
          description: 'Include your API key or Bearer token in the Authorization header.',
          code: 'Authorization: Bearer YOUR_TOKEN_HERE',
          priority: 'high',
        },
        {
          title: 'Verify token validity',
          description: 'Check that your token has not expired. Generate a new token if needed.',
          priority: 'high',
        },
      ];
      if (!hasAuthHeader(ctx.requestHeaders)) {
        fixes.unshift({
          title: 'Authentication credentials are missing',
          description: 'You must provide authentication credentials. Check the API documentation for the required format.',
          priority: 'high',
        });
      }
      return fixes;
    },
    confidence: (ctx) => {
      let score = 90;
      if (!hasAuthHeader(ctx.requestHeaders)) score = 98;
      return score;
    },
  },

  403: {
    category: 'AUTHORIZATION_ERROR',
    severity: 'high',
    title: 'Forbidden',
    summary: () =>
      'The server understood your request but refuses to authorize it. You are authenticated but lack the required permissions.',
    causes: (_ctx) => [
      {
        title: 'Insufficient permissions',
        description: 'Your account or API key does not have the permissions required for this operation.',
        probability: 85,
      },
      {
        title: 'IP address restriction',
        description: 'The API may only be accessible from specific IP addresses or ranges.',
        probability: 40,
      },
      {
        title: 'Resource ownership mismatch',
        description: 'You are trying to access a resource that belongs to another user or organization.',
        probability: 55,
      },
      {
        title: 'Account suspended or plan limitation',
        description: 'Your account may be suspended or the feature requires a higher plan tier.',
        probability: 30,
      },
    ],
    fixes: (_ctx) => [
      {
        title: 'Review required permissions',
        description: 'Check the API documentation to identify what permissions or roles are required for this endpoint.',
        priority: 'high',
      },
      {
        title: 'Use an API key with broader scope',
        description: 'Generate a new API key with the required scopes or permissions enabled.',
        priority: 'high',
      },
      {
        title: 'Check IP allowlist',
        description: 'If the API uses IP restrictions, ensure your current IP address is on the allowlist.',
        priority: 'medium',
      },
    ],
    confidence: () => 88,
  },

  404: {
    category: 'NOT_FOUND',
    severity: 'medium',
    title: 'Not Found',
    summary: (ctx) =>
      `The resource at ${ctx.url} could not be found. The endpoint may not exist or the resource ID may be invalid.`,
    causes: (ctx) => {
      const causes: DiagnosticsCause[] = [
        {
          title: 'Incorrect URL path',
          description: 'There may be a typo in the endpoint URL or the path structure has changed.',
          probability: 70,
        },
        {
          title: 'Resource does not exist',
          description: 'The specific resource ID or identifier in the URL refers to an item that has been deleted or never existed.',
          probability: 65,
        },
        {
          title: 'API version mismatch',
          description: 'The endpoint may have moved to a different API version.',
          probability: 40,
        },
      ];
      if (/\/[a-zA-Z0-9]{20,}/.test(ctx.url)) {
        causes.unshift({
          title: 'Invalid resource ID',
          description: 'The ID in the URL path appears to be invalid or refers to a deleted resource.',
          probability: 80,
        });
      }
      return causes.sort((a, b) => b.probability - a.probability);
    },
    fixes: (_ctx) => [
      {
        title: 'Verify the URL',
        description: 'Double-check the endpoint URL against the API documentation for typos or structural errors.',
        priority: 'high',
      },
      {
        title: 'Confirm the resource exists',
        description: 'Verify that the resource ID you are using is valid and has not been deleted.',
        priority: 'high',
      },
      {
        title: 'Check API version',
        description: 'Ensure you are using the correct API version (e.g., /v1/ vs /v2/) in the URL.',
        priority: 'medium',
      },
    ],
    confidence: () => 82,
  },

  429: {
    category: 'RATE_LIMITED',
    severity: 'medium',
    title: 'Too Many Requests',
    summary: (_ctx) =>
      'You have exceeded the API rate limit. The server is temporarily refusing requests from your client.',
    causes: (_ctx) => [
      {
        title: 'Rate limit exceeded',
        description: 'Your client is sending requests faster than the API allows.',
        probability: 98,
      },
      {
        title: 'Shared rate limit exhausted',
        description: 'You may be sharing a rate limit with other users on the same API key or IP address.',
        probability: 40,
      },
    ],
    fixes: (ctx) => {
      const retryAfter = ctx.responseHeaders['retry-after'] ?? ctx.responseHeaders['x-ratelimit-reset'];
      const fixes: DiagnosticsFix[] = [
        {
          title: 'Implement exponential backoff',
          description: 'Retry requests with increasing delays to avoid hitting rate limits repeatedly.',
          code: 'Retry-After: ' + (retryAfter ?? 'check response headers'),
          priority: 'high',
        },
        {
          title: 'Reduce request frequency',
          description: 'Slow down your request rate, batch requests, or cache responses to reduce API calls.',
          priority: 'high',
        },
        {
          title: 'Upgrade API plan',
          description: 'If you consistently need more requests, consider upgrading to a higher-tier API plan.',
          priority: 'low',
        },
      ];
      if (retryAfter) {
        fixes.unshift({
          title: `Wait ${retryAfter} seconds`,
          description: `The API has told you to wait. Retry your request after ${retryAfter} seconds.`,
          priority: 'high',
        });
      }
      return fixes;
    },
    confidence: () => 97,
  },

  500: {
    category: 'SERVER_ERROR',
    severity: 'high',
    title: 'Internal Server Error',
    summary: () =>
      "The server encountered an unexpected error. This is a problem on the remote API's side, not in your request.",
    causes: (_ctx) => [
      {
        title: 'Server-side bug or exception',
        description: 'The remote API threw an unhandled exception while processing your request.',
        probability: 80,
      },
      {
        title: 'Downstream service failure',
        description: 'The API depends on another service (database, cache, external API) that is currently unavailable.',
        probability: 55,
      },
      {
        title: 'Resource exhaustion',
        description: 'The server may be out of memory, disk space, or other resources.',
        probability: 30,
      },
    ],
    fixes: (_ctx) => [
      {
        title: 'Retry with exponential backoff',
        description: 'Server errors are often transient. Wait a moment and retry your request.',
        priority: 'high',
      },
      {
        title: 'Check the API status page',
        description: "Visit the API provider's status page to see if there is an ongoing incident.",
        priority: 'high',
      },
      {
        title: 'Report to the API provider',
        description: "If this error persists, contact the API provider's support team with your request details.",
        priority: 'medium',
      },
    ],
    confidence: () => 85,
  },

  502: {
    category: 'GATEWAY_ERROR',
    severity: 'high',
    title: 'Bad Gateway',
    summary: () =>
      'A gateway or proxy server received an invalid response from an upstream server.',
    causes: (_ctx) => [
      {
        title: 'Upstream server failure',
        description: 'The backend service behind the API gateway is down or returning invalid responses.',
        probability: 75,
      },
      {
        title: 'Network connectivity issue',
        description: 'There is a network partition between the gateway and the upstream service.',
        probability: 50,
      },
      {
        title: 'Load balancer misconfiguration',
        description: 'The load balancer may be routing traffic to unhealthy backend instances.',
        probability: 35,
      },
    ],
    fixes: (_ctx) => [
      {
        title: 'Wait and retry',
        description: 'Gateway errors are usually transient. Retry after 30-60 seconds.',
        priority: 'high',
      },
      {
        title: 'Check API status page',
        description: "Visit the API provider's status page for incident reports.",
        priority: 'high',
      },
    ],
    confidence: () => 80,
  },

  503: {
    category: 'SERVICE_UNAVAILABLE',
    severity: 'critical',
    title: 'Service Unavailable',
    summary: () =>
      'The server is temporarily unable to handle the request. This may be due to maintenance or overload.',
    causes: (_ctx) => [
      {
        title: 'Server is overloaded',
        description: 'The server is receiving more traffic than it can handle and is temporarily refusing connections.',
        probability: 70,
      },
      {
        title: 'Scheduled maintenance',
        description: 'The API is undergoing planned maintenance and is temporarily offline.',
        probability: 50,
      },
      {
        title: 'Deployment in progress',
        description: 'A new version of the service is being deployed, causing brief unavailability.',
        probability: 35,
      },
    ],
    fixes: (ctx) => {
      const retryAfter = ctx.responseHeaders['retry-after'];
      return [
        {
          title: retryAfter ? `Retry after ${retryAfter} seconds` : 'Wait and retry',
          description: retryAfter
            ? `The server has requested a retry after ${retryAfter} seconds.`
            : 'Service unavailability is usually transient. Wait a few minutes before retrying.',
          priority: 'high',
        },
        {
          title: 'Check the status page',
          description: "Look for maintenance announcements on the API provider's status page or social channels.",
          priority: 'high',
        },
        {
          title: 'Implement circuit breaker pattern',
          description: 'For production systems, implement a circuit breaker to handle repeated 503 errors gracefully.',
          priority: 'medium',
        },
      ];
    },
    confidence: () => 90,
  },
};

const GENERIC_RULE: DiagnosticsRule = {
  category: 'CLIENT_ERROR',
  severity: 'medium',
  title: 'HTTP Error',
  summary: (ctx) => `The request returned HTTP ${ctx.statusCode}.`,
  causes: (_ctx) => [
    {
      title: 'Unknown error condition',
      description: 'The server returned an error code that requires further investigation.',
      probability: 50,
    },
  ],
  fixes: (_ctx) => [
    {
      title: 'Consult the API documentation',
      description: 'Check the API documentation for the specific error code and its meaning.',
      priority: 'high',
    },
  ],
  confidence: () => 50,
};

// ─── Main Diagnostics Function ────────────────────────────────────────────────

export function runDiagnostics(request: DiagnosticsRequest): DiagnosticsResult {
  const rule = RULES[request.statusCode] ?? GENERIC_RULE;

  return {
    errorCode: request.statusCode,
    category: rule.category,
    title: rule.title,
    summary: rule.summary(request),
    causes: rule.causes(request),
    fixes: rule.fixes(request),
    confidence: rule.confidence(request),
    severity: rule.severity,
  };
}
