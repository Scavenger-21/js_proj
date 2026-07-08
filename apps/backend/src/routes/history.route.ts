import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { historyRepository } from '../repositories/history.repository';
import { APIForgeError } from '../errors/APIForgeError';

const listQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']).optional(),
  search: z.string().optional(),
});

export async function historyRoute(app: FastifyInstance) {
  // GET /api/history
  app.get(
    '/api/history',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = listQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.status(400).send({
          error: { code: 'VALIDATION_ERROR', message: 'Invalid query parameters.' },
        });
      }
      const result = await historyRepository.findMany(parsed.data);
      return reply.status(200).send(result);
    },
  );

  // DELETE /api/history (clear all)
  app.delete(
    '/api/history',
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const count = await historyRepository.deleteAll();
      return reply.status(200).send({ deleted: count });
    },
  );

  // DELETE /api/history/:id
  app.delete(
    '/api/history/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = request.params;
      if (!id) throw APIForgeError.notFound('History entry');

      const success = await historyRepository.deleteById(id);
      if (!success) throw APIForgeError.notFound('History entry');

      return reply.status(200).send({ deleted: true, id });
    },
  );
}
