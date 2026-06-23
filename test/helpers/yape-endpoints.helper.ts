import * as yaml from 'js-yaml';

/**
 * Helper functions for Ruby-compatible /yape/* endpoints
 */

/**
 * Convert user data array to YAML string for /yape/populate
 * @param users Array of user data objects
 * @returns YAML string representation
 */
export function toYamlString(users: any[]): string {
  return yaml.dump(users);
}

/**
 * Format personality change request for /yape/ChangeUserPersonality
 * @param idc User IDC number
 * @param personality Personality code
 * @returns Text format: "idc,personality"
 */
export function formatPersonalityChange(idc: string | number, personality: string): string {
  return `${idc},${personality}`;
}
