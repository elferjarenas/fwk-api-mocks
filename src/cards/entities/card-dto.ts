export interface CardDto {
  cardId: string;
  status: {
    code: string;
    description: string;
  };
  cardHolder?: {
    fullName: string;
    personId: string;
  };
  cic?: string;
  openingDate: string;
  expirationDate: string;
  lastChangeDate: string;
  electronicCommerceEnabled?: boolean;
  abroadUsageEnabled?: boolean;
  lastTransactionDate?: string;
  tokenAffiliated?: boolean;
  replacedCardId?: string;
  internetAccessStatus: {
    code: string;
    description: string;
  };
  cardType: {
    code: string;
    description: string;
  };
  products?: ProductDto[];
}

export interface ProductDto {
  productType: string;
  productNumber: string;
  accounts: AccountDto[];
}

export interface AccountDto {
  accountNumber: string;
  formattedAccountNumber: string;
  currency: {
    code: string;
    description: string;
  };
  familyCode: string;
  type: string;
}

export interface UpdateCardRequestDto {
  ecommerceEnabled?: boolean;
  abroadUseEnabled?: boolean;
}
