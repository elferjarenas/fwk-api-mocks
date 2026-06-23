import {
  createBadRequestException,
  createServerErrorException,
} from '../exceptions/exception-builder.js';
import {
  BadRequestException,
  UnauthorizedException,
  OfferCallFailedException,
  MethodNotAllowedException,
  TooManyRequestsException,
  ServerErrorException,
  OfferTimeoutException,
  OfferNoDataException,
  NotConfirmedException,
  InvalidTermException,
  ProductRegisteredException,
  UnableLeadException,
  LeadSoldException,
  MibancoException,
} from '../exceptions/mibanco-exception.js';
import type { ErrorBody } from '../../common/exceptions.js';
import { 
  getHttpStatusForPersonality, 
  getVariantForPersonality,
  isErrorPersonality 
} from '../utility/personality.js';
import { buildErrorResponse } from '../messages/response.js';
import { UserRepository } from '../../repository/user-repository.js';
import { HttpStatusCodes } from '../../common/http-status-codes.js';
import type { OfferResponseDto, OfferRequestDto } from '../entities/request-dto.js';
import { MibancoPersonality } from '../constants/api-codes.js';
import { OfferRequestValidator } from '../validators/offer-validator.js';
import { findPersonality } from '../../common/personality-checker.js';

/**
 * Get offer for user
 * 
 * Transparent mock behavior:
 * - Busca el usuario específico usando X-User-Email header
 * - Si encuentra personality → simula error según el código
 * - Si NO hay personality → 200 OK con datos por defecto (happy path)
 * 
 * @param request Fastify request (contains headers and body)
 * @param reply Fastify reply
 */
export async function getOffer(
  request: any,
  reply: any
): Promise<void> {
  try {
    const requestBody = request.body as OfferRequestDto;
    
    // Validate request parameters (mirrors Ruby's ConsultOffer.valid?)
    const validator = new OfferRequestValidator(requestBody);
    if (!validator.valid()) {
      const firstError = validator.getFirstError();
      const errorBody = buildErrorResponse(HttpStatusCodes.BAD_REQUEST, 'offer');
      await reply.code(HttpStatusCodes.BAD_REQUEST).send(errorBody);
      return;
    }

    // Get user by X-User-Email header
    const userEmail = (request.headers['x-user-email'] as string)?.toLowerCase();
    let user = userEmail ? UserRepository.getUser(userEmail) : undefined;
    
    // Fallback: search all users if no email header provided
    if (!user) {
      const allUsers = UserRepository.getAllUsers();
      user = allUsers.find(u => u.personalities && u.personalities.some(p => isErrorPersonality('OFFER', p)));
    }

    // Check for error personality
    if (user && user.personalities) {
      const errorPersonality = findPersonality(
        user.personalities,
        (p) => isErrorPersonality('OFFER', p)
      );
      
      if (errorPersonality) {
        const httpStatus = getHttpStatusForPersonality(errorPersonality as MibancoPersonality);
        const variant = getVariantForPersonality(errorPersonality as MibancoPersonality);
        const errorBody = buildErrorResponse(httpStatus || HttpStatusCodes.INTERNAL_SERVER_ERROR, 'offer', variant || undefined);
        await reply.code(errorBody.status).send(errorBody);
        return;
      }
    }

    // Happy path: no error personality found
    const response: OfferResponseDto = {
      status: HttpStatusCodes.OK,
      data: {
        codigoCliente: 3032596,
        montoMaximoOferta: 10000,
        montoMinimoOferta: 500,
      },
    };
    
    await reply.code(HttpStatusCodes.OK).send(response);
  } catch (error) {
    const errorResponse = buildErrorResponse(HttpStatusCodes.INTERNAL_SERVER_ERROR, 'offer');
    await reply.code(HttpStatusCodes.INTERNAL_SERVER_ERROR).send(errorResponse);
  }
}

/**
 * Evaluate personality code and return error response
 * Note: This is only called when personality exists (error simulation)
 * @param personalityCode Personality code (error type)
 * @param user User data from repository
 * @returns Never returns - always throws exception
 */
function evaluatePersonality(
  personalityCode: MibancoPersonality,
  user: { clientCode?: number; maxAmount?: number; minAmount?: number },
): OfferResponseDto {
  const httpStatus = getHttpStatusForPersonality(personalityCode);
  const variant = getVariantForPersonality(personalityCode);

  if (!httpStatus) {
    const errorBody = buildErrorResponse(HttpStatusCodes.INTERNAL_SERVER_ERROR, 'offer');
    throw createServerErrorException(errorBody.detail, errorBody);
  }

  const errorBody = buildErrorResponse(httpStatus, 'offer', variant || undefined);

  throwExceptionForPersonality(personalityCode, errorBody);

  throw createServerErrorException('Unknown error', errorBody);
}

/**
 * Throw exception based on personality code
 * All personalities are for error simulation only
 * @param personalityCode Personality code (error type)
 * @param errorBody Error response body
 */
function throwExceptionForPersonality(
  personalityCode: MibancoPersonality,
  errorBody: ErrorBody,
): never {
  const exceptionMap: Partial<Record<MibancoPersonality, new (message: string, errorBody: ErrorBody) => MibancoException>> = {
    [MibancoPersonality.OFFER_NO_DATA]: OfferNoDataException,
    [MibancoPersonality.OFFER_CALL_FAILED]: OfferCallFailedException,
    [MibancoPersonality.OFFER_CALL_TIMEOUT]: OfferTimeoutException,
    [MibancoPersonality.MIBANCO_BAD_REQUEST]: BadRequestException,
    [MibancoPersonality.MIBANCO_UNAUTHORIZED]: UnauthorizedException,
    [MibancoPersonality.METHOD_NOT_ALLOWED]: MethodNotAllowedException,
    [MibancoPersonality.LOAN_MANY_REQUESTS]: TooManyRequestsException,
    [MibancoPersonality.MIBANCO_SERVER_ERROR]: ServerErrorException,
    [MibancoPersonality.MIBANCO_NOT_CONFIRMED]: NotConfirmedException,
    [MibancoPersonality.MIBANCO_INVALID_TERM]: InvalidTermException,
    [MibancoPersonality.MIBANCO_PRODUCT_REGISTER]: ProductRegisteredException,
    [MibancoPersonality.MIBANCO_UNABLE_LEAD]: UnableLeadException,
    [MibancoPersonality.MIBANCO_LEAD_SOLD]: LeadSoldException,
  };

  const ExceptionClass = exceptionMap[personalityCode] || ServerErrorException;
  throw new ExceptionClass(errorBody.detail, errorBody);
}
