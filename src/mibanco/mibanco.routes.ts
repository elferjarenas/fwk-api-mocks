import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { RouteBuilder } from '../common/route-builder.js';
import { getOffer } from './helpers/offer.helper.js';
import { getPaymentDates } from './helpers/paydate.helper.js';
import { simulateLoan } from './helpers/simulate.helper.js';
import { getQuote } from './helpers/quote.helper.js';
import { registerLoan } from './helpers/register.helper.js';
import type { OfferRequestDto } from './entities/request-dto.js';

/**
 * Mibanco Routes Module
 * Centralizes all Mibanco lending routes
 */
export function registerMibancoRoutes(fastify: FastifyInstance): void {
  const builder = new RouteBuilder(fastify);

  // Offer consultation
  fastify.post('/creditos-yape/sales/customer-offer/v1/lead/consultar', async (request: FastifyRequest, reply: FastifyReply) => {
    return await getOffer(request, reply);
  });

  // Payment dates
  fastify.get('/creditos-yape/servicing/servicing-order/v1/simulacion/obtener-dias-pago', async (request: FastifyRequest, reply: FastifyReply) => {
    return await getPaymentDates(request, reply);
  });

  // Loan simulation
  fastify.get('/creditos-yape/servicing/servicing-order/v1/simulacion/generar', async (request: FastifyRequest, reply: FastifyReply) => {
    return await simulateLoan(request, reply);
  });

  // Payment schedule (quote)
  fastify.get('/creditos-yape/servicing/servicing-order/v1/simulacion/obtener-cronograma', async (request: FastifyRequest, reply: FastifyReply) => {
    return await getQuote(request, reply);
  });

  // Loan registration
  fastify.post('/creditos-yape/loans-deposits/consumer-loan/v1/desembolso/generar', async (request: FastifyRequest, reply: FastifyReply) => {
    return await registerLoan(request, reply);
  });
}
