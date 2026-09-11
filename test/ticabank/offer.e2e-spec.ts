import request from 'supertest';
import { HttpStatusCodes } from '../../src/common/http-status-codes';
import { TEST_CONFIG } from '../config/test-config';
import { toYamlString, formatPersonalityChange } from '../helpers/testing-endpoints.helper';

describe('Ticabank Offer API (e2e)', () => {
  const baseUrl = TEST_CONFIG.baseUrl;
  const USER_IDC = '12345678'; // IDC for test001@test.com.pe (generic test user)


  describe('Success Scenarios', () => {
    it('should return 200 with offer data for valid user (no personality)', async () => {
      await request(baseUrl)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YTIKABANK'));

      const response = await request(baseUrl)
        .post('/creditos-ticabank/sales/customer-offer/v1/lead/consultar')
        .set('Content-Type', 'application/json')
        .set('X-User-Email', 'test001@test.com.pe')
        .send({
          codigoPaisDocumento: 'PE',
          tipoDocumentoIdentidad: 'C',
        })
        .expect(HttpStatusCodes.OK);

      expect(response.body).toMatchObject({
        status: HttpStatusCodes.OK,
        data: {
          codigoCliente: expect.any(Number),
          montoMaximoOferta: expect.any(Number),
          montoMinimoOferta: expect.any(Number),
        },
      });

      expect(response.body.data.codigoCliente).toBe(3032596);
      expect(response.body.data.montoMaximoOferta).toBe(10000);
      expect(response.body.data.montoMinimoOferta).toBe(500);
    });
  });

  describe('Business Error Scenarios (202)', () => {
    it('should return 202 no data for invalid user (YPTPLI003)', async () => {
      await request(baseUrl)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPTPLI003'));

      const response = await request(baseUrl)
        .post('/creditos-ticabank/sales/customer-offer/v1/lead/consultar')
        .set('X-User-Email', 'test001@test.com.pe')
        .send({
          codigoPaisDocumento: 'PE',
          tipoDocumentoIdentidad: 'C',
        })
        .expect(HttpStatusCodes.ACCEPTED);

      expect(response.body).toMatchObject({
        status: HttpStatusCodes.ACCEPTED,
        type: expect.stringContaining('lead/errors/LEAD-FUNC-001'),
        detail: expect.stringContaining('No se identifica lead'),
      });
    });

    it('should return 202-e01 for lead not confirmed (YPNOTCONF)', async () => {
      await request(baseUrl)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPNOTCONF'));

      const response = await request(baseUrl)
        .post('/creditos-ticabank/sales/customer-offer/v1/lead/consultar')
        .set('X-User-Email', 'test001@test.com.pe')
        .send({
          codigoPaisDocumento: 'PE',
          tipoDocumentoIdentidad: 'C',
        })
        .expect(HttpStatusCodes.ACCEPTED);

      expect(response.body).toMatchObject({
        status: HttpStatusCodes.ACCEPTED,
        type: expect.stringContaining('LEAD-FUNC-002'),
        detail: expect.stringContaining('no se encuentra confirmado'),
      });
    });
  });

  describe('HTTP Error Scenarios (4xx/5xx)', () => {
    it('should return 400 Bad Request (YPMBADREQ)', async () => {
      await request(baseUrl)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPMBADREQ'));

      const response = await request(baseUrl)
        .post('/creditos-ticabank/sales/customer-offer/v1/lead/consultar')
        .set('X-User-Email', 'test001@test.com.pe')
        .send({
          codigoPaisDocumento: 'PE',
          tipoDocumentoIdentidad: 'C',
        })
        .expect(HttpStatusCodes.BAD_REQUEST);

      expect(response.body.status).toBe(HttpStatusCodes.BAD_REQUEST);
    });

    it('should return 401 Unauthorized (YPUNAUTHZ)', async () => {
      await request(baseUrl)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPUNAUTHZ'));

      await request(baseUrl)
        .post('/creditos-ticabank/sales/customer-offer/v1/lead/consultar')
        .set('X-User-Email', 'test001@test.com.pe')
        .send({
          codigoPaisDocumento: 'PE',
          tipoDocumentoIdentidad: 'C',
        })
        .expect(HttpStatusCodes.UNAUTHORIZED);
    });

    it('should return 504 Gateway Timeout (YPTPLI020)', async () => {
      await request(baseUrl)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPTPLI020'));

      await request(baseUrl)
        .post('/creditos-ticabank/sales/customer-offer/v1/lead/consultar')
        .set('X-User-Email', 'test001@test.com.pe')
        .send({
          codigoPaisDocumento: 'PE',
          tipoDocumentoIdentidad: 'C',
        })
        .expect(HttpStatusCodes.GATEWAY_TIMEOUT);
    });
  });

  describe('Request Validation', () => {
    it('should reject invalid codigoPaisDocumento (not PE)', async () => {
      await request(baseUrl)
        .post('/creditos-ticabank/sales/customer-offer/v1/lead/consultar')
        .set('X-User-Email', 'test001@test.com.pe')
        .send({
          codigoPaisDocumento: 'US',
          tipoDocumentoIdentidad: 'C',
        })
        .expect(HttpStatusCodes.BAD_REQUEST);
    });

    it('should reject invalid tipoDocumentoIdentidad length', async () => {
      await request(baseUrl)
        .post('/creditos-ticabank/sales/customer-offer/v1/lead/consultar')
        .set('X-User-Email', 'test001@test.com.pe')
        .send({
          codigoPaisDocumento: 'PE',
          tipoDocumentoIdentidad: 'DNI',
        })
        .expect(HttpStatusCodes.BAD_REQUEST);
    });
  });
});
