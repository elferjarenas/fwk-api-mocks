import request from 'supertest';
import { HttpStatusCodes } from '../../src/common/http-status-codes';
import { TEST_CONFIG } from '../config/test-config';
import { toYamlString, formatPersonalityChange } from '../helpers/yape-endpoints.helper';

/**
 * E2E Tests for Mibanco Paydate API
 * Endpoint: GET /creditos-yape/servicing/servicing-order/v1/simulacion/obtener-dias-pago
 */

describe('Mibanco Paydate API (e2e)', () => {
  const BASE_URL = TEST_CONFIG.baseUrl;
  const PAYDATE_ENDPOINT = '/creditos-yape/servicing/servicing-order/v1/simulacion/obtener-dias-pago';
  const USER_IDC = '12345678'; // cards_basic user from seed-test.yml
  
  // No beforeAll needed - user already in seed-test.yml
  
  describe('Success Scenarios', () => {
    it('should return 200 with payment days (no personality)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPMIBANCO'));

      const response = await request(BASE_URL)
        .get(PAYDATE_ENDPOINT)
        .expect(HttpStatusCodes.OK);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.OK);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('numeroDiasPago');
      expect(Array.isArray(response.body.data.numeroDiasPago)).toBe(true);
      expect(response.body.data.numeroDiasPago).toEqual([7, 15, 22]);
    });
  });

  describe('Business Error Scenarios (202)', () => {
    it('should return 202 Accepted - No Data (YPTPLI011)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPTPLI011'));

      const response = await request(BASE_URL)
        .get(PAYDATE_ENDPOINT)
        .expect(HttpStatusCodes.ACCEPTED);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.ACCEPTED);
      expect(response.body).toHaveProperty('type');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('detail');
      expect(response.body).toHaveProperty('instance', 'paydate.obtener');
      expect(response.body.title).toContain('error funcional');
    });

    it('should return 404 Not Found - Call Failed (YPTPLI012)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPTPLI012'));

      const response = await request(BASE_URL)
        .get(PAYDATE_ENDPOINT)
        .expect(HttpStatusCodes.NOT_FOUND);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('instance', 'obtener.dias');
    });

    it('should return 504 Gateway Timeout (YPTPLI022)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPTPLI022'));

      const response = await request(BASE_URL)
        .get(PAYDATE_ENDPOINT)
        .expect(HttpStatusCodes.GATEWAY_TIMEOUT);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.GATEWAY_TIMEOUT);
      expect(response.body).toHaveProperty('instance', 'paydate.obtener');
    });
  });

  describe('HTTP Error Scenarios (4xx/5xx)', () => {
    it('should return 400 Bad Request (YPMBADREQ)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPMBADREQ'));

      const response = await request(BASE_URL)
        .get(PAYDATE_ENDPOINT)
        .expect(HttpStatusCodes.BAD_REQUEST);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('instance', 'paydate.obtener');
      expect(response.body.title).toContain('sintaxis incorrecta');
    });

    it('should return 401 Unauthorized (YPUNAUTHZ)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPUNAUTHZ'));

      const response = await request(BASE_URL)
        .get(PAYDATE_ENDPOINT)
        .expect(HttpStatusCodes.UNAUTHORIZED);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.UNAUTHORIZED);
      expect(response.body).toHaveProperty('instance', 'paydate.obtener');
      expect(response.body.title).toContain('token inválido');
    });

    it('should return 500 Internal Server Error (YPSERVERR)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPSERVERR'));

      const response = await request(BASE_URL)
        .get(PAYDATE_ENDPOINT)
        .expect(HttpStatusCodes.INTERNAL_SERVER_ERROR);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body).toHaveProperty('instance', 'paydate.obtener');
      expect(response.body.title).toContain('error interno');
    });
  });

  describe('Response Validation', () => {
    it('should return valid payment day numbers between 1 and 31', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPMIBANCO'));

      const response = await request(BASE_URL)
        .get(PAYDATE_ENDPOINT)
        .expect(HttpStatusCodes.OK);

      const paymentDays = response.body.data.numeroDiasPago;
      expect(paymentDays.length).toBeGreaterThan(0);
      
      paymentDays.forEach((day: number) => {
        expect(day).toBeGreaterThanOrEqual(1);
        expect(day).toBeLessThanOrEqual(31);
        expect(Number.isInteger(day)).toBe(true);
      });
    });
  });
});
