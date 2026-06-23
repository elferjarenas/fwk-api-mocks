import { HttpStatusCodes } from '../../common/http-status-codes.js';
import { MibancoPersonality } from '../constants/api-codes.js';
import { ErrorVariant, VARIANT_BY_PERSONALITY, HTTP_STATUS_BY_PERSONALITY } from '../constants/personality-mappings.js';
import { PERSONALITY_BY_API, SUCCESS_PERSONALITIES } from '../constants/personality-mappings.js';

/**
 * Check if personality code is known/valid
 * @param personality Personality code string
 * @returns true if valid personality code
 */
export function isKnownPersonality(personality: string): boolean {
  return Object.values(MibancoPersonality).includes(personality as MibancoPersonality);
}

/**
 * Get HTTP status code for personality
 * @param personality Personality code
 * @returns HTTP status code or null if not found
 */
export function getHttpStatusForPersonality(personality: MibancoPersonality): number | null {
  return HTTP_STATUS_BY_PERSONALITY[personality] || null;
}

/**
 * Get error variant for personality (used for 202 errors)
 * @param personality Personality code
 * @returns Error variant or null
 */
export function getVariantForPersonality(personality: MibancoPersonality): ErrorVariant | null {
  return VARIANT_BY_PERSONALITY[personality] || null;
}

/**
 * Check if personality is an error personality for a specific API
 * 
 * Uses O(1) Set lookups for performance instead of O(n) array includes.
 * Follows Open/Closed Principle: adding new APIs only requires updating
 * PERSONALITY_BY_API constant, no code changes here.
 * 
 * @param apiType - API type (OFFER, PAYDATE, SIMULATE, QUOTE, REGISTER)
 * @param personality - Personality code string
 * @returns true if error personality (matches API and is valid)
 */
export function isErrorPersonality(apiType: string, personality: string): boolean {
  if (!isKnownPersonality(personality)) {
    return false;
  }

  const personalityEnum = personality as MibancoPersonality;

  // Success personalities are never errors
  if (SUCCESS_PERSONALITIES.has(personalityEnum)) {
    return false;
  }

  // Check global errors first (apply to all APIs)
  if (PERSONALITY_BY_API.GLOBAL.has(personalityEnum)) {
    return true;
  }

  // Check API-specific errors
  const apiErrors = PERSONALITY_BY_API[apiType];
  return apiErrors ? apiErrors.has(personalityEnum) : false;
}

/**
 * Get HTTP status code for error personality
 * @param apiType - API type (OFFER, PAYDATE, SIMULATE, QUOTE, REGISTER)
 * @param personality - Personality code string
 * @returns HTTP status code (defaults to 500 if not found)
 */
export function getPersonalityErrorCode(apiType: string, personality: string): number {
  const personalityCode = personality as MibancoPersonality;
  return getHttpStatusForPersonality(personalityCode) || HttpStatusCodes.INTERNAL_SERVER_ERROR;
}
