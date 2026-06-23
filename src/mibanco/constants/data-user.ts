/**
 * Mibanco User Data Mapping
 * Maps user identifiers (email/IDC) to Mibanco-specific data (clientCode, limits, etc.)
 * Follows Ruby architecture: seed has generic users, this file provides Mibanco data
 */

export interface MibancoUserData {
  clientCode: number;
  maxAmount: number;
  minAmount: number;
  email: string;
  days?: number[];
}

export class MibancoUser {
  private static readonly DATA_USER: MibancoUserData[] = [
    {
      clientCode: 3032596,
      maxAmount: 10000,
      minAmount: 500,
      email: 'cards_basic@test-yape.com.pe', // Reusing existing seed user
      days: [7, 15, 22],
    },
    {
      clientCode: 2008016,
      maxAmount: 10000,
      minAmount: 500,
      email: 'cards_detail@test-yape.com.pe',
    },
    {
      clientCode: 2138213,
      maxAmount: 4850,
      minAmount: 500,
      email: 'cards_none@test-yape.com.pe',
    },
    {
      clientCode: 3185492,
      maxAmount: 9850,
      minAmount: 500,
      email: 'ciam_enrollment@test-yape.com.pe',
    },
  ];

  /**
   * Get Mibanco data for a user by email
   */
  static getByEmail(email: string): MibancoUserData | undefined {
    return this.DATA_USER.find(u => u.email === email);
  }

  /**
   * Get Mibanco data for a user by clientCode
   */
  static getByClientCode(clientCode: number): MibancoUserData | undefined {
    return this.DATA_USER.find(u => u.clientCode === clientCode);
  }

  /**
   * Get all Mibanco users
   */
  static getAll(): MibancoUserData[] {
    return [...this.DATA_USER];
  }
}
