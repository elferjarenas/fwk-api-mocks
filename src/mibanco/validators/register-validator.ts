/**
 * Register Request Validator
 * Validates body parameters for loan registration/disbursement
 */

import { MIBANCO_PARAMS, UUID_REGEX } from '../constants/parameters.js';
import { BaseValidator } from '../../common/validators/base-validator.js';

export interface RegisterRequestBody {
  codigoCliente?: string;
  montoSolicitado?: string;
  cantidadCuotas?: string;
  numeroDiaPago?: string;
  loanId?: string;
  encryptedData?: {
    data?: string;
    key?: string;
    iv?: string;
  };
}

/**
 * Validates Register request parameters
 */
export class RegisterRequestValidator extends BaseValidator<RegisterRequestBody> {
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

    if (!this.data.loanId) {
      this.addError('loanId', 'loanId is required');
    }

    if (!this.data.encryptedData) {
      this.addError('encryptedData', 'encryptedData is required');
    } else {
      // encryptedData nested validations
      if (!this.data.encryptedData.data) {
        this.addError('encryptedData.data', 'encryptedData.data is required');
      }
      if (!this.data.encryptedData.key) {
        this.addError('encryptedData.key', 'encryptedData.key is required');
      }
      if (!this.data.encryptedData.iv) {
        this.addError('encryptedData.iv', 'encryptedData.iv is required');
      }
    }

    // Early return if required fields missing
    if (this.hasErrors()) {
      return;
    }

    // Type validations
    const montoSolicitado = this.data.montoSolicitado!;
    const amount = Number(montoSolicitado);
    if (isNaN(amount)) {
      this.addError('montoSolicitado', 'montoSolicitado must be a number');
    } else if (amount < MIBANCO_PARAMS.MIN_AMOUNT || amount > MIBANCO_PARAMS.MAX_AMOUNT) {
      this.addError('montoSolicitado', `montoSolicitado must be between ${MIBANCO_PARAMS.MIN_AMOUNT} and ${MIBANCO_PARAMS.MAX_AMOUNT}`);
    }

    const cantidadCuotas = this.data.cantidadCuotas!;
    const term = Number(cantidadCuotas);
    if (isNaN(term)) {
      this.addError('cantidadCuotas', 'cantidadCuotas must be a number');
    } else if (term < MIBANCO_PARAMS.MIN_INSTALLMENTS || term > MIBANCO_PARAMS.MAX_INSTALLMENTS) {
      this.addError('cantidadCuotas', `cantidadCuotas must be between ${MIBANCO_PARAMS.MIN_INSTALLMENTS} and ${MIBANCO_PARAMS.MAX_INSTALLMENTS}`);
    }

    const numeroDiaPago = this.data.numeroDiaPago!;
    const paymentDay = Number(numeroDiaPago);
    if (isNaN(paymentDay)) {
      this.addError('numeroDiaPago', 'numeroDiaPago must be a number');
    } else if (paymentDay < MIBANCO_PARAMS.MIN_PAY_DATE || paymentDay > MIBANCO_PARAMS.MAX_PAY_DATE) {
      this.addError('numeroDiaPago', `numeroDiaPago must be between ${MIBANCO_PARAMS.MIN_PAY_DATE} and ${MIBANCO_PARAMS.MAX_PAY_DATE}`);
    }

    // loanId format validation
    if (this.data.loanId && !UUID_REGEX.test(this.data.loanId)) {
      this.addError('loanId', 'loanId must be a valid UUID');
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
