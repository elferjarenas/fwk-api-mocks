import type { FastifyInstance, FastifyRequest } from 'fastify';
import { RouteBuilder } from '../common/route-builder.js';
import { getIdentificationMethods } from './helpers/identification-methods.helper.js';
import { processFacialVerification } from './helpers/facial-verification.helper.js';
import { getFacialIdentifiers } from './helpers/facial-identifiers.helper.js';
import { generateOAuthToken } from './helpers/oauth-token.helper.js';
import { HttpStatusCodes } from '../common/http-status-codes.js';

/**
 * CIAM Routes Module
 * Centralizes all CIAM-related routes
 */
export function registerCiamRoutes(fastify: FastifyInstance): void {
  const builder = new RouteBuilder(fastify);

  // Identification Methods - v1 and v2
  builder.get('/channel/ciam/mobile-login/v1/identification-methods', async (request, reply) => {
    const response = getIdentificationMethods(request.headers as Record<string, unknown>);
    return reply.code(HttpStatusCodes.OK).send(response);
  });

  builder.get('/channel/ciam/mobile-login/v2/identification-methods', async (request, reply) => {
    const response = getIdentificationMethods(request.headers as Record<string, unknown>);
    return reply.code(HttpStatusCodes.OK).send(response);
  });

  // Facial Identifiers
  builder.get('/ux-biom-mobile-facial-overview-v1/channel/biom/v1/mobile-facial-overview/facial-identifiers', async (request, reply) => {
    const response = getFacialIdentifiers(request.headers as Record<string, unknown>);
    return reply.code(HttpStatusCodes.OK).send(response);
  });

  // Facial Verification - v1, v2, and OIDC
  builder.post('/channel/ciam/mobile-login/v1/identification-methods/facial-verification', async (body, request: FastifyRequest) => {
    return processFacialVerification(body as Record<string, unknown>, request.headers as Record<string, unknown>);
  });

  builder.post('/channel/ciam/mobile-login/v2/identification-methods/facial-verification', async (body, request: FastifyRequest) => {
    return processFacialVerification(body as Record<string, unknown>, request.headers as Record<string, unknown>);
  });

  builder.post('/cas/oidc/accessToken', async (body, request: FastifyRequest) => {
    return processFacialVerification(body as Record<string, unknown>, request.headers as Record<string, unknown>);
  });

  // OAuth Token Generation
  builder.post('/auth/oauth/v2/token', async () => {
    return generateOAuthToken();
  });
}
