import request from 'supertest';
import { HttpStatusCodes } from '../../src/common/http-status-codes';
import { TEST_CONFIG } from '../config/test-config';
import { formatPersonalityChange } from '../helpers/testing-endpoints.helper';

/**
 * CIAM Identification Methods Integration Tests
 * Uses real Ruby endpoints: /channel/ciam/mobile-login/v{1,2}/identification-methods
 * 
 * NOTE: Server must be running before tests
 * Start with: npm run start:dev
 */
describe('CIAM Identification Methods API (e2e)', () => {
  const baseUrl = TEST_CONFIG.baseUrl;
  
  // Use existing CIAM user from seed
  const USER_IDC = '45678901';
  const USER_EMAIL = 'test003@test.com.pe';

  // Removed afterEach - keep test data across all tests in this suite

  describe('Success Scenarios - v1', () => {
    it('should return 200 with FACIAL ENROLLED for enrolled user (YPCIAMENR)', async () => {
      // Set enrolled personality
      await request(baseUrl)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPCIAMENR'));

      const response = await request(baseUrl)
        .get('/channel/ciam/mobile-login/v1/identification-methods')
        .set('Authorization', 'Bearer mock-token')
        .set('X-User-Email', USER_EMAIL)
        .set('app-code', 'TICO')
        .set('caller-name', 'MOBILE')
        .expect(HttpStatusCodes.OK);

      expect(response.body).toMatchObject({
        identificationMethods: expect.arrayContaining([
          { type: 'FACIAL', status: 'ENROLLED' },
          { type: 'PIN', status: 'ENROLLED' }
        ])
      });
    });

    it('should return 200 with FACIAL NOT_ENROLLED for not enrolled user (YPCIAM000)', async () => {
      // Set not enrolled personality
      await request(baseUrl)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPCIAM000'));

      const response = await request(baseUrl)
        .get('/channel/ciam/mobile-login/v1/identification-methods')
        .set('Authorization', 'Bearer mock-token')
        .set('X-User-Email', USER_EMAIL)
        .set('app-code', 'TICO')
        .set('caller-name', 'MOBILE')
        .expect(HttpStatusCodes.OK);

      expect(response.body).toMatchObject({
        identificationMethods: expect.arrayContaining([
          { type: 'FACIAL', status: 'NOT_ENROLLED' },
          { type: 'PIN', status: 'ENROLLED' }
        ])
      });
    });
  });

  describe('Success Scenarios - v2', () => {
    it('should return 200 with identification methods for v2 endpoint', async () => {
      const response = await request(baseUrl)
        .get('/channel/ciam/mobile-login/v2/identification-methods')
        .set('Authorization', 'Bearer mock-token')
        .set('X-User-Email', 'test003@test.com.pe')
        .set('app-code', 'TICO')
        .set('caller-name', 'MOBILE')
        .expect(HttpStatusCodes.OK);

      expect(response.body).toMatchObject({
        identificationMethods: expect.any(Array)
      });
    });
  });

  describe('Error Scenarios (4xx/5xx)', () => {
    it('should return 403 for missing Authorization header', async () => {
      await request(baseUrl)
        .get('/channel/ciam/mobile-login/v1/identification-methods')
        .set('app-code', 'TICO')
        .set('caller-name', 'MOBILE')
        .expect(HttpStatusCodes.FORBIDDEN);
    });

    it('should return 401 for missing APP_CODE header', async () => {
      await request(baseUrl)
        .get('/channel/ciam/mobile-login/v1/identification-methods')
        .set('Authorization', 'Bearer mock-token')
        .set('caller-name', 'MOBILE')
        .expect(HttpStatusCodes.UNAUTHORIZED);
    });

    it('should return 401 for missing CALLER_NAME header', async () => {
      await request(baseUrl)
        .get('/channel/ciam/mobile-login/v1/identification-methods')
        .set('Authorization', 'Bearer mock-token')
        .set('app-code', 'TICO')
        .expect(HttpStatusCodes.UNAUTHORIZED);
    });

    it('should return 500 for internal error personality (YPCIAM500)', async () => {
      // Set error personality
      await request(baseUrl)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPCIAM500'));

      await request(baseUrl)
        .get('/channel/ciam/mobile-login/v1/identification-methods')
        .set('Authorization', 'Bearer mock-token')
        .set('X-User-Email', USER_EMAIL)
        .set('app-code', 'TICO')
        .set('caller-name', 'MOBILE')
        .expect(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    });
  });
});
