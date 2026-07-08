import { ErrorCode, ERROR_MESSAGES } from './error-codes';

export class APIForgeError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    statusCode: number,
    message?: string,
    details?: Record<string, unknown>,
  ) {
    super(message ?? ERROR_MESSAGES[code]);
    this.name = 'APIForgeError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details ? { details: this.details } : {}),
      },
    };
  }

  // ─── Factory Methods ───────────────────────────────────────────────────────

  static notFound(resource = 'Resource'): APIForgeError {
    return new APIForgeError('NOT_FOUND', 404, `${resource} not found.`);
  }

  static validation(details: Record<string, unknown>): APIForgeError {
    return new APIForgeError('VALIDATION_ERROR', 400, undefined, details);
  }

  static ssrfBlocked(url: string): APIForgeError {
    return new APIForgeError('SSRF_BLOCKED', 422, undefined, { blockedUrl: url });
  }

  static proxyTimeout(url: string): APIForgeError {
    return new APIForgeError('PROXY_TIMEOUT', 504, undefined, { url });
  }

  static proxyError(message: string, url: string): APIForgeError {
    return new APIForgeError('PROXY_ERROR', 502, message, { url });
  }

  static responseTooLarge(bytes: number): APIForgeError {
    return new APIForgeError('RESPONSE_TOO_LARGE', 413, undefined, { bytes });
  }

  static internal(message?: string): APIForgeError {
    return new APIForgeError('INTERNAL_ERROR', 500, message);
  }

  static invalidUrl(url: string): APIForgeError {
    return new APIForgeError('INVALID_URL', 400, undefined, { url });
  }
}
