import { FastifyRequest, FastifyReply } from 'fastify';
import { QuoteRequest, QuoteResponse, QuoteData } from '../entities/quote-dto.js';
import { getPersonalityErrorCode, isErrorPersonality, getVariantForPersonality } from '../utility/personality.js';
import { buildErrorResponse } from '../messages/response.js';
import { UserRepository } from '../../repository/user-repository.js';
import { findPersonality } from '../../common/personality-checker.js';
import {
  calculateInterestRatePercentage,
  calculateCreditLifeInsurance,
  calculateFinancialTransactionTax,
  calculateEffectiveRates,
  calculateSimulatedInstallment,
} from '../support/financial-calculator.js';
import { generateSchedule, calculateMaturityDate } from '../support/schedule-generator.js';
import { createValidationException } from '../exceptions/exception-builder.js';
import { TicabankValidationException } from '../exceptions/ticabank-exception.js';
import { HttpStatusCodes } from '../../common/http-status-codes.js';
import { TicabankPersonality } from '../constants/api-codes.js';
import { QuoteRequestValidator } from '../validators/quote-validator.js';

interface QuoteQuery {
  codigoCliente?: string;
  montoSolicitado?: string;
  cantidadCuotas?: string;
  numeroDiaPago?: string;
}

/**
 * Get quote with payment schedule
 * 
 * Query parameters:
 * - codigoCliente: Customer code (required)
 * - montoSolicitado: Requested amount (required, 500-10000)
 * - cantidadCuotas: Number of installments (required, 6-24)
 * - numeroDiaPago: Payment day (required, 1-31)
 * 
 * @param request - Fastify request
 * @param reply - Fastify reply
 */
export async function getQuote(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const query = request.query as Record<string, string>;
    const validator = new QuoteRequestValidator(query);

    if (!validator.valid()) {
      const firstError = validator.getFirstError();
      if (firstError?.message.includes('required')) {
        const errorResponse = buildErrorResponse(HttpStatusCodes.NOT_FOUND, 'quote');
        await reply.code(HttpStatusCodes.NOT_FOUND).send(errorResponse);
        return;
      }
      throw createValidationException(firstError?.message || 'Validation failed');
    }

    const amount = validator.getMontoSolicitado()!;
    const term = validator.getCantidadCuotas()!;
    const paymentDay = validator.getNumeroDiaPago()!;
    const clientCode = validator.getCodigoCliente()!;

    // Get user by X-User-Email header
    const userEmail = (request.headers['x-user-email'] as string)?.toLowerCase();
    let user = userEmail ? UserRepository.getUser(userEmail) : undefined;
    
    // Fallback: search all users if no email header provided
    if (!user) {
      const allUsers = UserRepository.getAllUsers();
      user = allUsers.find(u => u.personalities && u.personalities.some(p => isErrorPersonality('QUOTE', p)));
    }
    
    // Check for error personality
    if (user && user.personalities) {
      const errorPersonality = findPersonality(
        user.personalities,
        (p) => isErrorPersonality('QUOTE', p)
      );
      
      if (errorPersonality) {
        const statusCode = getPersonalityErrorCode('QUOTE', errorPersonality);
        const variant = getVariantForPersonality(errorPersonality as TicabankPersonality);
        const errorResponse = buildErrorResponse(statusCode, 'quote', variant || undefined);
        await reply.code(statusCode).send(errorResponse);
        return;
      }
    }

    const interestRatePercentage = calculateInterestRatePercentage(amount, term);
    const simpleMonthlyRate = (interestRatePercentage / 100.0) / term;
    const insurancePremium = calculateCreditLifeInsurance(amount);
    const insuranceRate = (0.45 / 100.0) / 12;
    const { tea, tcea } = calculateEffectiveRates(simpleMonthlyRate, insuranceRate);
    const itf = calculateFinancialTransactionTax(amount);

    const simulatedInstallment = calculateSimulatedInstallment(
      amount,
      term,
      interestRatePercentage
    );

    const baseDate = new Date();
    const schedule = generateSchedule({
      amount,
      term,
      interestRatePercentage,
      paymentDay,
      baseDate,
    });

    const maturityDate = calculateMaturityDate(baseDate, paymentDay, term);

    const totalCapital = schedule.reduce((sum, item) => sum + item.montoCapital, 0);
    const totalInterest = schedule.reduce((sum, item) => sum + item.montoInteres, 0);

    const quoteData: QuoteData = {
      numeroDiaPago: paymentDay,
      fechaVencimiento: maturityDate,
      montoTotalCapital: Math.round(totalCapital * 100) / 100,
      montoTotalInteres: Math.round(totalInterest * 100) / 100,
      montoImpuestoTransaccionesFinancieras: itf,
      montoPrimaDesgravamen: insurancePremium,
      porcentajeTasaSeguroDesgravamen: 0.45,
      montoCuotaSimulacion: simulatedInstallment,
      porcentajeTasaInteres: Math.round(interestRatePercentage * 100) / 100,
      porcentajeTasaEfectivaAnual: tea,
      porcentajeTasaCostoEfectivaAnual: tcea,
      montoNetoSolicitado: amount,
      porcentajeTasaMora: 15.35,
      cronograma: schedule,
    };

    const response: QuoteResponse = {
      status: HttpStatusCodes.OK,
      data: quoteData,
    };

    await reply.code(HttpStatusCodes.OK).send(response);
  } catch (error) {
    if (error instanceof TicabankValidationException) {
      const errorResponse = buildErrorResponse(HttpStatusCodes.BAD_REQUEST, 'quote');
      await reply.code(HttpStatusCodes.BAD_REQUEST).send({
        ...errorResponse,
        detail: `${errorResponse.detail}: ${error.message}`,
      });
    } else {
      request.log.error(error);
      const errorResponse = buildErrorResponse(HttpStatusCodes.INTERNAL_SERVER_ERROR, 'quote');
      await reply.code(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(errorResponse);
    }
  }
}
