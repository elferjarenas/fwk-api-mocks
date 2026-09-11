import { HttpStatusCodes } from '../../src/common/http-status-codes';
import request from 'supertest';
import { TEST_CONFIG } from '../config/test-config';
import { formatPersonalityChange } from '../helpers/testing-endpoints.helper';

const CARDS_DETAIL_ENDPOINT = '/bs-card-v4/customer-management/product-service/v4/cards';

describe('Cards V4 - Card Detail (E2E)', () => {
  const BASE_URL = TEST_CONFIG.baseUrl;
  const USER_IDC = '55555555'; // cards_detail user from seed-test.yml

  afterEach(async () => {
    // Restore default personality after each test to avoid affecting other tests
    await request(BASE_URL)
      .post('/testing/ChangeUserPersonality')
      .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPCARD000'));
  });

  describe('GET /bs-card-v4/customer-management/product-service/v4/cards/:cardId', () => {
    // ===================================
    // Happy path: 200 + campos
    // ===================================

    it('should return complete card detail with all fields', async () => {
      // Explicitly set YPCARD000 for success path
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPCARD000'));

      const response = await request(BASE_URL)
        .get(`${CARDS_DETAIL_ENDPOINT}/4557880000111122`)
        .set('branch-office-code', 'BR001')
        .set('user-code', 'USER001');

      expect(response.status).toBe(HttpStatusCodes.OK);
      
      const card = response.body;
      
      expect(card).toMatchObject({
        cardId: '4557880000111122',
        status: {
          code: '00',
          description: 'CONFIRMADA',
        },
        openingDate: expect.any(String),
        expirationDate: '2028-09-01',
        lastChangeDate: expect.any(String),
        cardType: {
          code: '00',
          description: 'PHYSICAL',
        },
        cardHolder: {
          fullName: expect.any(String),
          personId: expect.stringContaining('000'),
        },
        cic: '00055555',
        electronicCommerceEnabled: true,
        internetAccessStatus: {
          code: '0',
          description: 'None',
        },
        lastTransactionDate: '2021-12-16',
      });
    });

    // ===================================
    // Personalities
    // ===================================

    it('should return 503 for YPCARD002 (timeout)', async () => {
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPCARD002'));

      const response = await request(BASE_URL)
        .get(`${CARDS_DETAIL_ENDPOINT}/4557880000111122`)
        .set('branch-office-code', 'BR001')
        .set('user-code', 'USER001');

      expect(response.status).toBe(HttpStatusCodes.SERVICE_UNAVAILABLE);
      expect(response.body.code).toBe('SERVICE_UNAVAILABLE');
    });

    it('should return 500 for YPCARD008 (error backend)', async () => {
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPCARD008'));

      const response = await request(BASE_URL)
        .get(`${CARDS_DETAIL_ENDPOINT}/4557880000111122`)
        .set('branch-office-code', 'BR001')
        .set('user-code', 'USER001');

      expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    });
  });
});
