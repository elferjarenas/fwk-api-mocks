import request from 'supertest';
import { HttpStatusCodes } from '../../src/common/http-status-codes';
import { TEST_CONFIG } from '../config/test-config';
import { toYamlString, formatPersonalityChange } from '../helpers/testing-endpoints.helper';

/**
 * E2E Tests for Atlas Account Transfers API
 * Endpoint: POST /support-core-account-transfer/v1/account-transfers
 * 
 * Tests ONLY 3 scenarios:
 * 1. Successful transfer (YPATLS001)
 * 2. Lynx fraud detection (YPATLSLYX)
 * 3. Insufficient funds (YPATLSINS)
 */

const TRANSFER_ENDPOINT = '/support-core-account-transfer/v1/account-transfers';

describe('Atlas Account Transfers API (e2e)', () => {
  const BASE_URL = TEST_CONFIG.baseUrl;
  const SENDER_IDC = '55555555'; // cards_detail user from seed-test.yml
  
  // No beforeAll needed - users already in seed-test.yml

  // Valid base request body (real Atlas structure)
  const validRequest = {
    type: {
      code: 'TX',
    },
    currency: {
      code: 'PEN',
    },
    amount: 100,
    chargeMeanInformation: {
      chargeMeanType: {
        code: 'CTAD',
      },
      chargeProduct: {
        referenceId: '19300001111221', // cards_detail account from seed-test.yml
        productDetail: {
          currency: {
            code: 'PEN',
          },
          family: {
            code: '004',
          },
          product: {
            code: '016',
          },
        },
      },
      utc: '4701',
      referenceDescriptions: [
        {
          description: 'TRANSFERENCIA CARGO',
        },
      ],
    },
    depositMeanInformation: {
      depositMeanType: {
        code: 'CTAD',
      },
      depositProduct: {
        referenceId: '19300001111222', // Different account for receiver (second account of same user)
        productDetail: {
          currency: {
            code: 'PEN',
          },
          family: {
            code: '005',
          },
          product: {
            code: '017',
          },
        },
      },
      utc: '2402',
      referenceDescriptions: [
        {
          description: 'YPP916740c58d554ce9aa',
        },
      ],
    },
    exchangeRateInformation: {
      classification: {
        code: 'NOR',
      },
      dealType: {
        code: 'C',
      },
      referenceDescription: {
        description: '',
      },
    },
  };

  describe('Success Scenarios', () => {
    it('should return 200 OK for successful transfer (YPATLS001)', async () => {
      // Set success personality
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(SENDER_IDC, 'YPATLS001'))
        .expect(HttpStatusCodes.OK);

      const response = await request(BASE_URL)
        .post(TRANSFER_ENDPOINT)
        .send(validRequest)
        .expect(HttpStatusCodes.OK);

      // Verify response structure
      expect(response.body).toHaveProperty('accountTransferId');
      expect(response.body).toHaveProperty('chargeMeanInformation');
      expect(response.body).toHaveProperty('depositMeanInformation');

      // Verify sender data
      expect(response.body.chargeMeanInformation.chargeProduct.referenceId).toBe('19300001111221');
      expect(response.body.chargeMeanInformation.accountHolder.fullName).toBe('JUAN PEREZ DETAIL');
      expect(response.body.chargeMeanInformation.chargeProduct.balanceInformation.accountingAmount).toBe(14900);

      // Verify receiver data
      expect(response.body.depositMeanInformation.depositProduct.referenceId).toBe('19300001111222');
      expect(response.body.depositMeanInformation.accountHolder.fullName).toBe('JUAN PEREZ DETAIL');
      expect(response.body.depositMeanInformation.depositProduct.balanceInformation.accountingAmount).toBe(5100);

      // Verify success message
      expect(response.body.chargeMeanInformation.accountTransfer.messageDescriptions[0].description).toBe(
        'OTL1 TS0000 I: PROCESO COMPLETO'
      );
    });
  });

  describe('Error Scenarios - Lynx Fraud Detection', () => {
    it('should return 500 with TL0003/LX0000 error (YPATLSLYX)', async () => {
      // Set Lynx fraud personality
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(SENDER_IDC, 'YPATLSLYX'))
        .expect(HttpStatusCodes.OK);

      const response = await request(BASE_URL)
        .post(TRANSFER_ENDPOINT)
        .send(validRequest)
        .expect(HttpStatusCodes.INTERNAL_SERVER_ERROR);

      // Verify error structure
      expect(response.body).toHaveProperty('code', 'TL0003');
      expect(response.body).toHaveProperty('description', 'Los datos proporcionados no son válidos.');
      expect(response.body).toHaveProperty('errorType', 'FUNCTIONAL');

      // Verify exception details
      expect(response.body.exceptionDetails).toHaveLength(1);
      expect(response.body.exceptionDetails[0]).toMatchObject({
        code: 'LX0000',
        component: 'atlas-cross-services-payments-payment-execution-account-transfers',
        description: 'TRANSACCION DENEGADA POR RIESGO DE FRAUDE.',
      });
    });
  });

  describe('Error Scenarios - Insufficient Funds', () => {
    it('should return 500 with TL0007/GN4904 error for insufficient funds (YPATLSINS)', async () => {
      // Set insufficient funds personality
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(SENDER_IDC, 'YPATLSINS'))
        .expect(HttpStatusCodes.OK);

      const response = await request(BASE_URL)
        .post(TRANSFER_ENDPOINT)
        .send(validRequest)
        .expect(HttpStatusCodes.INTERNAL_SERVER_ERROR);

      // Verify error structure
      expect(response.body).toHaveProperty('code', 'TL0007');
      expect(response.body).toHaveProperty('description', 'Ocurrio un error en el servicio externo.');
      expect(response.body).toHaveProperty('errorType', 'FUNCTIONAL');

      // Verify exception details
      expect(response.body.exceptionDetails).toHaveLength(4);
      expect(response.body.exceptionDetails[3]).toMatchObject({
        code: 'GN4904',
        component: 'MB.ProdTrsfV2',
        description: 'IM80 IM6100 F: INSUFFICIENT FUNDS - DEBI',
      });
    });
  });

  describe('Validation Scenarios', () => {
    beforeEach(async () => {
      // Set success personality for validation tests
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(SENDER_IDC, 'YPATLS001'))
        .expect(HttpStatusCodes.OK);
    });

    it('should return 400 for missing chargeMeanInformation', async () => {
      const response = await request(BASE_URL)
        .post(TRANSFER_ENDPOINT)
        .send({
          amount: 100,
          depositMeanInformation: validRequest.depositMeanInformation,
        })
        .expect(HttpStatusCodes.BAD_REQUEST);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('chargeMeanInformation');
    });

    it('should return 400 for invalid amount (zero)', async () => {
      const response = await request(BASE_URL)
        .post(TRANSFER_ENDPOINT)
        .send({
          ...validRequest,
          amount: 0,
        })
        .expect(HttpStatusCodes.BAD_REQUEST);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('amount must be greater than 0');
    });

    it('should return 404 for non-existent sender account', async () => {
      const response = await request(BASE_URL)
        .post(TRANSFER_ENDPOINT)
        .send({
          ...validRequest,
          chargeMeanInformation: {
            ...validRequest.chargeMeanInformation,
            chargeProduct: {
              ...validRequest.chargeMeanInformation.chargeProduct,
              referenceId: '99999999999999',
            },
          },
        })
        .expect(HttpStatusCodes.NOT_FOUND);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Sender account');
    });
  });
});
