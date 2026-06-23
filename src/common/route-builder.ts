import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { HttpStatusCodes } from './http-status-codes.js';
import { isBusinessException } from './exceptions.js';

/**
 * RouteBuilder - Builder pattern for reducing route boilerplate
 * Implements DRY principle by extracting common route patterns
 */
export class RouteBuilder {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  /**
   * Generic error handler for all routes
   */
  private handleError(error: unknown, reply: FastifyReply) {
    console.error('handleError received:', error);
    
    if (isBusinessException(error)) {
      return reply.status(error.status).send(error.errorBody);
    }
    
    return reply.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send({
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      type: 'unknown/errors/UNKNOWN',
      title: 'Error desconocido',
      detail: error instanceof Error ? error.message : 'Unknown error',
      instance: 'unknown',
    });
  }

  /**
   * Register POST route with automatic error handling
   * @param path Route path
   * @param handler Async handler function
   */
  post<TBody = unknown, TResponse = unknown>(
    path: string,
    handler: (body: TBody, request: FastifyRequest) => Promise<TResponse>
  ): void {
    this.fastify.post(path, async (request, reply) => {
      try {
        const result = await handler(request.body as TBody, request);
        return reply.send(result);
      } catch (error) {
        return this.handleError(error, reply);
      }
    });
  }

  /**
   * Register GET route with automatic error handling
   * @param path Route path
   * @param handler Async handler function
   */
  get<TResponse = unknown>(
    path: string,
    handler: (request: FastifyRequest, reply: FastifyReply) => Promise<TResponse | void>
  ): void {
    this.fastify.get(path, async (request, reply) => {
      try {
        const result = await handler(request, reply);
        if (result !== undefined) {
          return reply.send(result);
        }
      } catch (error) {
        return this.handleError(error, reply);
      }
    });
  }

  /**
   * Register route with custom status code
   */
  postWithStatus<TBody = unknown, TResponse = unknown>(
    path: string,
    handler: (body: TBody, request: FastifyRequest) => Promise<{ status: number; data: TResponse }>
  ): void {
    this.fastify.post(path, async (request, reply) => {
      try {
        const result = await handler(request.body as TBody, request);
        return reply.status(result.status).send(result.data);
      } catch (error) {
        return this.handleError(error, reply);
      }
    });
  }

  /**
   * Register route with custom error handling
   */
  postWithCustomErrorHandling<TBody = unknown>(
    path: string,
    handler: (body: TBody, request: FastifyRequest, reply: FastifyReply) => Promise<void>,
    errorHandler?: (error: unknown, reply: FastifyReply) => Promise<unknown>
  ): void {
    this.fastify.post(path, async (request, reply) => {
      try {
        await handler(request.body as TBody, request, reply);
      } catch (error) {
        if (errorHandler) {
          return await errorHandler(error, reply);
        }
        return this.handleError(error, reply);
      }
    });
  }
}
