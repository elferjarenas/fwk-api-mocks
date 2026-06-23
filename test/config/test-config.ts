/**
 * Shared test configuration
 * Centralized configuration for all E2E tests
 */

export const TEST_CONFIG = {
  /**
   * Base URL for API requests
   * Can be overridden via API_URL environment variable
   */
  baseUrl: process.env.API_URL || 'http://localhost:5050',
  
  /**
   * Test timeout in milliseconds
   */
  timeout: 30000,
} as const;
