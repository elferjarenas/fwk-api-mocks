import request from 'supertest';
import { HttpStatusCodes } from '../../src/common/http-status-codes';
import { TEST_CONFIG } from '../config/test-config';
import { toYamlString, formatPersonalityChange } from '../helpers/yape-endpoints.helper';

/**
 * E2E Tests for Mibanco Simulate API
 * Endpoint: GET /creditos-yape/servicing/servicing-order/v1/simulacion/generar
 */

const SIMULATE_ENDPOINT = '/creditos-yape/servicing/servicing-order/v1/simulacion/generar';

describe('Mibanco Simulate API (e2e)', () => {
  const BASE_URL = TEST_CONFIG.baseUrl;
  const USER_IDC = '12345678';


  describe('Success Scenarios', () => {
    it('should return 200 with installment options for valid parameters', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPMIBANCO'));

      const response = await request(BASE_URL)
        .get(SIMULATE_ENDPOINT)
        .query({
          codigoCliente: 3032596,
          montoSolicitado: 2000,
          numeroDiaPago: 15
        })
        .expect(HttpStatusCodes.OK);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.OK);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      response.body.data.forEach((installment: any) => {
        expect(installment).toHaveProperty('montoCuotaSimulacion');
        expect(installment).toHaveProperty('cantidadCuotas');
        expect(typeof installment.montoCuotaSimulacion).toBe('number');
        expect(typeof installment.cantidadCuotas).toBe('number');
      });
    });

    it('should return 6 term options for amounts > 1500', async () => {
      const response = await request(BASE_URL)
        .get(SIMULATE_ENDPOINT)
        .query({
          codigoCliente: 3032596,
          montoSolicitado: 2000,
          numeroDiaPago: 7
        })
        .expect(HttpStatusCodes.OK);

      expect(response.body.data.length).toBe(6);
      const terms = response.body.data.map((i: any) => i.cantidadCuotas);
      expect(terms).toEqual([6, 9, 12, 15, 18, 24]);
    });

    it('should return 5 term options for amounts <= 1500', async () => {
      const response = await request(BASE_URL)
        .get(SIMULATE_ENDPOINT)
        .query({
          codigoCliente: 3032596,
          montoSolicitado: 1500,
          numeroDiaPago: 7
        })
        .expect(HttpStatusCodes.OK);

      expect(response.body.data.length).toBe(5);
      const terms = response.body.data.map((i: any) => i.cantidadCuotas);
      expect(terms).toEqual([6, 9, 12, 15, 18]);
    });

    it('should apply payment day boost for day 15 (+1%)', async () => {
      const responseDay7 = await request(BASE_URL)
        .get(SIMULATE_ENDPOINT)
        .query({ codigoCliente: 3032596, montoSolicitado: 1000, numeroDiaPago: 7 })
        .expect(HttpStatusCodes.OK);

      const responseDay15 = await request(BASE_URL)
        .get(SIMULATE_ENDPOINT)
        .query({ codigoCliente: 3032596, montoSolicitado: 1000, numeroDiaPago: 15 })
        .expect(HttpStatusCodes.OK);

      const day7First = responseDay7.body.data[0].montoCuotaSimulacion;
      const day15First = responseDay15.body.data[0].montoCuotaSimulacion;
      expect(day15First).toBeGreaterThan(day7First);
    });

    it('should return installment amounts with correct precision', async () => {
      const response = await request(BASE_URL)
        .get(SIMULATE_ENDPOINT)
        .query({
          codigoCliente: 3032596,
          montoSolicitado: 2000,
          numeroDiaPago: 15
        })
        .expect(HttpStatusCodes.OK);

      response.body.data.forEach((installment: any) => {
        const amount = installment.montoCuotaSimulacion;
        expect(Number((amount * 100).toFixed(0)) / 100).toBe(amount);
      });
    });
  });

  describe('Business Error Scenarios (202)', () => {
    it('should return 202 Accepted - No Data (YPTPLI007)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPTPLI007'));

      const response = await request(BASE_URL)
        .get(SIMULATE_ENDPOINT)
        .query({
          codigoCliente: 3032596,
          montoSolicitado: 2000,
          numeroDiaPago: 15
        })
        .expect(HttpStatusCodes.ACCEPTED);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.ACCEPTED);
      expect(response.body).toHaveProperty('instance', 'simulate.generar');
    });

    it('should return 404 Not Found - Call Failed (YPTPLI008)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPTPLI008'));

      const response = await request(BASE_URL)
        .get(SIMULATE_ENDPOINT)
        .query({
          codigoCliente: 3032596,
          montoSolicitado: 2000,
          numeroDiaPago: 15
        })
        .expect(HttpStatusCodes.NOT_FOUND);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('instance', 'simulacion.generar');
    });

    it('should return 504 Gateway Timeout (YPTPLI021)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPTPLI021'));

      const response = await request(BASE_URL)
        .get(SIMULATE_ENDPOINT)
        .query({
          codigoCliente: 3032596,
          montoSolicitado: 2000,
          numeroDiaPago: 15
        })
        .expect(HttpStatusCodes.GATEWAY_TIMEOUT);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.GATEWAY_TIMEOUT);
      expect(response.body).toHaveProperty('instance', 'simulate.generar');
    });
  });

  describe('HTTP Error Scenarios (4xx/5xx)', () => {
    it('should return 400 Bad Request (YPMBADREQ)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPMBADREQ'));

      await request(BASE_URL)
        .get(SIMULATE_ENDPOINT)
        .query({
          codigoCliente: 3032596,
          montoSolicitado: 2000,
          numeroDiaPago: 15
        })
        .expect(HttpStatusCodes.BAD_REQUEST);
    });

    it('should return 401 Unauthorized (YPUNAUTHZ)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPUNAUTHZ'));

      await request(BASE_URL)
        .get(SIMULATE_ENDPOINT)
        .query({
          codigoCliente: 3032596,
          montoSolicitado: 2000,
          numeroDiaPago: 15
        })
        .expect(HttpStatusCodes.UNAUTHORIZED);
    });

    it('should return 500 Internal Server Error (YPSERVERR)', async () => {
      await request(BASE_URL)
        .post('/yape/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPSERVERR'));

      await request(BASE_URL)
        .get(SIMULATE_ENDPOINT)
        .query({
          codigoCliente: 3032596,
          montoSolicitado: 2000,
          numeroDiaPago: 15
        })
        .expect(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Request Validation (404 Operation Not Found)', () => {
    it('should return 404 when all parameters are missing', async () => {
      const response = await request(BASE_URL)
        .get(SIMULATE_ENDPOINT)
        .expect(HttpStatusCodes.NOT_FOUND);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('type', '/creditos-yape/servicing/servicing-order/v1');
      expect(response.body).toHaveProperty('title', 'No se encuentra el recurso solicitado.');
      expect(response.body).toHaveProperty('detail', 'Operation Not Found');
      expect(response.body).toHaveProperty('instance', 'simulacion.generar');
    });

    it('should return 404 when codigoCliente is missing', async () => {
      const response = await request(BASE_URL)
        .get(SIMULATE_ENDPOINT)
        .query({
          montoSolicitado: 2000,
          numeroDiaPago: 15
        })
        .expect(HttpStatusCodes.NOT_FOUND);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('instance', 'simulacion.generar');
    });

    it('should return 404 when montoSolicitado is missing', async () => {
      const response = await request(BASE_URL)
        .get(SIMULATE_ENDPOINT)
        .query({
          codigoCliente: 3032596,
          numeroDiaPago: 15
        })
        .expect(HttpStatusCodes.NOT_FOUND);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('instance', 'simulacion.generar');
    });

    it('should return 404 when numeroDiaPago is missing', async () => {
      const response = await request(BASE_URL)
        .get(SIMULATE_ENDPOINT)
        .query({
          codigoCliente: 3032596,
          montoSolicitado: 2000
        })
        .expect(HttpStatusCodes.NOT_FOUND);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('instance', 'simulacion.generar');
    });
  });
});
