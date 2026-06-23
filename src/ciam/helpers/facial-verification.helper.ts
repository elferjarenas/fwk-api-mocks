/**
 * Facial Verification Helper
 * Handles POST /channel/ciam/mobile-login/v1/identification-methods/facial-verification
 * Handles POST /channel/ciam/mobile-login/v2/identification-methods/facial-verification
 * 
 * Ruby equivalent: CiamHelper.is_enrollment_workflow? + post_ciam_facial_enroll/post_ciam_facial_auth
 */

import { UserRepository } from '../../repository/user-repository.js';
import { HttpStatusCodes } from '../../common/http-status-codes.js';
import { getCiamPersonalityConfig } from '../utility/personality.js';
import { findPersonalityByPrefix } from '../../common/personality-checker.js';
import { buildEnrollmentResponse, buildAuthenticationResponse } from '../messages/response.js';
import { getErrorTemplate } from '../messages/templates.js';
import { createValidationException, createCiamException } from '../exceptions/exception-builder.js';
import { FacialVerificationValidator, FacialVerificationBody } from '../validators/facial-verification-validator.js';

/**
 * Detect if request is enrollment workflow (matching Ruby logic)
 */
function isEnrollmentWorkflow(body: FacialVerificationBody): boolean {
  // Ruby: CiamHelper.is_enrollment_workflow?(req_body, logger)
  // Check workflow field or action field
  return body.workflow === 'ENROLLMENT' || body.action === 'ENROLL';
}

/**
 * Process facial verification (enrollment or authentication)
 */
export function processFacialVerification(body: Partial<FacialVerificationBody>, headers?: Record<string, unknown>): unknown {
  // Validate request (Ruby validates flowProcessId and biometricData)
  const validator = new FacialVerificationValidator(body);
  if (!validator.valid()) {
    const error = validator.getFirstError();
    throw createValidationException(error?.message || 'Invalid request');
  }

  // Get user by X-User-Email header (like Mibanco)
  const userEmail = headers && (headers['x-user-email'] as string)?.toLowerCase();
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
        template?.description || 'Facial verification error'
      );
    }
  }

  // Detect workflow and return appropriate response
  if (isEnrollmentWorkflow(body as FacialVerificationBody)) {
    // Enrollment workflow
    return buildEnrollmentResponse(
      user.name?.split(' ')[0] || 'Juan',
      user.name?.split(' ')[1] || 'Perez',
      'Amat'
    );
  } else {
    // Authentication workflow
    return buildAuthenticationResponse();
  }
}
