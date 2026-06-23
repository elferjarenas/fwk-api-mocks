import { AtlasPersonalityCode } from '../constants/api-codes';

/**
 * Get Atlas personality configuration
 */
export function getAtlasPersonalityConfig(personality: string): {
  code: AtlasPersonalityCode;
  description: string;
} | null {
  const configs: Record<string, { code: AtlasPersonalityCode; description: string }> = {
    [AtlasPersonalityCode.ATLAS_SUCCESS]: {
      code: AtlasPersonalityCode.ATLAS_SUCCESS,
      description: 'Successful account transfer',
    },
    [AtlasPersonalityCode.ATLAS_LYNX_FRAUD]: {
      code: AtlasPersonalityCode.ATLAS_LYNX_FRAUD,
      description: 'Lynx fraud detection - transaction denied',
    },
    [AtlasPersonalityCode.ATLAS_INSUFFICIENT_FUNDS]: {
      code: AtlasPersonalityCode.ATLAS_INSUFFICIENT_FUNDS,
      description: 'Insufficient funds for transfer',
    },
  };

  return configs[personality] || null;
}
