/**
 * Build successful transfer response
 */
export function buildSuccessfulTransferResponse(data: {
  accountTransferId: string;
  senderAccountNumber: string;
  senderAccountNumberDashed: string;
  senderBalance: number;
  senderName: string;
  receiverAccountNumber: string;
  receiverAccountNumberDashed: string;
  receiverBalance: number;
  receiverName: string;
}): unknown {
  return {
    accountTransferId: data.accountTransferId,
    chargeMeanInformation: {
      chargeMeanType: {
        code: 'CTAD',
      },
      chargeProduct: {
        referenceId: data.senderAccountNumber,
        formattedProductNumber: data.senderAccountNumberDashed,
        balanceInformation: {
          accountingAmount: data.senderBalance,
          availableAmount: data.senderBalance,
        },
      },
      accountHolder: {
        fullName: data.senderName,
      },
      accountTransfer: {
        messageDescriptions: [
          {
            description: 'OTL1 TS0000 I: PROCESO COMPLETO',
          },
        ],
      },
    },
    depositMeanInformation: {
      depositMeanType: {
        code: 'CTAD',
      },
      depositProduct: {
        referenceId: data.receiverAccountNumber,
        formattedProductNumber: data.receiverAccountNumberDashed,
        balanceInformation: {
          accountingAmount: data.receiverBalance,
          availableAmount: data.receiverBalance,
        },
      },
      accountHolder: {
        fullName: data.receiverName,
      },
    },
  };
}

/**
 * Build Lynx fraud detection error response
 */
export function buildLynxFraudErrorResponse(): unknown {
  return {
    code: 'TL0003',
    description: 'Los datos proporcionados no son válidos.',
    errorType: 'FUNCTIONAL',
    exceptionDetails: [
      {
        code: 'LX0000',
        component: 'atlas-cross-services-payments-payment-execution-account-transfers',
        description: 'TRANSACCION DENEGADA POR RIESGO DE FRAUDE.',
      },
    ],
  };
}

/**
 * Build insufficient funds error response
 */
export function buildInsufficientFundsErrorResponse(): unknown {
  return {
    code: 'TL0007',
    description: 'Ocurrio un error en el servicio externo.',
    errorType: 'FUNCTIONAL',
    exceptionDetails: [
      {
        component: 'atlas-cross-services-payments-payment-execution-account-transfers',
      },
      {
        code: 'TL0007',
        component: 'MB.ProdTrsfV2',
        description: 'Ocurrio un error en el servicio externo.',
      },
      {
        code: 'MB4904',
        component: 'MB.ProdTrsfV2',
      },
      {
        code: 'GN4904',
        component: 'MB.ProdTrsfV2',
        description: 'IM80 IM6100 F: INSUFFICIENT FUNDS - DEBI',
      },
    ],
  };
}
