import { APIForgeError } from '../errors/APIForgeError';
import { env } from '../config/env';
import { ProxyRequest, ProxyResponse } from '@apiforge/shared';
import { historyRepository } from '../repositories/history.repository';

// ─── SSRF Prevention ─────────────────────────────────────────────────────────

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '0.0.0.0',
  'metadata.google.internal',
  '169.254.169.254', // AWS/GCP metadata
]);

const PRIVATE_IP_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,
  /^127\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
];

function validateUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw APIForgeError.invalidUrl(rawUrl);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw APIForgeError.invalidUrl(rawUrl);
  }

  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw APIForgeError.ssrfBlocked(rawUrl);
  }

  if (PRIVATE_IP_RANGES.some((pattern) => pattern.test(hostname))) {
    throw APIForgeError.ssrfBlocked(rawUrl);
  }

  return parsed;
}

// ─── Header Sanitization ─────────────────────────────────────────────────────

const FORBIDDEN_REQUEST_HEADERS = new Set([
  'host',
  'connection',
  'transfer-encoding',
  'upgrade',
  'proxy-authorization',
  'proxy-connection',
  'te',
  'trailers',
]);

function sanitizeRequestHeaders(headers: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    const normalized = key.toLowerCase().trim();
    if (!FORBIDDEN_REQUEST_HEADERS.has(normalized)) {
      // Prevent header injection via newlines
      const safeValue = value.replace(/[\r\n]/g, '');
      sanitized[normalized] = safeValue;
    }
  }
  return sanitized;
}

// ─── Response Size Guard ─────────────────────────────────────────────────────

async function readResponseBody(response: globalThis.Response): Promise<{ body: unknown; size: number; isBinary: boolean }> {
  const contentType = response.headers.get('content-type') ?? '';
  const contentLength = Number(response.headers.get('content-length') ?? 0);

  if (contentLength > env.MAX_RESPONSE_SIZE_BYTES) {
    throw APIForgeError.responseTooLarge(contentLength);
  }

  const buffer = await response.arrayBuffer();
  const size = buffer.byteLength;

  if (size > env.MAX_RESPONSE_SIZE_BYTES) {
    throw APIForgeError.responseTooLarge(size);
  }

  const isBinary = /image|video|audio|application\/(pdf|octet-stream|zip|gzip|tar)/i.test(contentType);

  if (isBinary) {
    return { body: Buffer.from(buffer).toString('base64'), size, isBinary: true };
  }

  const text = new TextDecoder().decode(buffer);

  if (contentType.includes('application/json')) {
    try {
      return { body: JSON.parse(text), size, isBinary: false };
    } catch {
      return { body: text, size, isBinary: false };
    }
  }

  return { body: text, size, isBinary: false };
}

// ─── Response Headers ─────────────────────────────────────────────────────────

function extractResponseHeaders(headers: globalThis.Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

// ─── Proxy Service ───────────────────────────────────────────────────────────

export async function proxyRequest(request: ProxyRequest): Promise<ProxyResponse> {
  const validatedUrl = validateUrl(request.url);
  const sanitizedHeaders = sanitizeRequestHeaders(request.headers);

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'OPTIONS' && request.body != null;
  const bodyPayload = hasBody 
    ? (typeof request.body === 'string' ? request.body : JSON.stringify(request.body)) 
    : undefined;

  if (hasBody && !sanitizedHeaders['content-type'] && typeof request.body !== 'string') {
    sanitizedHeaders['content-type'] = 'application/json';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), env.REQUEST_TIMEOUT_MS);

  const startTime = Date.now();

  try {
    const response = await fetch(validatedUrl.toString(), {
      method: request.method,
      headers: sanitizedHeaders,
      body: bodyPayload,
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    const { body, size, isBinary } = await readResponseBody(response);
    const responseHeaders = extractResponseHeaders(response.headers);

    const isSuccess = response.status < 400;

    // Persist to history
    const historyRecord = await historyRepository.create({
      method: request.method,
      url: validatedUrl.toString(),
      headers: request.headers,
      body: request.body ?? null,
      statusCode: response.status,
      responseBody: body,
      responseHeaders,
      responseTime,
      responseSize: size,
      isSuccess,
    });

    return {
      statusCode: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body,
      responseTime,
      responseSize: size,
      historyId: historyRecord.id,
      isBinary,
    };
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof APIForgeError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw APIForgeError.proxyTimeout(request.url);
    }

    const message = error instanceof Error ? error.message : 'Unknown proxy error';
    throw APIForgeError.proxyError(message, request.url);
  }
}
