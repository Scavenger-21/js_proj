import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { proxyRequest } from '../services/proxy.service';
import { analyzeRequestSecurity } from '../services/security.service';

const requestSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']),
  url: z.string().url('Must be a valid URL'),
  headers: z.record(z.string()).default({}),
  body: z.unknown().optional(),
});

export async function requestRoute(app: FastifyInstance) {
  app.post(
    '/api/request',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = requestSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request payload.',
            details: {
              issues: parsed.error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
              })),
            },
          },
        });
      }

      const { method, url, headers, body } = parsed.data;

      try {
        // Run security analysis before proxying
        const security = analyzeRequestSecurity(url, headers);

        const response = await proxyRequest({ method, url, headers, body });

        return reply.status(200).send({
          ...response,
          security,
        });
      } catch (error) {
        // Re-throw so Fastify's setErrorHandler handles it properly
        throw error;
      }
    },
  );
}
