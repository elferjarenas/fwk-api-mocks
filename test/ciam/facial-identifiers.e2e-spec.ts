import request from 'supertest';
import { HttpStatusCodes } from '../../src/common/http-status-codes';
import { TEST_CONFIG } from '../config/test-config';
import { formatPersonalityChange } from '../helpers/testing-endpoints.helper';

/**
 * E2E Tests for CIAM Facial Identifiers API
 * Endpoint: GET /ux-biom-mobile-facial-overview-v1/channel/biom/v1/mobile-facial-overview/facial-identifiers
 */

const FACIAL_IDENTIFIERS_ENDPOINT = '/ux-biom-mobile-facial-overview-v1/channel/biom/v1/mobile-facial-overview/facial-identifiers';

describe('CIAM Facial Identifiers API (e2e)', () => {
  const baseUrl = TEST_CONFIG.baseUrl;
  const USER_IDC = '45678901';
  const USER_EMAIL = 'test003@test.com.pe'; // ciam_enrollment from seed-test.yml

  describe('Success Scenarios', () => {
    it('should return 200 with facial identifiers list for enrolled user', async () => {
      // Set enrolled personality
      await request(baseUrl)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPCIAMENR'));

      const response = await request(baseUrl)
        .get(FACIAL_IDENTIFIERS_ENDPOINT)
        .set('Authorization', 'Bearer mock-token')
        .expect(HttpStatusCodes.OK);

      expect(response.body).toHaveProperty('facialIdentifiers');
      expect(Array.isArray(response.body.facialIdentifiers)).toBe(true);
      expect(response.body.facialIdentifiers.length).toBeGreaterThan(0);
      
      // Verify structure
      const firstIdentifier = response.body.facialIdentifiers[0];
      expect(firstIdentifier).toHaveProperty('id');
      expect(firstIdentifier).toHaveProperty('status');
      expect(firstIdentifier).toHaveProperty('createdAt');
    });

    it('should return 200 with empty list for not enrolled user', async () => {
      // Set success personality (not enrolled)
      await request(baseUrl)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPCIAM000'));

      const response = await request(baseUrl)
        .get(FACIAL_IDENTIFIERS_ENDPOINT)
        .set('X-User-Email', USER_EMAIL)
        .set('Authorization', 'Bearer mock-token')
        .expect(HttpStatusCodes.OK);

      expect(response.body).toHaveProperty('facialIdentifiers');
      expect(Array.isArray(response.body.facialIdentifiers)).toBe(true);
      expect(response.body.facialIdentifiers.length).toBe(0);
    });
  });

  describe('Error Scenarios (4xx/5xx)', () => {
    it('should return 500 for internal error personality (YPCIAM500)', async () => {
      // Set error personality
      await request(baseUrl)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPCIAM500'));

      await request(baseUrl)
        .get(FACIAL_IDENTIFIERS_ENDPOINT)
        .set('X-User-Email', USER_EMAIL)
        .set('Authorization', 'Bearer mock-token')
        .expect(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    });
  });
});
