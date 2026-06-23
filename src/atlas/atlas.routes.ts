import type { FastifyInstance } from 'fastify';
import { RouteBuilder } from '../common/route-builder.js';
import { processAccountTransfer } from './helpers/transfer.helper.js';
import { AtlasValidationException, AtlasNotFoundException, AtlasException } from './exceptions/atlas-exception.js';

/**
 * Atlas Routes Module
 * Centralizes all Atlas account transfer routes
 */
export function registerAtlasRoutes(fastify: FastifyInstance): void {
  fastify.post('/support-core-account-transfer/v1/account-transfers', async (request, reply) => {
    try {
      const result = processAccountTransfer(request.body as Record<string, unknown>);
      return reply.status(result.status).send(result.data);
    } catch (error) {
      // Handle Atlas-specific exceptions
      if (error instanceof AtlasValidationException) {
        return reply.status(error.statusCode).send({
          error: error.message,
          statusCode: error.statusCode,
        });
      }
      
      if (error instanceof AtlasNotFoundException) {
        return reply.status(error.status).send({
          error: error.message,
          statusCode: error.status,
        });
      }
      
      if (error instanceof AtlasException && error.data) {
        return reply.status(error.status).send(error.data);
      }
      
      throw error;
    }
  });
}
