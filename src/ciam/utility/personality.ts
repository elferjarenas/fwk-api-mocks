import { CiamPersonality } from '../constants/api-codes.js';
import { CIAM_PERSONALITY_CONFIG, PersonalityConfig } from '../constants/personality-mappings.js';

export function isCiamPersonality(personality: string): boolean {
  return Object.values(CiamPersonality).includes(personality as CiamPersonality);
}

export function getCiamPersonalityConfig(personality: string): PersonalityConfig | null {
  if (!isCiamPersonality(personality)) {
    return null;
  }
  return CIAM_PERSONALITY_CONFIG[personality as CiamPersonality];
}
