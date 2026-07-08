import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { computeHealthScores } from '../services/health.service';

const healthQuerySchema = z.object({
  endpoint: z.string().optional(),
});

export async function healthRoute(app: FastifyInstance) {
  app.get(
    '/api/health',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = healthQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters.' },
        });
      }
      const scores = await computeHealthScores(parsed.data.endpoint);
      return reply.status(200).send(scores);
    },
  );

  // System health check (not endpoint health)
  app.get(
    '/api/ping',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      return reply.status(200).send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      });
    },
  );
}
