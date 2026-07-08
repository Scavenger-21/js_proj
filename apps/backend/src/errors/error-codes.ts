export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'PROXY_ERROR'
  | 'PROXY_TIMEOUT'
  | 'SSRF_BLOCKED'
  | 'RESPONSE_TOO_LARGE'
  | 'INTERNAL_ERROR'
  | 'RATE_LIMITED'
  | 'INVALID_URL'
  | 'DATABASE_ERROR';

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  VALIDATION_ERROR: 'Request validation failed.',
  NOT_FOUND: 'The requested resource was not found.',
  PROXY_ERROR: 'Failed to proxy the request to the target server.',
  PROXY_TIMEOUT: 'The proxied request timed out.',
  SSRF_BLOCKED: 'Request blocked: internal/private addresses are not allowed.',
  RESPONSE_TOO_LARGE: 'Response body exceeds the maximum allowed size.',
  INTERNAL_ERROR: 'An unexpected internal server error occurred.',
  RATE_LIMITED: 'Too many requests. Please slow down.',
  INVALID_URL: 'The provided URL is not valid.',
  DATABASE_ERROR: 'A database operation failed.',
};
