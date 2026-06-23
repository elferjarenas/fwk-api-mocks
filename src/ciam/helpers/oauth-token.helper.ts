/**
 * OAuth Token Helper
 * Handles POST /auth/oauth/v2/token
 * 
 * Ruby equivalent: CiamHelper.response_oauth_token
 */

import { HttpStatusCodes } from '../../common/http-status-codes.js';

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

/**
 * Generate OAuth token response
 * Simple mock that always returns a valid token
 * Uses timestamp + random to ensure uniqueness even for rapid consecutive calls
 */
export function generateOAuthToken(): OAuthTokenResponse {
  const uniqueId = Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  return {
    access_token: 'mock_access_token_' + uniqueId,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: 'mock_refresh_token_' + uniqueId
  };
}
