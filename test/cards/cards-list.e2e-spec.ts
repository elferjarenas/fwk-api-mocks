import { HttpStatusCodes } from '../../src/common/http-status-codes';
import request from 'supertest';
import { TEST_CONFIG } from '../config/test-config';
import { formatPersonalityChange } from '../helpers/yape-endpoints.helper';

const CARDS_LIST_ENDPOINT = '/bs-card-v4/customer-management/product-service/v4/cards';

describe('Cards V4 - List Cards (E2E)', () => {
  const BASE_URL = TEST_CONFIG.baseUrl;
  const USER_IDC = '12345678'; // cards_basic user from seed-test.yml (has 3 cards)

  afterEach(async () => {
    // Restore default personality after each test to avoid affecting other tests
    await request(BASE_URL)
      .post('/yape/ChangeUserPersonality')
      .set('Content-Type', 'text/plain')
      .send(formatPersonalityChange(USER_IDC, 'YPCARD000'));
  });

  describe('GET /bs-card-v4/customer-management/product-service/v4/cards', () => {
    // ===================================
    // Happy path: 200 + campos
    // ===================================

    it('should return list of 3 properly formatted cards', async () => {
      // Explicitly set YPCARD000 for success path
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPCARD000'));

      const response = await request(BASE_URL)
        .get(CARDS_LIST_ENDPOINT)
        .query({ personId: '12345678000' })
        .set('branch-office-code', 'BR001')
        .set('user-code', 'USER001');

      expect(response.status).toBe(HttpStatusCodes.OK);
      
      const cards = response.body;
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBe(3);

      // Validate first card structure
      expect(cards[0]).toMatchObject({
        cardId: '4557881234567890',
        status: {
          code: '00',
          description: 'CONFIRMADA',
        },
        openingDate: expect.any(String),
        expirationDate: '2025-12-01',
        lastChangeDate: expect.any(String),
        tokenAffiliated: false,
        replacedCardId: expect.any(String),
        internetAccessStatus: {
          code: '3',
          description: 'Activa',
        },
        cardType: {
          code: '00',
          description: 'PHYSICAL',
        },
      });

      // Validate second card (DIGITAL)
      expect(cards[1]).toMatchObject({
        cardId: '4557889876543210',
        cardType: {
          code: '01',
          description: 'DIGITAL',
        },
        expirationDate: '2026-06-01',
      });

      // Validate third card (different status)
      expect(cards[2]).toMatchObject({
        cardId: '4557885555666677',
        status: {
          code: '06',
          description: 'BLOQUEO INTERNO',
        },
      });
    });

    // ===================================
    // Personalities
    // ===================================

    it('should return 401 for YPCARD001 (error token)', async () => {
      const personalityResponse = await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPCARD001'));
      
      expect(personalityResponse.status).toBe(HttpStatusCodes.OK); // Verify personality change succeeded
      await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for propagation

      const response = await request(BASE_URL)
        .get(CARDS_LIST_ENDPOINT)
        .query({ personId: '12345678000' })
        .set('branch-office-code', 'BR001')
        .set('user-code', 'USER001');

      expect(response.status).toBe(HttpStatusCodes.UNAUTHORIZED);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    it('should return 503 for YPCARD002 (timeout)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPCARD002'));

      const response = await request(BASE_URL)
        .get(CARDS_LIST_ENDPOINT)
        .query({ personId: '12345678000' })
        .set('branch-office-code', 'BR001')
        .set('user-code', 'USER001');

      expect(response.status).toBe(HttpStatusCodes.SERVICE_UNAVAILABLE);
      expect(response.body.code).toBe('SERVICE_UNAVAILABLE');
    });

    it('should return 400 for YPCARD003 (IDC inválido)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPCARD003'));

      const response = await request(BASE_URL)
        .get(CARDS_LIST_ENDPOINT)
        .query({ personId: '12345678000' })
        .set('branch-office-code', 'BR001')
        .set('user-code', 'USER001');

      expect(response.status).toBe(HttpStatusCodes.BAD_REQUEST);
      expect(response.body.code).toBe('BAD_REQUEST');
    });

    it('should return 500 for YPCARD004 (servicio no disponible)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPCARD004'));

      const response = await request(BASE_URL)
        .get(CARDS_LIST_ENDPOINT)
        .query({ personId: '12345678000' })
        .set('branch-office-code', 'BR001')
        .set('user-code', 'USER001');

      expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return 500 for YPCARD005 (circuit breaker 500)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPCARD005'));

      const response = await request(BASE_URL)
        .get(CARDS_LIST_ENDPOINT)
        .query({ personId: '12345678000' })
        .set('branch-office-code', 'BR001')
        .set('user-code', 'USER001');

      expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('should return 503 for YPCARD006 (circuit breaker 503)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPCARD006'));

      const response = await request(BASE_URL)
        .get(CARDS_LIST_ENDPOINT)
        .query({ personId: '12345678000' })
        .set('branch-office-code', 'BR001')
        .set('user-code', 'USER001');

      expect(response.status).toBe(HttpStatusCodes.SERVICE_UNAVAILABLE);
    });

    it('should return 409 for YPCARD007 (servicio externo)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPCARD007'));

      const response = await request(BASE_URL)
        .get(CARDS_LIST_ENDPOINT)
        .query({ personId: '12345678000' })
        .set('branch-office-code', 'BR001')
        .set('user-code', 'USER001');

      expect(response.status).toBe(HttpStatusCodes.CONFLICT);
    });

    it('should return 500 for YPCARD008 (error backend)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPCARD008'));

      const response = await request(BASE_URL)
        .get(CARDS_LIST_ENDPOINT)
        .query({ personId: '12345678000' })
        .set('branch-office-code', 'BR001')
        .set('user-code', 'USER001');

      expect(response.status).toBe(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    });
  });
});
