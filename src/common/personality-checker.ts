/**
 * Generic Personality Checker Utility
 * Follows DRY and SOLID principles
 * Reusable across all domains (CIAM, Person, Card, etc.)
 */
export interface PersonalityMatcher {
  startsWith: (prefix: string) => boolean;
  equals: (code: string) => boolean;
}

/**
 * Find personality matching criteria in user's personality array
 * @param personalities - Array of personality codes from user
 * @param matcher - Function to match personality (e.g., startsWith, equals)
 * @returns Matched personality code or null
 */
export function findPersonality(
  personalities: string[] | undefined,
  matcher: (personality: string) => boolean
): string | null {
  if (!personalities || personalities.length === 0) {
    return null;
  }
  
  const found = personalities.find(matcher);
  return found || null;
}

/**
 * Find personality by prefix (e.g., 'YPCIAM')
 */
export function findPersonalityByPrefix(
  personalities: string[] | undefined,
  prefix: string
): string | null {
  return findPersonality(personalities, (p) => p.startsWith(prefix));
}

/**
 * Find exact personality match
 */
export function findExactPersonality(
  personalities: string[] | undefined,
  code: string
): string | null {
  return findPersonality(personalities, (p) => p === code);
}

/**
 * Check if user has any personality from a list
 */
export function hasAnyPersonality(
  personalities: string[] | undefined,
  codes: string[]
): boolean {
  if (!personalities || personalities.length === 0) {
    return false;
  }
  return personalities.some((p) => codes.includes(p));
}
