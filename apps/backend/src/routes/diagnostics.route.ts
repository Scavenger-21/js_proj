import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { runDiagnostics } from '../services/diagnostics.service';

const diagnosticsSchema = z.object({
  statusCode: z.number().int().min(100).max(599),
  url: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']),
  requestHeaders: z.record(z.string()).default({}),
  responseHeaders: z.record(z.string()).default({}),
  responseBody: z.unknown().optional(),
  responseTime: z.number().min(0).default(0),
});

export async function diagnosticsRoute(app: FastifyInstance) {
  app.post(
    '/api/diagnostics',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = diagnosticsSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid diagnostics payload.',
            details: {
              issues: parsed.error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
              })),
            },
          },
        });
      }
      const result = runDiagnostics({
        ...parsed.data,
        responseBody: parsed.data.responseBody ?? null,
      });
      return reply.status(200).send(result);
    },
  );
}
