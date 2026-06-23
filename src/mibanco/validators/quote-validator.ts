/**
 * Quote Request Validator
 * Validates query parameters for quote/schedule generation
 */

import { MIBANCO_PARAMS } from '../constants/parameters.js';
import { BaseValidator } from '../../common/validators/base-validator.js';

export interface QuoteQuery {
  codigoCliente?: string;
  montoSolicitado?: string;
  cantidadCuotas?: string;
  numeroDiaPago?: string;
}

/**
 * Validates Quote request parameters
 */
export class QuoteRequestValidator extends BaseValidator<QuoteQuery> {
  protected validate(): void {
    // Required fields validation
    if (!this.data.codigoCliente) {
      this.addError('codigoCliente', 'codigoCliente is required');
    }

    if (!this.data.montoSolicitado) {
      this.addError('montoSolicitado', 'montoSolicitado is required');
    }

    if (!this.data.cantidadCuotas) {
      this.addError('cantidadCuotas', 'cantidadCuotas is required');
    }

    if (!this.data.numeroDiaPago) {
      this.addError('numeroDiaPago', 'numeroDiaPago is required');
    }

    // Early return if required fields missing
    if (this.hasErrors()) {
      return;
    }

    // Type validations
    const montoSolicitado = Number(this.data.montoSolicitado);
    if (isNaN(montoSolicitado)) {
      this.addError('montoSolicitado', 'montoSolicitado must be a valid number');
    } else if (montoSolicitado < MIBANCO_PARAMS.MIN_AMOUNT || montoSolicitado > MIBANCO_PARAMS.MAX_AMOUNT) {
      this.addError('montoSolicitado', `montoSolicitado must be between ${MIBANCO_PARAMS.MIN_AMOUNT} and ${MIBANCO_PARAMS.MAX_AMOUNT}`);
    }

    const cantidadCuotas = Number(this.data.cantidadCuotas);
    if (isNaN(cantidadCuotas)) {
      this.addError('cantidadCuotas', 'cantidadCuotas must be a valid number');
    } else if (cantidadCuotas < MIBANCO_PARAMS.MIN_INSTALLMENTS || cantidadCuotas > MIBANCO_PARAMS.MAX_INSTALLMENTS) {
      this.addError('cantidadCuotas', `cantidadCuotas must be between ${MIBANCO_PARAMS.MIN_INSTALLMENTS} and ${MIBANCO_PARAMS.MAX_INSTALLMENTS}`);
    }

    const numeroDiaPago = Number(this.data.numeroDiaPago);
    if (isNaN(numeroDiaPago)) {
      this.addError('numeroDiaPago', 'numeroDiaPago must be a valid number');
    } else if (numeroDiaPago < MIBANCO_PARAMS.MIN_PAY_DATE || numeroDiaPago > MIBANCO_PARAMS.MAX_PAY_DATE) {
      this.addError('numeroDiaPago', `numeroDiaPago must be between ${MIBANCO_PARAMS.MIN_PAY_DATE} and ${MIBANCO_PARAMS.MAX_PAY_DATE}`);
    }
  }

  // Getters for parsed values
  getCodigoCliente(): number | null {
    const value = Number(this.data.codigoCliente);
    return isNaN(value) ? null : value;
  }

  getMontoSolicitado(): number | null {
    const value = Number(this.data.montoSolicitado);
    return isNaN(value) ? null : value;
  }

  getCantidadCuotas(): number | null {
    const value = Number(this.data.cantidadCuotas);
    return isNaN(value) ? null : value;
  }

  getNumeroDiaPago(): number | null {
    const value = Number(this.data.numeroDiaPago);
    return isNaN(value) ? null : value;
  }
}
