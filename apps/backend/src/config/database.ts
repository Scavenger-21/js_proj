import { PrismaClient } from '@prisma/client';
import { env } from './env';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });
}

// Singleton pattern — prevents connection pool exhaustion in dev with hot reload
export const prisma: PrismaClient =
  env.NODE_ENV === 'production' ? createPrismaClient() : (global.__prisma ??= createPrismaClient());

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
