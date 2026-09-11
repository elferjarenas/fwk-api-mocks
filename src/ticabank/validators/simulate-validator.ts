/**
 * Simulate Request Validator
 * Validates query parameters for loan simulation
 */

import { TICABANK_PARAMS } from '../constants/parameters.js';
import { BaseValidator } from '../../common/validators/base-validator.js';

export interface SimulateQuery {
  codigoCliente?: string;
  montoSolicitado?: string;
  numeroDiaPago?: string;
}

/**
 * Validates Simulate request parameters
 */
export class SimulateRequestValidator extends BaseValidator<SimulateQuery> {
  protected validate(): void {
    // Required fields validation
    if (!this.data.codigoCliente) {
      this.addError('codigoCliente', 'codigoCliente is required');
    }

    if (!this.data.montoSolicitado) {
      this.addError('montoSolicitado', 'montoSolicitado is required');
    }

    if (!this.data.numeroDiaPago) {
      this.addError('numeroDiaPago', 'numeroDiaPago is required');
    }

    // Early return if required fields missing
    if (this.hasErrors()) {
      return;
    }

    // Type validations
    const codigoCliente = parseInt(this.data.codigoCliente!, 10);
    if (isNaN(codigoCliente)) {
      this.addError('codigoCliente', 'codigoCliente must be a number');
    } else if (codigoCliente <= 0 || codigoCliente > TICABANK_PARAMS.MAX_CLIENT_CODE) {
      this.addError('codigoCliente', `codigoCliente must be between 1 and ${TICABANK_PARAMS.MAX_CLIENT_CODE}`);
    }

    const montoSolicitado = parseFloat(this.data.montoSolicitado!);
    if (isNaN(montoSolicitado)) {
      this.addError('montoSolicitado', 'montoSolicitado must be a number');
    } else if (montoSolicitado < TICABANK_PARAMS.MIN_AMOUNT || montoSolicitado > TICABANK_PARAMS.MAX_AMOUNT) {
      this.addError('montoSolicitado', `montoSolicitado must be between ${TICABANK_PARAMS.MIN_AMOUNT} and ${TICABANK_PARAMS.MAX_AMOUNT}`);
    }

    const numeroDiaPago = parseInt(this.data.numeroDiaPago!, 10);
    if (isNaN(numeroDiaPago)) {
      this.addError('numeroDiaPago', 'numeroDiaPago must be a number');
    } else if (numeroDiaPago < TICABANK_PARAMS.MIN_PAY_DATE || numeroDiaPago > TICABANK_PARAMS.MAX_PAY_DATE) {
      this.addError('numeroDiaPago', `numeroDiaPago must be between ${TICABANK_PARAMS.MIN_PAY_DATE} and ${TICABANK_PARAMS.MAX_PAY_DATE}`);
    }
  }

  // Getters for parsed values (only if valid)
  getCodigoCliente(): number | null {
    const value = parseInt(this.data.codigoCliente || '', 10);
    return isNaN(value) ? null : value;
  }

  getMontoSolicitado(): number | null {
    const value = parseFloat(this.data.montoSolicitado || '');
    return isNaN(value) ? null : value;
  }

  getNumeroDiaPago(): number | null {
    const value = parseInt(this.data.numeroDiaPago || '', 10);
    return isNaN(value) ? null : value;
  }
}
