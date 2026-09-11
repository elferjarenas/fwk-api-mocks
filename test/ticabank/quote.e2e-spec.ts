import request from 'supertest';
import { HttpStatusCodes } from '../../src/common/http-status-codes';
import { TEST_CONFIG } from '../config/test-config';
import { toYamlString, formatPersonalityChange } from '../helpers/testing-endpoints.helper';

/**
 * E2E Tests for Ticabank Quote API
 * Endpoint: GET /creditos-ticabank/servicing/servicing-order/v1/simulacion/obtener-cronograma
 */

describe('Ticabank Quote API (e2e)', () => {
  const BASE_URL = TEST_CONFIG.baseUrl;
  const USER_IDC = '12345678';
  const QUOTE_ENDPOINT = '/creditos-ticabank/servicing/servicing-order/v1/simulacion/obtener-cronograma';


  describe('Success Scenarios', () => {
    it('should return 200 with payment schedule for valid parameters', async () => {
      // Set YTIKABANK for success scenario
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YTIKABANK'));

      const response = await request(BASE_URL)
        .get(QUOTE_ENDPOINT)
        .query({
          codigoCliente: '3032596',
          montoSolicitado: '2000',
          cantidadCuotas: '12',
          numeroDiaPago: '15'
        })
        .expect(HttpStatusCodes.OK);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.OK);
      expect(response.body).toHaveProperty('data');
      
      const data = response.body.data;
      
      // Validate quote data structure
      expect(data).toHaveProperty('numeroDiaPago', 15);
      expect(data).toHaveProperty('fechaVencimiento');
      expect(data).toHaveProperty('montoTotalCapital');
      expect(data).toHaveProperty('montoTotalInteres');
      expect(data).toHaveProperty('montoImpuestoTransaccionesFinancieras');
      expect(data).toHaveProperty('montoPrimaDesgravamen');
      expect(data).toHaveProperty('porcentajeTasaSeguroDesgravamen', 0.45);
      expect(data).toHaveProperty('montoCuotaSimulacion');
      expect(data).toHaveProperty('porcentajeTasaInteres');
      expect(data).toHaveProperty('porcentajeTasaEfectivaAnual');
      expect(data).toHaveProperty('porcentajeTasaCostoEfectivaAnual');
      expect(data).toHaveProperty('montoNetoSolicitado', 2000);
      expect(data).toHaveProperty('porcentajeTasaMora', 15.35);
      expect(data).toHaveProperty('cronograma');
      
      // Validate schedule
      expect(Array.isArray(data.cronograma)).toBe(true);
      expect(data.cronograma.length).toBe(12);
      
      // Validate schedule item structure
      data.cronograma.forEach((item: any, index: number) => {
        expect(item).toHaveProperty('numeroCuota', index + 1);
        expect(item).toHaveProperty('montoCapital');
        expect(item).toHaveProperty('montoInteres');
        expect(item).toHaveProperty('fechaVencimientoCuota');
        expect(typeof item.montoCapital).toBe('number');
        expect(typeof item.montoInteres).toBe('number');
        expect(typeof item.fechaVencimientoCuota).toBe('string');
      });
    });

    it('should calculate credit life insurance correctly (0.45%)', async () => {
      // Set YTIKABANK for success scenario
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YTIKABANK'));

      const amount = 2000;
      const expectedInsurance = amount * 0.0045; // 0.45% = 9.0

      const response = await request(BASE_URL)
        .get(QUOTE_ENDPOINT)
        .query({
          codigoCliente: '3032596',
          montoSolicitado: amount.toString(),
          cantidadCuotas: '12',
          numeroDiaPago: '15'
        })
        .expect(HttpStatusCodes.OK);

      expect(response.body.data.montoPrimaDesgravamen).toBeCloseTo(expectedInsurance, 2);
    });

    it('should calculate ITF correctly for amount > 1000', async () => {
      // Set YTIKABANK for success scenario
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YTIKABANK'));

      const response = await request(BASE_URL)
        .get(QUOTE_ENDPOINT)
        .query({
          codigoCliente: '3032596',
          montoSolicitado: '2000',
          cantidadCuotas: '12',
          numeroDiaPago: '15'
        })
        .expect(HttpStatusCodes.OK);

      expect(response.body.data.montoImpuestoTransaccionesFinancieras).toBe(0.25);
    });

    it('should calculate TEA and TCEA correctly', async () => {
      // Set YTIKABANK for success scenario
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YTIKABANK'));

      const response = await request(BASE_URL)
        .get(QUOTE_ENDPOINT)
        .query({
          codigoCliente: '3032596',
          montoSolicitado: '2000',
          cantidadCuotas: '12',
          numeroDiaPago: '15'
        })
        .expect(HttpStatusCodes.OK);

      const { data } = response.body;
      
      // TEA should be >= minimum
      expect(data.porcentajeTasaEfectivaAnual).toBeGreaterThanOrEqual(35.3);
      
      // TCEA should be >= minimum (TCEA > TEA because it includes insurance)
      expect(data.porcentajeTasaCostoEfectivaAnual).toBeGreaterThanOrEqual(45.5);
      expect(data.porcentajeTasaCostoEfectivaAnual).toBeGreaterThan(data.porcentajeTasaEfectivaAnual);
    });
  });

  describe('Business Error Scenarios (202)', () => {
    it('should return 202 Accepted - No Data (YPTPLI015)', async () => {
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPTPLI015'));

      const response = await request(BASE_URL)
        .get(QUOTE_ENDPOINT)
        .query({
          codigoCliente: '3032596',
          montoSolicitado: '2000',
          cantidadCuotas: '12',
          numeroDiaPago: '15'
        })
        .expect(HttpStatusCodes.ACCEPTED);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.ACCEPTED);
      expect(response.body).toHaveProperty('instance', 'quote.obtener');
    });

    it('should return 404 Not Found - Call Failed (YPTPLI016)', async () => {
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPTPLI016'));

      const response = await request(BASE_URL)
        .get(QUOTE_ENDPOINT)
        .query({
          codigoCliente: '3032596',
          montoSolicitado: '2000',
          cantidadCuotas: '12',
          numeroDiaPago: '15'
        })
        .expect(HttpStatusCodes.NOT_FOUND);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('instance', 'simulacion.generar');
    });

    it('should return 504 Gateway Timeout (YPTPLI023)', async () => {
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPTPLI023'));

      const response = await request(BASE_URL)
        .get(QUOTE_ENDPOINT)
        .query({
          codigoCliente: '3032596',
          montoSolicitado: '2000',
          cantidadCuotas: '12',
          numeroDiaPago: '15'
        })
        .expect(HttpStatusCodes.GATEWAY_TIMEOUT);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.GATEWAY_TIMEOUT);
      expect(response.body).toHaveProperty('instance', 'quote.obtener');
    });
  });

  describe('HTTP Error Scenarios (4xx/5xx)', () => {
    it('should return 400 Bad Request (YPMBADREQ)', async () => {
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPMBADREQ'));

      await request(BASE_URL)
        .get(QUOTE_ENDPOINT)
        .query({
          codigoCliente: '3032596',
          montoSolicitado: '2000',
          cantidadCuotas: '12',
          numeroDiaPago: '15'
        })
        .expect(HttpStatusCodes.BAD_REQUEST);
    });

    it('should return 401 Unauthorized (YPUNAUTHZ)', async () => {
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPUNAUTHZ'));

      await request(BASE_URL)
        .get(QUOTE_ENDPOINT)
        .query({
          codigoCliente: '3032596',
          montoSolicitado: '2000',
          cantidadCuotas: '12',
          numeroDiaPago: '15'
        })
        .expect(HttpStatusCodes.UNAUTHORIZED);
    });

    it('should return 500 Internal Server Error (YPSERVERR)', async () => {
      await request(BASE_URL)
        .post('/testing/ChangeUserPersonality')
        .set('Content-Type', 'text/plain')
        .send(formatPersonalityChange(USER_IDC, 'YPSERVERR'));

      await request(BASE_URL)
        .get(QUOTE_ENDPOINT)
        .query({
          codigoCliente: '3032596',
          montoSolicitado: '2000',
          cantidadCuotas: '12',
          numeroDiaPago: '15'
        })
        .expect(HttpStatusCodes.INTERNAL_SERVER_ERROR);
    });
  });

  describe('Request Validation (404 Operation Not Found)', () => {
    it('should return 404 when all parameters are missing', async () => {
      const response = await request(BASE_URL)
        .get(QUOTE_ENDPOINT)
        .expect(HttpStatusCodes.NOT_FOUND);

      expect(response.body).toHaveProperty('status', HttpStatusCodes.NOT_FOUND);
      expect(response.body).toHaveProperty('type', '/creditos-ticabank/servicing/servicing-order/v1');
      expect(response.body).toHaveProperty('title', 'No se encuentra el recurso solicitado.');
      expect(response.body).toHaveProperty('detail', 'Operation Not Found');
      expect(response.body).toHaveProperty('instance', 'simulacion.generar');
    });
  });
});
