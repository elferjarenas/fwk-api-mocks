import { FastifyReply, FastifyRequest } from 'fastify';
import { getPersonalityErrorCode, isErrorPersonality, getVariantForPersonality } from '../utility/personality.js';
import { buildErrorResponse } from '../messages/response.js';
import { createValidationException } from '../exceptions/exception-builder.js';
import { TicabankValidationException } from '../exceptions/ticabank-exception.js';
import { SimulateResponse, Installment } from '../entities/simulate-dto.js';
import { HttpStatusCodes } from '../../common/http-status-codes.js';
import { UserRepository } from '../../repository/user-repository.js';
import { findPersonality } from '../../common/personality-checker.js';
import {
  getTermRatesConfig,
  calculatePaymentDayBoost,
  calculateInstallmentAmount,
  distributeInterestByWeight
} from '../support/financial-calculator.js';
import { TicabankPersonality } from '../constants/api-codes.js';
import { SimulateRequestValidator } from '../validators/simulate-validator.js';

/**
 * Process the Simulate request and return installment options
 * 
 * @param request - Fastify request object with query parameters
 * @param reply - Fastify reply object
 * @returns SimulateResponse with installment options or error
 */
export async function simulateLoan(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> {
  try {
    const queryParams = request.query as Record<string, string>;
    const validator = new SimulateRequestValidator(queryParams);

    if (!validator.valid()) {
      const firstError = validator.getFirstError();
      // Return 404 if required params missing (Ruby limitation workaround)
      if (firstError?.message.includes('required')) {
        const errorResponse = buildErrorResponse(HttpStatusCodes.NOT_FOUND, 'simulate');
        return reply.code(HttpStatusCodes.NOT_FOUND).send(errorResponse);
      }
      throw createValidationException(firstError?.message || 'Validation failed');
    }

    const codigoCliente = validator.getCodigoCliente()!;
    const montoSolicitado = validator.getMontoSolicitado()!;
    const numeroDiaPago = validator.getNumeroDiaPago()!;

    // Get user by X-User-Email header
    const userEmail = (request.headers['x-user-email'] as string)?.toLowerCase();
    let user = userEmail ? UserRepository.getUser(userEmail) : undefined;
    
    // Fallback: search all users if no email header provided
    if (!user) {
      const allUsers = UserRepository.getAllUsers();
      user = allUsers.find(u => u.personalities && u.personalities.some(p => isErrorPersonality('SIMULATE', p)));
    }
    
    // Check for error personality
    if (user && user.personalities) {
      const errorPersonality = findPersonality(
        user.personalities,
        (p) => isErrorPersonality('SIMULATE', p)
      );
      
      if (errorPersonality) {
        const statusCode = getPersonalityErrorCode('SIMULATE', errorPersonality);
        const variant = getVariantForPersonality(errorPersonality as TicabankPersonality);
        const errorResponse = buildErrorResponse(statusCode, 'simulate', variant || undefined);
        return reply.code(statusCode).send(errorResponse);
      }
    }

    const installments = calculateSimulation(montoSolicitado, numeroDiaPago);

    const response: SimulateResponse = {
      status: HttpStatusCodes.OK,
      data: installments
    };

    return reply.status(HttpStatusCodes.OK).send(response);
  } catch (error) {
    if (error instanceof TicabankValidationException) {
      const errorResponse = buildErrorResponse(HttpStatusCodes.BAD_REQUEST, 'simulate');
      return reply.code(HttpStatusCodes.BAD_REQUEST).send(errorResponse);
    }

    const errorResponse = buildErrorResponse(HttpStatusCodes.INTERNAL_SERVER_ERROR, 'simulate');
    return reply.code(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(errorResponse);
  }
}

/**
 * Calculate loan simulation with installment options
 * 
 * @param amount - Requested loan amount
 * @param paymentDay - Day of the month for payment
 * @returns Array of installment options
 */
function calculateSimulation(amount: number, paymentDay: number): Installment[] {
  const { termRates, totalPercent } = getTermRatesConfig(amount);

  const allocatedPercents = distributeInterestByWeight(termRates, totalPercent);

  const paymentDayBoost = calculatePaymentDayBoost(paymentDay);

  const installments: Installment[] = termRates.map((termRate) => {
    const allocatedPercent = allocatedPercents.get(termRate.term) || 0;
    const installmentAmount = calculateInstallmentAmount(
      amount,
      termRate.term,
      allocatedPercent,
      paymentDayBoost
    );

    return {
      montoCuotaSimulacion: installmentAmount,
      cantidadCuotas: termRate.term
    };
  });

  return installments;
}
