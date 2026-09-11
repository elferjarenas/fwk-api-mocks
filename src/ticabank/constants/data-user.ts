/**
 * Ticabank User Data Mapping
 * Maps user identifiers (email/IDC) to Ticabank-specific data (clientCode, limits, etc.)
 * Follows Ruby architecture: seed has generic users, this file provides Ticabank data
 */

export interface TicabankUserData {
  clientCode: number;
  maxAmount: number;
  minAmount: number;
  email: string;
  days?: number[];
}

export class TicabankUser {
  private static readonly DATA_USER: TicabankUserData[] = [
    {
      clientCode: 3032596,
      maxAmount: 10000,
      minAmount: 500,
      email: 'cards_basic@test.com.pe', // Reusing existing seed user
      days: [7, 15, 22],
    },
    {
      clientCode: 2008016,
      maxAmount: 10000,
      minAmount: 500,
      email: 'cards_detail@test.com.pe',
    },
    {
      clientCode: 2138213,
      maxAmount: 4850,
      minAmount: 500,
      email: 'cards_none@test.com.pe',
    },
    {
      clientCode: 3185492,
      maxAmount: 9850,
      minAmount: 500,
      email: 'ciam_enrollment@test.com.pe',
    },
  ];

  /**
   * Get Ticabank data for a user by email
   */
  static getByEmail(email: string): TicabankUserData | undefined {
    return this.DATA_USER.find(u => u.email === email);
  }

  /**
   * Get Ticabank data for a user by clientCode
   */
  static getByClientCode(clientCode: number): TicabankUserData | undefined {
    return this.DATA_USER.find(u => u.clientCode === clientCode);
  }

  /**
   * Get all Ticabank users
   */
  static getAll(): TicabankUserData[] {
    return [...this.DATA_USER];
  }
}
