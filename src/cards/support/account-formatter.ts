/**
 * Account Formatter for Cards V4
 * Formats bank accounts with proper family codes and formatting
 */

import type { Account } from '../../types/user-types.js';
import type { AccountDto } from '../entities/card-dto.js';

export class AccountFormatter {
  /**
   * Format account number based on type
   * AHORROS (14 digits, family 005): 19312345678901 → 193-12345678-9-01
   * CORRIENTE (13 digits, family 004): 1931234567890 → 193-1234567-8-90
   * MAESTRA (13 digits, family 007): 1931234567890 → 193-1234567-8-90
   */
  static formatAccountNumber(accountNumber: string, type: string): string {
    const cleanNumber = accountNumber.replace(/\D/g, '');

    if (type === 'AHORROS' || type === 'CUENTAS DE AHORROS') {
      // 14 digits: XXX-XXXXXXXX-X-XX
      if (cleanNumber.length === 14) {
        return `${cleanNumber.substring(0, 3)}-${cleanNumber.substring(3, 11)}-${cleanNumber.substring(11, 12)}-${cleanNumber.substring(12, 14)}`;
      }
    } else if (type === 'CORRIENTE' || type === 'CUENTA CORRIENTE' || type === 'MAESTRA') {
      // 13 digits: XXX-XXXXXXX-X-XX
      if (cleanNumber.length === 13) {
        return `${cleanNumber.substring(0, 3)}-${cleanNumber.substring(3, 10)}-${cleanNumber.substring(10, 11)}-${cleanNumber.substring(11, 13)}`;
      }
    }

    // Fallback: return as-is if format doesn't match
    return accountNumber;
  }

  /**
   * Get family code based on account type
   */
  static getFamilyCode(type: string): string {
    if (type === 'AHORROS' || type === 'CUENTAS DE AHORROS') {
      return '005';
    } else if (type === 'CORRIENTE' || type === 'CUENTA CORRIENTE') {
      return '004';
    } else if (type === 'MAESTRA') {
      return '007';
    }
    return '000'; // Default
  }

  /**
   * Get currency code and description
   */
  static getCurrency(currency: string): { code: string; description: string } {
    const lowerCurrency = currency.toLowerCase();
    if (lowerCurrency === 'soles' || lowerCurrency === 'pen') {
      return { code: '01', description: 'SOLES' };
    } else if (lowerCurrency === 'dolares' || lowerCurrency === 'usd') {
      return { code: '02', description: 'DOLARES' };
    }
    return { code: '01', description: 'SOLES' }; // Default
  }

  /**
   * Format a single account
   */
  static formatAccount(account: Account): AccountDto {
    const type = account.type || 'AHORROS';
    const formattedNumber = this.formatAccountNumber(account.number, type);
    const familyCode = this.getFamilyCode(type);
    const currency = this.getCurrency(account.currency || 'soles');

    return {
      accountNumber: account.number,
      formattedAccountNumber: formattedNumber,
      currency,
      familyCode,
      type,
    };
  }
}
