/**
 * Transfer Request Validator
 * Ruby-style validator with valid() and getErrors() pattern
 * Validates the real Atlas API request structure
 */

export interface TransferRequestBody {
  type?: {
    code?: string;
  };
  currency?: {
    code?: string;
  };
  amount?: number;
  chargeMeanInformation?: {
    chargeMeanType?: {
      code?: string;
    };
    chargeProduct?: {
      referenceId?: string;
      productDetail?: {
        currency?: {
          code?: string;
        };
        family?: {
          code?: string;
        };
        product?: {
          code?: string;
        };
      };
    };
    utc?: string;
    referenceDescriptions?: Array<{
      description?: string;
    }>;
  };
  depositMeanInformation?: {
    depositMeanType?: {
      code?: string;
    };
    depositProduct?: {
      referenceId?: string;
      productDetail?: {
        currency?: {
          code?: string;
        };
        family?: {
          code?: string;
        };
        product?: {
          code?: string;
        };
      };
    };
    utc?: string;
    referenceDescriptions?: Array<{
      description?: string;
    }>;
  };
  exchangeRateInformation?: {
    classification?: {
      code?: string;
    };
    dealType?: {
      code?: string;
    };
    referenceDescription?: {
      description?: string;
    };
  };
}

interface ValidationError {
  field: string;
  message: string;
}

export class TransferValidator {
  private errors: ValidationError[] = [];

  constructor(private body: Partial<TransferRequestBody>) {
    this.validate();
  }

  private validate(): void {
    // Validate amount
    if (this.body.amount === undefined || this.body.amount === null) {
      this.errors.push({
        field: 'amount',
        message: 'amount is required',
      });
    } else if (typeof this.body.amount !== 'number') {
      this.errors.push({
        field: 'amount',
        message: 'amount must be a number',
      });
    } else if (this.body.amount <= 0) {
      this.errors.push({
        field: 'amount',
        message: 'amount must be greater than 0',
      });
    }

    // Validate chargeMeanInformation (sender)
    if (!this.body.chargeMeanInformation) {
      this.errors.push({
        field: 'chargeMeanInformation',
        message: 'chargeMeanInformation is required',
      });
    } else {
      const chargeProduct = this.body.chargeMeanInformation.chargeProduct;
      if (!chargeProduct || !chargeProduct.referenceId) {
        this.errors.push({
          field: 'chargeMeanInformation.chargeProduct.referenceId',
          message: 'Sender account referenceId is required',
        });
      } else if (typeof chargeProduct.referenceId !== 'string' || chargeProduct.referenceId.length === 0) {
        this.errors.push({
          field: 'chargeMeanInformation.chargeProduct.referenceId',
          message: 'Sender account referenceId must be a non-empty string',
        });
      }
    }

    // Validate depositMeanInformation (receiver)
    if (!this.body.depositMeanInformation) {
      this.errors.push({
        field: 'depositMeanInformation',
        message: 'depositMeanInformation is required',
      });
    } else {
      const depositProduct = this.body.depositMeanInformation.depositProduct;
      if (!depositProduct || !depositProduct.referenceId) {
        this.errors.push({
          field: 'depositMeanInformation.depositProduct.referenceId',
          message: 'Receiver account referenceId is required',
        });
      } else if (typeof depositProduct.referenceId !== 'string' || depositProduct.referenceId.length === 0) {
        this.errors.push({
          field: 'depositMeanInformation.depositProduct.referenceId',
          message: 'Receiver account referenceId must be a non-empty string',
        });
      }
    }

    // Validate accounts are different
    const senderAccount = this.body.chargeMeanInformation?.chargeProduct?.referenceId;
    const receiverAccount = this.body.depositMeanInformation?.depositProduct?.referenceId;
    
    if (
      senderAccount &&
      receiverAccount &&
      senderAccount === receiverAccount
    ) {
      this.errors.push({
        field: 'accounts',
        message: 'Sender and receiver accounts must be different',
      });
    }
  }

  /**
   * Check if validation passed
   */
  valid(): boolean {
    return this.errors.length === 0;
  }

  /**
   * Get all validation errors
   */
  getErrors(): ValidationError[] {
    return this.errors;
  }

  /**
   * Get first validation error
   */
  getFirstError(): ValidationError | null {
    return this.errors.length > 0 ? this.errors[0] : null;
  }
}
