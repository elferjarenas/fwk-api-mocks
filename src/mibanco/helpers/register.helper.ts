/**
 * Register Helper for Mibanco
 * Endpoint: POST /creditos-yape/loans-deposits/consumer-loan/v1/desembolso/generar
 * 
 * Handles loan registration/disbursement
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { RegisterRequest, RegisterResponse } from '../entities/register-dto.js';
import { getPersonalityErrorCode, isErrorPersonality, getVariantForPersonality } from '../utility/personality.js';
import { buildErrorResponse } from '../messages/response.js';
import { createValidationException } from '../exceptions/exception-builder.js';
import { MibancoValidationException } from '../exceptions/mibanco-exception.js';
import { HttpStatusCodes } from '../../common/http-status-codes.js';
import { UserRepository } from '../../repository/user-repository.js';
import { MibancoPersonality } from '../constants/api-codes.js';
import { RegisterRequestValidator } from '../validators/register-validator.js';
import { findPersonality } from '../../common/personality-checker.js';

/**
 * Register loan (POST)
 * 
 * Body parameters:
 * - codigoCliente: Customer code (required, numeric, max 9999999)
 * - montoSolicitado: Requested amount (required, 500-10000)
 * - cantidadCuotas: Number of installments (required, 6-24)
 * - numeroDiaPago: Payment day (required, 1-31)
 * - loanId: Loan UUID (required, RFC 4122 format)
 * - encryptedData: Encrypted data object (required)
 *   - data: Encrypted data payload (required, non-empty)
 *   - key: Encryption key (required, non-empty)
 *   - iv: Initialization vector (required, non-empty)
 * 
 * @param request - Fastify request
 * @param reply - Fastify reply
 */
export async function registerLoan(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const body = request.body as Partial<RegisterRequest>;
    const validator = new RegisterRequestValidator(body);

    if (!validator.valid()) {
      const firstError = validator.getFirstError();
      throw createValidationException(firstError?.message || 'Validation failed');
    }

    // Get user by X-User-Email header
    const userEmail = (request.headers['x-user-email'] as string)?.toLowerCase();
    let user = userEmail ? UserRepository.getUser(userEmail) : undefined;
    
    // Fallback: search all users if no email header provided
    if (!user) {
      const allUsers = UserRepository.getAllUsers();
      user = allUsers.find(u => u.personalities && u.personalities.some(p => isErrorPersonality('REGISTER', p)));
    }
    
    // Check for error personality
    if (user && user.personalities) {
      const errorPersonality = findPersonality(
        user.personalities,
        (p) => isErrorPersonality('REGISTER', p)
      );
      
      if (errorPersonality) {
        const statusCode = getPersonalityErrorCode('REGISTER', errorPersonality);
        const variant = getVariantForPersonality(errorPersonality as MibancoPersonality);
        const errorResponse = buildErrorResponse(statusCode, 'register', variant || undefined);
        await reply.code(statusCode).send(errorResponse);
        return;
      }
    }

    const response: RegisterResponse = {
      status: HttpStatusCodes.CREATED,
    };

    await reply.code(HttpStatusCodes.CREATED).send(response);
  } catch (error) {
    if (error instanceof MibancoValidationException) {
      const errorResponse = buildErrorResponse(HttpStatusCodes.BAD_REQUEST, 'register');
      errorResponse.detail = `${errorResponse.detail}: ${error.message}`;
      await reply.code(HttpStatusCodes.BAD_REQUEST).send(errorResponse);
    } else {
      request.log.error(error);
      const errorResponse = buildErrorResponse(HttpStatusCodes.INTERNAL_SERVER_ERROR, 'register');
      await reply.code(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(errorResponse);
    }
  }
}
