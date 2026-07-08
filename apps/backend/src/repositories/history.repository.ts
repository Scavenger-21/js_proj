import { prisma } from '../config/database';
import { RequestHistory, HistoryListResponse, HistoryQueryParams, HttpMethod } from '@apiforge/shared';

interface CreateHistoryInput {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: unknown | null;
  statusCode: number;
  responseBody: unknown;
  responseHeaders: Record<string, string>;
  responseTime: number;
  responseSize: number;
  isSuccess: boolean;
}

function tryParseJson(val: unknown): unknown {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

function mapToHistoryType(record: {
  id: string;
  method: string;
  url: string;
  headers: string;
  body: string | null;
  statusCode: number;
  responseBody: string;
  responseHeaders: string;
  responseTime: number;
  responseSize: number;
  isSuccess: boolean;
  createdAt: Date;
}): RequestHistory {
  return {
    id: record.id,
    method: record.method as HttpMethod,
    url: record.url,
    headers: tryParseJson(record.headers) as Record<string, string>,
    body: tryParseJson(record.body) ?? null,
    statusCode: record.statusCode,
    responseBody: tryParseJson(record.responseBody),
    responseHeaders: tryParseJson(record.responseHeaders) as Record<string, string>,
    responseTime: record.responseTime,
    responseSize: record.responseSize,
    isSuccess: record.isSuccess,
    createdAt: record.createdAt.toISOString(),
  };
}

export const historyRepository = {
  async create(data: CreateHistoryInput): Promise<RequestHistory> {
    const record = await prisma.requestHistory.create({
      data: {
        method: data.method,
        url: data.url,
        headers: JSON.stringify(data.headers),
        body: data.body !== null ? JSON.stringify(data.body) : null,
        statusCode: data.statusCode,
        responseBody: JSON.stringify(data.responseBody),
        responseHeaders: JSON.stringify(data.responseHeaders),
        responseTime: data.responseTime,
        responseSize: data.responseSize,
        isSuccess: data.isSuccess,
      },
    });
    return mapToHistoryType(record);
  },

  async findMany(params: HistoryQueryParams): Promise<HistoryListResponse> {
    const { limit = 50, offset = 0, method, search } = params;

    const where = {
      ...(method ? { method } : {}),
      ...(search ? { url: { contains: search } } : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.requestHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.requestHistory.count({ where }),
    ]);

    return {
      items: items.map(mapToHistoryType),
      total,
      hasMore: offset + items.length < total,
    };
  },

  async findById(id: string): Promise<RequestHistory | null> {
    const record = await prisma.requestHistory.findUnique({ where: { id } });
    if (!record) return null;
    return mapToHistoryType(record);
  },

  async deleteById(id: string): Promise<boolean> {
    try {
      await prisma.requestHistory.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  },

  async deleteAll(): Promise<number> {
    const result = await prisma.requestHistory.deleteMany({});
    return result.count;
  },

  async findAllForAnalytics(from: Date, to: Date) {
    return prisma.requestHistory.findMany({
      where: {
        createdAt: { gte: from, lte: to },
      },
      select: {
        method: true,
        url: true,
        statusCode: true,
        responseTime: true,
        isSuccess: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  },
};
