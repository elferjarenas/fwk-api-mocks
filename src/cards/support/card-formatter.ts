import { CARD_STATUS, CARD_TYPE, INTERNET_ACCESS_STATUS } from '../constants/parameters.js';
import { CardDto, ProductDto } from '../entities/card-dto.js';
import type { Card, User as SystemUser } from '../../types/user-types.js';
import { AccountFormatter } from './account-formatter.js';

export class CardFormatter {
  /**
   * Formatea una card básica (para lista)
   * @param card - Card data from system
   * @param includeProducts - If true, includes products array with formatted accounts
   */
  static formatCard(card: Card, includeProducts = false): CardDto {
    const status = this.getCardStatus(card.status);
    const cardType = this.getCardType(card.card_type_description);
    const expirationDate = this.formatExpirationDate(card.expiry_date);

    const baseDto: CardDto = {
      cardId: card.number,
      status,
      openingDate: '2021-02-05',
      expirationDate,
      lastChangeDate: '2021-02-05',
      tokenAffiliated: false,
      replacedCardId: '455788',
      internetAccessStatus: INTERNET_ACCESS_STATUS.ACTIVE,
      cardType,
    };

    // Add products if requested and card has accounts
    if (includeProducts) {
      baseDto.products = this.buildProducts(card);
    }

    return baseDto;
  }

  /**
   * Formatea card con detalles completos (incluye cardHolder, cic, etc.)
   * @param card - Card data from system
   * @param user - User data for cardHolder info
   * @param includeProducts - If true, includes products array with formatted accounts
   */
  static formatCardDetail(card: Card, user: SystemUser, includeProducts = false): CardDto {
    const basicDto = this.formatCard(card, includeProducts);

    return {
      ...basicDto,
      cardHolder: {
        fullName: (user.name || '').toUpperCase(),
        personId: (user.idc || user.documentNumber || '') + '000',
      },
      cic: user.cic || (user.phone_number || '').substring(1, 9),
      electronicCommerceEnabled: (card.electronic_commerce as any) === true || card.electronic_commerce === 'true' || card.electronic_commerce === '1',
      abroadUsageEnabled: (card.abroadUsageEnabled as any) === true || card.abroadUsageEnabled === 'true' || card.abroadUsageEnabled === '1',
      lastTransactionDate: '2021-12-16',
      internetAccessStatus: INTERNET_ACCESS_STATUS.NONE,
    };
  }

  /**
   * Build products array from card accounts
   */
  private static buildProducts(card: Card): ProductDto[] {
    if (!card.accounts || card.accounts.length === 0) {
      return [];
    }

    const formattedAccounts = card.accounts.map((account) => AccountFormatter.formatAccount(account));

    return [
      {
        productType: 'CARD',
        productNumber: card.number,
        accounts: formattedAccounts,
      },
    ];
  }

  /**
   * Obtiene el status de la card según el código
   */
  private static getCardStatus(statusCode: string): { code: string; description: string } {
    const entry = Object.values(CARD_STATUS).find((s) => s.code === statusCode);
    return entry || CARD_STATUS.CONFIRMED;
  }

  /**
   * Obtiene el tipo de card
   */
  private static getCardType(typeDescription: string | undefined): { code: string; description: string } {
    if (!typeDescription) return CARD_TYPE.PHYSICAL;
    return typeDescription.toUpperCase() === 'DIGITAL' ? CARD_TYPE.DIGITAL : CARD_TYPE.PHYSICAL;
  }

  /**
   * Formatea fecha de expiración
   * Input: "12/25" (mes/año)
   * Output: "2025-12-01"
   */
  private static formatExpirationDate(expiryDate: string): string {
    const [month, year] = expiryDate.split('/');
    return `20${year}-${month}-01`;
  }

  /**
   * Genera UUID v4
   */
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
