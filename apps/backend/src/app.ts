import Fastify, { FastifyInstance } from 'fastify';
import { env } from './config/env';
import corsPlugin from './plugins/cors';
import rateLimitPlugin from './plugins/rate-limit';
import errorHandlerPlugin from './plugins/error-handler';
import { requestRoute } from './routes/request.route';
import { historyRoute } from './routes/history.route';
import { analyticsRoute } from './routes/analytics.route';
import { diagnosticsRoute } from './routes/diagnostics.route';
import { healthRoute } from './routes/health.route';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'development' ? 'info' : 'warn',
      transport:
        env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
    trustProxy: true,
  });

  // Plugins (order matters)
  await app.register(corsPlugin);
  await app.register(rateLimitPlugin);
  await app.register(errorHandlerPlugin);

  // Routes
  await app.register(requestRoute);
  await app.register(historyRoute);
  await app.register(analyticsRoute);
  await app.register(diagnosticsRoute);
  await app.register(healthRoute);

  return app;
}
