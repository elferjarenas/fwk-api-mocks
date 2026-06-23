/**
 * Offer Request Validator
 * Mirrors Ruby's ConsultOffer parameter validation
 * Validates codigoPaisDocumento and tipoDocumentoIdentidad
 */

import { BaseValidator } from '../../common/validators/base-validator.js';

export interface OfferRequestBody {
  codigoPaisDocumento: string;
  tipoDocumentoIdentidad: string;
}

/**
 * Validates Offer request parameters
 * Equivalent to Ruby's ConsultOffer.valid? and solicitud.errors
 */
export class OfferRequestValidator extends BaseValidator<OfferRequestBody> {
  protected validate(): void {
    // Required fields validation
    if (!this.data.codigoPaisDocumento) {
      this.addError('codigoPaisDocumento', 'codigoPaisDocumento is required');
    }

    if (!this.data.tipoDocumentoIdentidad) {
      this.addError('tipoDocumentoIdentidad', 'tipoDocumentoIdentidad is required');
    }

    // Early return if required fields missing
    if (this.hasErrors()) {
      return;
    }

    // codigoPaisDocumento must be 'PE'
    if (this.data.codigoPaisDocumento !== 'PE') {
      this.addError('codigoPaisDocumento', 'codigoPaisDocumento must be PE');
    }

    // tipoDocumentoIdentidad must be exactly 1 character
    if (this.data.tipoDocumentoIdentidad!.length !== 1) {
      this.addError('tipoDocumentoIdentidad', 'tipoDocumentoIdentidad must be exactly 1 character');
    }

    // tipoDocumentoIdentidad must be 'C' (DNI only)
    if (this.data.tipoDocumentoIdentidad !== 'C') {
      this.addError('tipoDocumentoIdentidad', 'tipoDocumentoIdentidad must be C (DNI only)');
    }
  }
}
