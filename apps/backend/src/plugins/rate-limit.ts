import fp from 'fastify-plugin';
import rateLimit, { errorResponseBuilderContext } from '@fastify/rate-limit';
import { FastifyInstance, FastifyRequest } from 'fastify';
import { env } from '../config/env';

export default fp(async function rateLimitPlugin(app: FastifyInstance) {
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    errorResponseBuilder: (_req: FastifyRequest, context: errorResponseBuilderContext) => ({
      error: {
        code: 'RATE_LIMITED',
        message: `Too many requests. Try again in ${Math.ceil(context.ttl / 1000)} seconds.`,
        details: {
          limit: context.max,
          remaining: context.after,
          resetAt: new Date(Date.now() + context.ttl).toISOString(),
        },
      },
    }),
  });
});
