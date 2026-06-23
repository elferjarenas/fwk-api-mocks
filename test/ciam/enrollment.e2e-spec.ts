import request from 'supertest';
import { HttpStatusCodes } from '../../src/common/http-status-codes';
import { TEST_CONFIG } from '../config/test-config';
import { formatPersonalityChange } from '../helpers/yape-endpoints.helper';

/**
 * E2E Tests for CIAM Facial Verification (Enrollment workflow)
 * Endpoint: POST /channel/ciam/mobile-login/v1/identification-methods/facial-verification
 */

const ENROLLMENT_ENDPOINT = '/channel/ciam/mobile-login/v1/identification-methods/facial-verification';

describe('CIAM Facial Verification - Enrollment (e2e)', () => {
  const BASE_URL = TEST_CONFIG.baseUrl;
  const USER_IDC = '45678901';
  const USER_EMAIL = 'test003@test-yape.com.pe'; // ciam_enrollment from seed-test.yml

  // Valid base request body (enrollment workflow)
  const validRequest = {
    workflow: 'ENROLLMENT', // Identifica enrollment workflow
    flowProcessId: '550e8400-e29b-41d4-a716-446655440000',
    biometricData: {
      faceImage: 'base64EncodedImage',
      timestamp: Date.now(),
    },
  };

  describe('Success Scenarios', () => {
    it('should return 200 OK for successful enrollment (no personality)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain').send(formatPersonalityChange(USER_IDC, 'YPCIAM000'))
        .expect(HttpStatusCodes.OK);

      const response = await request(BASE_URL)
        .post(ENROLLMENT_ENDPOINT)
        .set('X-User-Email', USER_EMAIL)
        .set('X-User-Email', 'test003@test-yape.com.pe')
        .send(validRequest)
        .expect(HttpStatusCodes.OK);

      expect(response.body).toHaveProperty('personData');
      expect(response.body.personData).toHaveProperty('firstName');
      expect(response.body.personData).toHaveProperty('fatherLastName');
      expect(response.body.personData).toHaveProperty('motherLastName');
      expect(response.body.personData).toHaveProperty('ciamDeviceId');
      expect(response.body).toHaveProperty('processData');
      expect(response.body.processData).toHaveProperty('biometricGatewayIdTransaction');
      expect(response.body.processData).toHaveProperty('flowProcessId');
      expect(response.body).toHaveProperty('userTokenData');
      expect(response.body.userTokenData).toHaveProperty('accessToken');
      expect(response.body.userTokenData).toHaveProperty('refreshToken');
      expect(response.body.userTokenData).toHaveProperty('tokenTimeLife', 300);
    });
  });

  describe('Error Scenarios (4xx/5xx)', () => {
    it('should return 401 for token expired (YPCIAM401)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain').send(formatPersonalityChange(USER_IDC, 'YPCIAM401'))
        .expect(HttpStatusCodes.OK);

      const response = await request(BASE_URL)
        .post(ENROLLMENT_ENDPOINT)
        .set('X-User-Email', USER_EMAIL)
        .set('X-User-Email', 'test003@test-yape.com.pe')
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
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain').send(formatPersonalityChange(USER_IDC, 'YPCIAMM19'))
        .expect(HttpStatusCodes.OK);

      const response = await request(BASE_URL)
        .post(ENROLLMENT_ENDPOINT)
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
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain').send(formatPersonalityChange(USER_IDC, 'YPCIAMM38'))
        .expect(HttpStatusCodes.OK);

      const response = await request(BASE_URL)
        .post(ENROLLMENT_ENDPOINT)
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
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain').send(formatPersonalityChange(USER_IDC, 'YPCIAM500'))
        .expect(HttpStatusCodes.OK);

      const response = await request(BASE_URL)
        .post(ENROLLMENT_ENDPOINT)
        .set('X-User-Email', USER_EMAIL)
        .set('X-User-Email', 'test003@test-yape.com.pe')
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
  });

  describe('Request Validation', () => {
    it('should return 400 for missing flowProcessId', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain').send(formatPersonalityChange(USER_IDC, 'YPCIAM000'))
        .expect(HttpStatusCodes.OK);

      const response = await request(BASE_URL)
        .post(ENROLLMENT_ENDPOINT)
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
