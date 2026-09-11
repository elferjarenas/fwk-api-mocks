import request from 'supertest';
import { HttpStatusCodes } from '../../src/common/http-status-codes';
import { TEST_CONFIG } from '../config/test-config';
import { formatPersonalityChange } from '../helpers/testing-endpoints.helper';

/**
 * E2E Tests for CIAM OAuth Endpoints
 * - POST /auth/oauth/v2/token (OAuth token generation)
 * - POST /cas/oidc/accessToken (OIDC access token - facial verification v4)
 */

const OAUTH_TOKEN_ENDPOINT = '/auth/oauth/v2/token';
const OIDC_ACCESS_TOKEN_ENDPOINT = '/cas/oidc/accessToken';

describe('CIAM OAuth API (e2e)', () => {
  const baseUrl = TEST_CONFIG.baseUrl;
  const USER_IDC_ENROLLMENT = '45678901';
  const USER_EMAIL_ENROLLMENT = 'test003@test.com.pe'; // ciam_enrollment
  const USER_IDC_AUTH = '45678902';
  const USER_EMAIL_AUTH = 'test004@test.com.pe'; // ciam_auth

  describe('OAuth Token Generation', () => {
    describe('Success Scenarios', () => {
      it('should return 200 with valid OAuth token', async () => {
        const response = await request(baseUrl)
          .post(OAUTH_TOKEN_ENDPOINT)
          .expect(HttpStatusCodes.OK);

        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('token_type', 'Bearer');
        expect(response.body).toHaveProperty('expires_in', 3600);
        expect(response.body).toHaveProperty('refresh_token');
        
        // Verify token format: timestamp_randomsuffix
        expect(response.body.access_token).toMatch(/^mock_access_token_\d+_[a-z0-9]+$/);
        expect(response.body.refresh_token).toMatch(/^mock_refresh_token_\d+_[a-z0-9]+$/);
      });

      it('should generate unique tokens on multiple calls', async () => {
        const response1 = await request(baseUrl)
          .post(OAUTH_TOKEN_ENDPOINT)
          .expect(HttpStatusCodes.OK);

        const response2 = await request(baseUrl)
          .post(OAUTH_TOKEN_ENDPOINT)
          .expect(HttpStatusCodes.OK);

        expect(response1.body.access_token).not.toBe(response2.body.access_token);
        expect(response1.body.refresh_token).not.toBe(response2.body.refresh_token);
      });
    });
  });

  describe('OIDC Access Token (Facial Verification v4)', () => {
    const validEnrollmentRequest = {
      workflow: 'ENROLLMENT',
      processData: {
        flowProcessId: '550e8400-e29b-41d4-a716-446655440000',
      },
      biometricData: {
        faceImage: 'base64EncodedImage',
        documentOcr: 'ocr_data',
        timestamp: Date.now(),
      },
    };

    const validAuthenticationRequest = {
      workflow: 'AUTHENTICATION',
      processData: {
        flowProcessId: '550e8400-e29b-41d4-a716-446655440001',
      },
      biometricData: {
        faceImage: 'base64EncodedImage',
        selfieImage: 'base64EncodedSelfie',
        timestamp: Date.now(),
      },
    };

    describe('Success Scenarios - Enrollment', () => {
      it('should return 200 OK for successful enrollment (OIDC endpoint)', async () => {
        await request(baseUrl)
          .post('/testing/ChangeUserPersonality')
          .set('Content-Type', 'text/plain').send(formatPersonalityChange(USER_IDC_ENROLLMENT, 'YPCIAM000'))
          .expect(HttpStatusCodes.OK);

        const response = await request(baseUrl)
          .post(OIDC_ACCESS_TOKEN_ENDPOINT)
        .set('X-User-Email', USER_EMAIL_ENROLLMENT)
          .send(validEnrollmentRequest)
          .expect(HttpStatusCodes.OK);

        // Verify enrollment response structure
        expect(response.body).toHaveProperty('personData');
        expect(response.body.personData).toHaveProperty('firstName');
        expect(response.body.personData).toHaveProperty('fatherLastName');
        expect(response.body.personData).toHaveProperty('ciamDeviceId');
        expect(response.body).toHaveProperty('processData');
        expect(response.body.processData).toHaveProperty('flowProcessId');
        expect(response.body.processData).toHaveProperty('biometricGatewayIdTransaction');
        expect(response.body).toHaveProperty('userTokenData');
        expect(response.body.userTokenData).toHaveProperty('accessToken');
        expect(response.body.userTokenData).toHaveProperty('refreshToken');
      });
    });

    describe('Success Scenarios - Authentication', () => {
      it('should return 200 OK for successful authentication (OIDC endpoint)', async () => {
        await request(baseUrl)
          .post('/testing/ChangeUserPersonality')
          .set('Content-Type', 'text/plain').send(formatPersonalityChange(USER_IDC_AUTH, 'YPCIAM000'))
          .expect(HttpStatusCodes.OK);

        const response = await request(baseUrl)
          .post(OIDC_ACCESS_TOKEN_ENDPOINT)
        .set('X-User-Email', USER_EMAIL_AUTH)
          .send(validAuthenticationRequest)
          .expect(HttpStatusCodes.OK);

        // Verify authentication response structure (OAuth format)
        expect(response.body).toHaveProperty('access_token');
        expect(response.body).toHaveProperty('id_token');
        expect(response.body).toHaveProperty('refresh_token');
        expect(response.body).toHaveProperty('token_type', 'bearer');
        expect(response.body).toHaveProperty('expires_in', 300);
        expect(response.body).toHaveProperty('scope');
      });
    });

    describe('Error Scenarios (4xx/5xx)', () => {
      it('should return 500 for internal error personality (YPCIAM500)', async () => {
        await request(baseUrl)
          .post('/testing/ChangeUserPersonality')
          .set('Content-Type', 'text/plain')
          .send(formatPersonalityChange(USER_IDC_ENROLLMENT, 'YPCIAM500'));

        await request(baseUrl)
          .post(OIDC_ACCESS_TOKEN_ENDPOINT)
        .set('X-User-Email', USER_EMAIL_ENROLLMENT)
          .send(validEnrollmentRequest)
          .expect(HttpStatusCodes.INTERNAL_SERVER_ERROR);
      });
    });

    describe('Request Validation', () => {
      it('should return 400 for missing flowProcessId', async () => {
        await request(baseUrl)
          .post('/testing/ChangeUserPersonality')
          .set('Content-Type', 'text/plain').send(formatPersonalityChange(USER_IDC_ENROLLMENT, 'YPCIAM000'))
          .expect(HttpStatusCodes.OK);

        const invalidRequest = {
          workflow: 'ENROLLMENT',
          processData: {},
          biometricData: {
            faceImage: 'base64EncodedImage',
          },
        };

        const response = await request(baseUrl)
          .post(OIDC_ACCESS_TOKEN_ENDPOINT)
        .set('X-User-Email', USER_EMAIL_ENROLLMENT)
          .send(invalidRequest)
          .expect(HttpStatusCodes.BAD_REQUEST);

        expect(response.body).toMatchObject({
          status: HttpStatusCodes.BAD_REQUEST,
          type: expect.stringContaining('VALIDATION_ERROR'),
          detail: expect.stringContaining('flowProcessId'),
          instance: 'ciam'
        });
      });
    });
  });
});
