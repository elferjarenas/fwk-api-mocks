import request from 'supertest';
import { HttpStatusCodes } from '../../src/common/http-status-codes';
import { TEST_CONFIG } from '../config/test-config';
import { toYamlString, formatPersonalityChange } from '../helpers/yape-endpoints.helper';

/**
 * E2E Tests for Mibanco Register API
 * Endpoint: POST /creditos-yape/loans-deposits/consumer-loan/v1/desembolso/generar
 */

const REGISTER_ENDPOINT = '/creditos-yape/loans-deposits/consumer-loan/v1/desembolso/generar';

describe('Mibanco Register API (e2e)', () => {
  const BASE_URL = TEST_CONFIG.baseUrl;
  const USER_IDC = '12345678';


  // Valid base request body
  const validRequest = {
    codigoCliente: '3032596',
    montoSolicitado: '2000',
    cantidadCuotas: '12',
    numeroDiaPago: '15',
    loanId: '123e4567-e89b-12d3-a456-426614174000',
    encryptedData: {
      data: 'encryptedPayload123',
      key: 'encryptionKey456',
      iv: 'initVector789',
    },
  };

  describe('Success Scenarios', () => {
    it('should return 201 CREATED for valid registration', async () => {
      // Set YPMIBANCO for success scenario
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPMIBANCO'));

      const response = await request(BASE_URL)
        .post(REGISTER_ENDPOINT)
        .send(validRequest)
        .expect(HttpStatusCodes.CREATED);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.CREATED);
    });
  });

  describe('Business Error Scenarios (202)', () => {
    it('should return 202 Accepted - No Data (YPTPLI025)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPTPLI025'));

      const response = await request(BASE_URL)
        .post(REGISTER_ENDPOINT)
        .send(validRequest)
        .expect(HttpStatusCodes.ACCEPTED);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.ACCEPTED);
      expect(response.body).toHaveProperty('instance', 'register.crear');
    });

    it('should return 404 Not Found - Call Failed (YPTPLI019)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPTPLI019'));

      const response = await request(BASE_URL)
        .post(REGISTER_ENDPOINT)
        .send(validRequest)
        .expect(HttpStatusCodes.NOT_FOUND);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('instance', 'desembolso.generar');
    });

    it('should return 504 Gateway Timeout (YPTPLI024)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPTPLI024'));

      const response = await request(BASE_URL)
        .post(REGISTER_ENDPOINT)
        .send(validRequest)
        .expect(HttpStatusCodes.GATEWAY_TIMEOUT);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.GATEWAY_TIMEOUT);
      expect(response.body).toHaveProperty('instance', 'register.crear');
    });
  });

  describe('HTTP Error Scenarios (4xx/5xx)', () => {
    it('should return 400 Bad Request (YPMBADREQ)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPMBADREQ'));

      const response = await request(BASE_URL)
        .post(REGISTER_ENDPOINT)
        .send(validRequest)
        .expect(HttpStatusCodes.BAD_REQUEST);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.BAD_REQUEST);
      expect(response.body).toHaveProperty('instance', 'register.crear');
    });

    it('should return 401 Unauthorized (YPUNAUTHZ)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPUNAUTHZ'));

      await request(BASE_URL)
        .post(REGISTER_ENDPOINT)
        .send(validRequest)
        .expect(HttpStatusCodes.UNAUTHORIZED);
    });

    it('should return 500 Internal Server Error (YPSERVERR)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPSERVERR'));

      await request(BASE_URL)
        .post(REGISTER_ENDPOINT)
        .send(validRequest)
        .expect(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    });
  });
});
