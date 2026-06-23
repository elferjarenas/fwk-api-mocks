/**
 * Transfer Request DTO
 * Defines the structure for account transfer requests
 */

export interface ChargeMeanInformation {
  chargeProduct?: ChargeProduct;
}

export interface ChargeProduct {
  referenceId?: string; // Account number to charge from
}

export interface DepositMeanInformation {
  depositProduct?: DepositProduct;
}

export interface DepositProduct {
  referenceId?: string; // Account number to deposit to
}

export interface TransferRequestBody {
  chargeMeanInformation?: ChargeMeanInformation;
  depositMeanInformation?: DepositMeanInformation;
  amount?: number;
  comments?: string;
}
