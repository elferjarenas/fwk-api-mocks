/**
 * Facial Verification Validator
 * Validates POST /channel/ciam/mobile-login/v{1,2}/identification-methods/facial-verification
 * Mimics Ruby validation: flowProcessId and biometricData are required
 */

import { BaseValidator } from '../../common/validators/base-validator.js';

export interface FacialVerificationBody {
  workflow?: string;
  action?: string;
  processData?: {
    flowProcessId?: string;
  };
  biometricData?: {
    faceImage?: string;
    selfieImage?: string;
    facialPattern?: string;
    [key: string]: unknown;
  };
}

export class FacialVerificationValidator extends BaseValidator<FacialVerificationBody> {
  protected validate(): void {
    // Validate flowProcessId (can be in processData or root for testing)
    const flowProcessId = this.data.processData?.flowProcessId || (this.data as any).flowProcessId;
    if (!flowProcessId) {
      this.addError('flowProcessId', 'flowProcessId is required');
    }

    // Validate biometricData (can be direct or nested)
    const biometricData = this.data.biometricData;
    if (!biometricData || (typeof biometricData === 'object' && Object.keys(biometricData).length === 0)) {
      this.addError('biometricData', 'biometricData is required');
    }
  }
}
