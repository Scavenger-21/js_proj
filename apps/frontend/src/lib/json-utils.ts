export function tryPrettify(json: string): string {
  try {
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch {
    return json;
  }
}

export function tryMinify(json: string): string {
  try {
    return JSON.stringify(JSON.parse(json));
  } catch {
    return json;
  }
}

export function safeParseBody(body: string): unknown {
  if (!body.trim()) return undefined;
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

export function formatResponseBody(body: unknown): { content: string; language: string } {
  if (body === null || body === undefined) {
    return { content: '', language: 'plaintext' };
  }
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      return { content: JSON.stringify(parsed, null, 2), language: 'json' };
    } catch {
      return { content: body, language: 'plaintext' };
    }
  }
  if (typeof body === 'object') {
    return { content: JSON.stringify(body, null, 2), language: 'json' };
  }
  return { content: String(body), language: 'plaintext' };
}
