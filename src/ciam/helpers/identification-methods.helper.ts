/**
 * Identification Methods Helper
 * Handles GET /channel/ciam/mobile-login/v1/identification-methods
 * Handles GET /channel/ciam/mobile-login/v2/identification-methods
 * 
 * Ruby equivalent: CiamHelper.get_mock(env, params, logger)
 */

import { UserRepository } from '../../repository/user-repository.js';
import { UserService } from '../../common/user-service.js';
import { HttpStatusCodes } from '../../common/http-status-codes.js';
import { getCiamPersonalityConfig } from '../utility/personality.js';
import { findPersonalityByPrefix } from '../../common/personality-checker.js';
import { createCiamException } from '../exceptions/exception-builder.js';
import { getErrorTemplate } from '../messages/templates.js';

export interface IdentificationMethodsResponse {
  identificationMethods: Array<{
    type: string;
    status: string;
  }>;
}

/**
 * Get identification methods (v1 or v2)
 * Returns list of available identification methods for user
 */
export function getIdentificationMethods(headers: Record<string, unknown>): IdentificationMethodsResponse {
  // Validate required headers (matching Ruby)
  if (!headers['authorization']) {
    const template = getErrorTemplate(HttpStatusCodes.FORBIDDEN, 'FORBIDDEN');
    throw createCiamException(
      HttpStatusCodes.FORBIDDEN,
      'MISSING_AUTHORIZATION',
      template?.description || 'Missing Authorization header'
    );
  }

  if (!headers['app-code'] || !headers['caller-name']) {
    const template = getErrorTemplate(HttpStatusCodes.UNAUTHORIZED, 'UNAUTHORIZED');
    throw createCiamException(
      HttpStatusCodes.UNAUTHORIZED,
      'MISSING_REQUIRED_HEADERS',
      template?.description || 'Missing APP_CODE or CALLER_NAME headers'
    );
  }

  // Get user by X-User-Email header (like Mibanco)
  const userEmail = (headers['x-user-email'] as string)?.toLowerCase();
  let user = userEmail ? UserRepository.getUser(userEmail) : undefined;
  
  // Fallback: search through all users if header not provided
  if (!user) {
    const users = UserRepository.getAllUsers();

    if (!users || users.length === 0) {
      const template = getErrorTemplate(HttpStatusCodes.INTERNAL_SERVER_ERROR, 'INTERNAL');
      throw createCiamException(
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
        'NO_USER_FOUND',
        template?.description || 'No user found'
      );
    }
    
    // Find user with CIAM ERROR personality
    user = users.find(u => {
      const ciamPersonality = findPersonalityByPrefix(u.personalities, 'YPCIAM');
      if (!ciamPersonality) return false;
      const config = getCiamPersonalityConfig(ciamPersonality);
      return config?.error !== undefined;
    });
    
    // If no error personality found, use first user with any CIAM personality
    if (!user) {
      user = users.find(u => findPersonalityByPrefix(u.personalities, 'YPCIAM'));
    }
    
    // If still no user, use first user
    if (!user) {
      user = users[0];
    }
  }

  // Check personality for error scenarios
  const ciamPersonality = findPersonalityByPrefix(user.personalities, 'YPCIAM');
  
  if (ciamPersonality) {
    const config = getCiamPersonalityConfig(ciamPersonality);
    
    if (config?.error) {
      const template = getErrorTemplate(config.statusCode, config.error);
      throw createCiamException(
        config.statusCode,
        config.error,
        template?.description || 'Identification methods error'
      );
    }
  }

  // Determine enrollment status based on personality
  // YPCIAMENR = enrolled, YPCIAM000 or no personality = not enrolled
  const isEnrolled = ciamPersonality === 'YPCIAMENR';

  // Success: return available identification methods
  return {
    identificationMethods: [
      {
        type: 'FACIAL',
        status: isEnrolled ? 'ENROLLED' : 'NOT_ENROLLED'
      },
      {
        type: 'PIN',
        status: 'ENROLLED'
      }
    ]
  };
}
