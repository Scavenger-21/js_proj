import fp from 'fastify-plugin';
import { FastifyInstance, FastifyError } from 'fastify';
import { APIForgeError } from '../errors/APIForgeError';
import { ZodError } from 'zod';

export default fp(async function errorHandlerPlugin(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError | APIForgeError | Error, _request, reply) => {
    // Handle our domain errors
    if (error instanceof APIForgeError) {
      return reply.status(error.statusCode).send(error.toJSON());
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed.',
          details: {
            issues: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        },
      });
    }

    // Handle Fastify validation errors (JSON schema)
    if ('validation' in error && error.validation) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed.',
          details: { validation: error.validation },
        },
      });
    }

    // Unhandled errors — log and return 500
    app.log.error({ err: error }, 'Unhandled error');
    return reply.status(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
      },
    });
  });

  // 404 handler
  app.setNotFoundHandler((_request, reply) => {
    reply.status(404).send({
      error: {
        code: 'NOT_FOUND',
        message: 'The requested route does not exist.',
      },
    });
  });
});
