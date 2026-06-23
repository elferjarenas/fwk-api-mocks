/**
 * Transfer Response DTO
 * Defines the structure for account transfer responses
 */

export interface BalanceInformation {
  currentBalance?: number;
  availableBalance?: number;
  currency?: string;
}

export interface ChargeMeanResponseInformation {
  chargeProduct?: ChargeProductResponse;
  balanceInformation?: BalanceInformation;
}

export interface ChargeProductResponse {
  referenceId: string; // Formatted account number (with dashes)
  productTypeId: string;
}

export interface DepositMeanResponseInformation {
  depositProduct?: DepositProductResponse;
  balanceInformation?: BalanceInformation;
}

export interface DepositProductResponse {
  referenceId: string; // Formatted account number (with dashes)
  productTypeId: string;
}

export interface TransferResponseBody {
  accountTransferId: string;
  amount: number;
  comments?: string;
  chargeMeanInformation?: ChargeMeanResponseInformation;
  depositMeanInformation?: DepositMeanResponseInformation;
}

/**
 * Atlas Error Response (for fraud, insufficient funds, etc.)
 */
export interface AtlasErrorResponse {
  errorCode: string;
  errorDescription: string;
  errorData?: Record<string, unknown>;
}
