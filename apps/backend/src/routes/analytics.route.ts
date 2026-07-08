import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { getAnalytics } from '../services/analytics.service';

const analyticsQuerySchema = z.object({
  from: z
    .string()
    .datetime({ offset: true })
    .optional()
    .transform((v) =>
      v ? new Date(v) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    ),
  to: z
    .string()
    .datetime({ offset: true })
    .optional()
    .transform((v) => (v ? new Date(v) : new Date())),
});

export async function analyticsRoute(app: FastifyInstance) {
  app.get(
    '/api/analytics',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = analyticsQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: 'Invalid date parameters.' },
        });
      }
      const { from, to } = parsed.data;
      const data = await getAnalytics(from, to);
      return reply.status(200).send(data);
    },
  );
}
