import request from 'supertest';
import { HttpStatusCodes } from '../../src/common/http-status-codes';
import { TEST_CONFIG } from '../config/test-config';
import { formatPersonalityChange } from '../helpers/testing-endpoints.helper';

/**
 * E2E Tests for CIAM Facial Verification (Authentication workflow)
 * Endpoint: POST /channel/ciam/mobile-login/v1/identification-methods/facial-verification
 */

const AUTHENTICATION_ENDPOINT = '/channel/ciam/mobile-login/v1/identification-methods/facial-verification';

describe('CIAM Facial Verification - Authentication (e2e)', () => {
  const BASE_URL = TEST_CONFIG.baseUrl;
  const USER_IDC = '45678902'; // ciam_auth from seed-test.yml
  const USER_EMAIL = 'test004@test.com.pe';

  // Valid base request body (authentication workflow)
  const validRequest = {
    workflow: 'AUTHENTICATION', // Identifica authentication workflow
    flowProcessId: '550e8400-e29b-41d4-a716-446655440001',
    biometricData: {
      faceImage: 'base64EncodedImage',
      timestamp: Date.now(),
    },
  };

  describe('Success Scenarios', () => {
    it('should return 200 OK for successful authentication (no personality)', async () => {
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPCIAM000'));

      const response = await request(BASE_URL)
        .post(AUTHENTICATION_ENDPOINT)
        .set('X-User-Email', USER_EMAIL)
        .send(validRequest)
        .expect(HttpStatusCodes.OK);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('id_token');
      expect(response.body).toHaveProperty('refresh_token');
      expect(response.body).toHaveProperty('token_type', 'bearer');
      expect(response.body).toHaveProperty('expires_in', 300);
      expect(response.body).toHaveProperty('scope');
      
      // Verify token format (UUID)
      expect(response.body.access_token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(response.body.id_token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(response.body.refresh_token).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });
  });

  describe('Error Scenarios (4xx/5xx)', () => {
    it('should return 401 for token expired (YPCIAM401)', async () => {
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain').send(formatPersonalityChange(USER_IDC, 'YPCIAM401'))
        .expect(HttpStatusCodes.OK);

      const response = await request(BASE_URL)
        .post(AUTHENTICATION_ENDPOINT)
        .set('X-User-Email', USER_EMAIL)
        .send(validRequest)
        .expect(HttpStatusCodes.UNAUTHORIZED);

      expect(response.body).toMatchObject({
        status: HttpStatusCodes.UNAUTHORIZED,
        type: expect.stringContaining('TOKEN_EXPIRED'),
        title: expect.any(String),
        detail: expect.any(String),
        instance: 'ciam',
      });
    });

    it('should return 412 for blocked user (YPCIAMM19)', async () => {
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain').send(formatPersonalityChange(USER_IDC, 'YPCIAMM19'))
        .expect(HttpStatusCodes.OK);

      const response = await request(BASE_URL)
        .post(AUTHENTICATION_ENDPOINT)
        .set('X-User-Email', USER_EMAIL)
        .send(validRequest)
        .expect(HttpStatusCodes.PRECONDITION_FAILED);

      expect(response.body).toMatchObject({
        status: HttpStatusCodes.PRECONDITION_FAILED,
        type: expect.stringContaining('ML0019'),
        title: expect.any(String),
        detail: expect.any(String),
        instance: 'ciam',
      });
    });

    it('should return 412 for blocked user ML0038 (YPCIAMM38)', async () => {
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain').send(formatPersonalityChange(USER_IDC, 'YPCIAMM38'))
        .expect(HttpStatusCodes.OK);

      const response = await request(BASE_URL)
        .post(AUTHENTICATION_ENDPOINT)
        .set('X-User-Email', USER_EMAIL)
        .send(validRequest)
        .expect(HttpStatusCodes.PRECONDITION_FAILED);

      expect(response.body).toMatchObject({
        status: HttpStatusCodes.PRECONDITION_FAILED,
        type: expect.stringContaining('ML0038'),
        title: expect.any(String),
        detail: expect.any(String),
        instance: 'ciam',
      });
    });

    it('should return 500 for internal error (YPCIAM500)', async () => {
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain').send(formatPersonalityChange(USER_IDC, 'YPCIAM500'))
        .expect(HttpStatusCodes.OK);

      const response = await request(BASE_URL)
        .post(AUTHENTICATION_ENDPOINT)
        .set('X-User-Email', USER_EMAIL)
        .send(validRequest)
        .expect(HttpStatusCodes.INTERNAL_SERVER_ERROR);

      expect(response.body).toMatchObject({
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        type: expect.stringContaining('INTERNAL'),
        title: expect.any(String),
        detail: expect.any(String),
        instance: 'ciam',
      });
    });

    it('should return 500 for ML0006 error (YPCIAMM06)', async () => {
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain').send(formatPersonalityChange(USER_IDC, 'YPCIAMM06'))
        .expect(HttpStatusCodes.OK);

      const response = await request(BASE_URL)
        .post(AUTHENTICATION_ENDPOINT)
        .set('X-User-Email', USER_EMAIL)
        .send(validRequest)
        .expect(HttpStatusCodes.INTERNAL_SERVER_ERROR);

      expect(response.body).toMatchObject({
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        type: expect.stringContaining('ML0006'),
        title: expect.any(String),
        detail: expect.any(String),
        instance: 'ciam',
      });
    });

    it('should return 500 for ML0017 facial validation error (YPCIAMM17)', async () => {
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain').send(formatPersonalityChange(USER_IDC, 'YPCIAMM17'))
        .expect(HttpStatusCodes.OK);

      const response = await request(BASE_URL)
        .post(AUTHENTICATION_ENDPOINT)
        .set('X-User-Email', USER_EMAIL)
        .send(validRequest)
        .expect(HttpStatusCodes.INTERNAL_SERVER_ERROR);

      expect(response.body).toMatchObject({
        status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
        type: expect.stringContaining('ML0017'),
        title: expect.any(String),
        detail: expect.any(String),
        instance: 'ciam',
      });
    });
  });

  describe('Request Validation', () => {
    it('should return 400 for missing flowProcessId', async () => {
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain').send(formatPersonalityChange(USER_IDC, 'YPCIAM000'))
        .expect(HttpStatusCodes.OK);

      const response = await request(BASE_URL)
        .post(AUTHENTICATION_ENDPOINT)
        .set('X-User-Email', USER_EMAIL)
        .send({
          biometricData: validRequest.biometricData,
        })
        .expect(HttpStatusCodes.BAD_REQUEST);

      expect(response.body).toMatchObject({
        status: HttpStatusCodes.BAD_REQUEST,
        type: expect.stringContaining('VALIDATION_ERROR'),
        detail: expect.stringContaining('flowProcessId'),
        instance: 'ciam',
      });
    });
  });
});
