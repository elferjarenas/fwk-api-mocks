export const MIBANCO_PARAMS = {
    MIN_AMOUNT: 500,
    MAX_AMOUNT: 10000,

    MIN_PAY_DATE: 1,
    MAX_PAY_DATE: 31,

    MIN_INSTALLMENTS: 6,
    MAX_INSTALLMENTS: 24,

    MAX_CLIENT_CODE: 9999999
} as const;

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const DEFAULT_PAYMENT_DAYS = [7, 15, 22];
