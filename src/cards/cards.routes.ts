import type { FastifyInstance } from 'fastify';
import { RouteBuilder } from '../common/route-builder.js';
import { CardsListHelper } from './helpers/cards-list.helper.js';
import { CardDetailHelper } from './helpers/card-detail.helper.js';
import { HttpStatusCodes } from '../common/http-status-codes.js';

/**
 * Cards Routes Module
 * Centralizes all Cards V4 routes
 */
export function registerCardsRoutes(fastify: FastifyInstance): void {
  // List cards
  fastify.get('/bs-card-v4/customer-management/product-service/v4/cards', async (request, reply) => {
    try {
      const headers = request.headers as Record<string, string>;
      if (!headers['branch-office-code']) {
        return reply.status(HttpStatusCodes.BAD_REQUEST).send({ error: "Missing header 'branch-office-code'" });
      }
      if (!headers['user-code']) {
        return reply.status(HttpStatusCodes.BAD_REQUEST).send({ error: "Missing header 'user-code'" });
      }

      const query = request.query as Record<string, string>;
      const personId = query.personId;
      const extraFields = query.extraFields;
      const pageNumber = headers['pagenumber'] || headers['page-number'];

      const result = await CardsListHelper.getCards(personId, pageNumber, extraFields);
      
      // Set custom headers
      if (result.headers) {
        Object.entries(result.headers).forEach(([key, value]) => {
          reply.header(key, value);
        });
      }

      return reply.status(result.status).send(JSON.parse(result.body));
    } catch (error) {
      console.error('Error in cards list endpoint:', error);
      return reply.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Internal server error' });
    }
  });

  // Card detail
  fastify.get('/bs-card-v4/customer-management/product-service/v4/cards/:cardId', async (request, reply) => {
    try {
      const headers = request.headers as Record<string, string>;
      if (!headers['branch-office-code']) {
        return reply.status(HttpStatusCodes.BAD_REQUEST).send({ error: "Missing header 'branch-office-code'" });
      }
      if (!headers['user-code']) {
        return reply.status(HttpStatusCodes.BAD_REQUEST).send({ error: "Missing header 'user-code'" });
      }

      const params = request.params as { cardId: string };
      const query = request.query as Record<string, string>;
      const cardId = params.cardId;
      const extraFields = query.extraFields;

      const result = await CardDetailHelper.getCardById(cardId, extraFields);
      
      return reply.status(result.status).send(JSON.parse(result.body));
    } catch (error) {
      console.error('Error in card detail endpoint:', error);
      return reply.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).send({ error: 'Internal server error' });
    }
  });
}
