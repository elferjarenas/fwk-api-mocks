import { FastifyReply, FastifyRequest } from 'fastify';
import { getPersonalityErrorCode, isErrorPersonality, getVariantForPersonality } from '../utility/personality.js';
import { buildErrorResponse } from '../messages/response.js';
import { PaydateResponse } from '../entities/paydate-dto.js';
import { HttpStatusCodes } from '../../common/http-status-codes.js';
import { UserRepository } from '../../repository/user-repository.js';
import { MibancoPersonality } from '../constants/api-codes.js';
import { DEFAULT_PAYMENT_DAYS } from '../constants/parameters.js';
import { findPersonality } from '../../common/personality-checker.js';

/**
 * Process the Paydate request and return available payment days
 * 
 * @param request - Fastify request object
 * @param reply - Fastify reply object
 * @returns PaydateResponse with payment days or error
 */
export async function getPaymentDates(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<FastifyReply> {
  try {
    // Get user by X-User-Email header
    const userEmail = (request.headers['x-user-email'] as string)?.toLowerCase();
    let user = userEmail ? UserRepository.getUser(userEmail) : undefined;
    
    // Fallback: search all users if no email header provided
    if (!user) {
      const allUsers = UserRepository.getAllUsers();
      user = allUsers.find(u => u.personalities && u.personalities.some(p => isErrorPersonality('PAYDATE', p)));
    }
    
    // Check for error personality
    if (user && user.personalities) {
      const errorPersonality = findPersonality(
        user.personalities,
        (p) => isErrorPersonality('PAYDATE', p)
      );
      
      if (errorPersonality) {
        const statusCode = getPersonalityErrorCode('PAYDATE', errorPersonality);
        const variant = getVariantForPersonality(errorPersonality as MibancoPersonality);
        const errorResponse = buildErrorResponse(statusCode, 'paydate', variant || undefined);
        return reply.code(statusCode).send(errorResponse);
      }
    }

    const response: PaydateResponse = {
      status: HttpStatusCodes.OK,
      data: {
        numeroDiasPago: DEFAULT_PAYMENT_DAYS
      }
    };
    
    return reply.status(HttpStatusCodes.OK).send(response);
  } catch (error) {
    const errorResponse = buildErrorResponse(HttpStatusCodes.INTERNAL_SERVER_ERROR, 'paydate');
    return reply.code(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(errorResponse);
  }
}
