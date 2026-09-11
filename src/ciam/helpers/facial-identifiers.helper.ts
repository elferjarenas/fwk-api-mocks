/**
 * Facial Identifiers Helper
 * Handles GET /ux-biom-mobile-facial-overview-v1/channel/biom/v1/mobile-facial-overview/facial-identifiers
 * 
 * Ruby equivalent: CiamHelper.get_mock_v4(env, params, logger)
 */

import { UserRepository } from '../../repository/user-repository.js';
import { HttpStatusCodes } from '../../common/http-status-codes.js';
import { getCiamPersonalityConfig } from '../utility/personality.js';
import { findPersonalityByPrefix } from '../../common/personality-checker.js';
import { createCiamException } from '../exceptions/exception-builder.js';
import { getErrorTemplate } from '../messages/templates.js';

export interface FacialIdentifiersResponse {
  facialIdentifiers: Array<{
    id: string;
    status: string;
    createdAt: string;
  }>;
}

/**
 * Get facial identifiers overview
 */
export function getFacialIdentifiers(headers: Record<string, unknown>): FacialIdentifiersResponse {
  // Validate Authorization header
  if (!headers['authorization']) {
    const template = getErrorTemplate(HttpStatusCodes.FORBIDDEN, 'FORBIDDEN');
    throw createCiamException(
      HttpStatusCodes.FORBIDDEN,
      'MISSING_AUTHORIZATION',
      template?.description || 'Missing Authorization header'
    );
  }

  // Get user by X-User-Email header (like Ticabank)
  const userEmail = (headers['x-user-email'] as string)?.toLowerCase();
  let user = userEmail ? UserRepository.getUser(userEmail) : undefined;
  
  // Fallback: search through all users if header not provided
  if (!user) {
    const allUsers = UserRepository.getAllUsers();
    
    // Find user with CIAM ERROR personality
    user = allUsers.find(u => {
      const ciamPersonality = findPersonalityByPrefix(u.personalities, 'YPCIAM');
      if (!ciamPersonality) return false;
      const config = getCiamPersonalityConfig(ciamPersonality);
      return config?.error !== undefined;
    });
    
    // If no error personality found, use first user with any CIAM personality
    if (!user) {
      user = allUsers.find(u => findPersonalityByPrefix(u.personalities, 'YPCIAM'));
    }
  }

  if (!user) {
    const template = getErrorTemplate(HttpStatusCodes.INTERNAL_SERVER_ERROR, 'INTERNAL');
    throw createCiamException(
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
      'NO_USER_FOUND',
      template?.description || 'No user found'
    );
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
        template?.description || 'Facial identifiers error'
      );
    }
  }

  // Success: return facial identifiers
  return {
    facialIdentifiers: ciamPersonality === 'YPCIAMENR' ? [
      {
        id: 'facial-id-001',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      }
    ] : []
  };
}
