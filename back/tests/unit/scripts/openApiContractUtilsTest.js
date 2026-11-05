import { describe, expect, it } from 'vitest';
import { validateOpenApiContract } from '../../../scripts/openApiContractUtils.js';

const createContract = () => ({
  openapi: '3.1.0',
  info: { title: 'API de prueba', version: '1.0.0' },
  tags: [{ name: 'Registros' }],
  components: {
    securitySchemes: { cookieAuth: { type: 'apiKey', in: 'cookie', name: 'accessToken' } },
    schemas: { Record: { type: 'object', properties: { id: { type: 'string' } } } }
  },
  paths: {
    '/api/records/{id}': {
      get: {
        summary: 'Consultar registro',
        operationId: 'getRecord',
        tags: ['Registros'],
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Registro disponible.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Record' } } }
          }
        }
      }
    }
  }
});

const operation = contract => contract.paths['/api/records/{id}'].get;

describe('comprobación del contrato OpenAPI', () => {
  it('acepta referencias válidas, parámetros heredados y una respuesta 204 sin cuerpo', () => {
    const contract = createContract();
    const read = operation(contract);
    contract.paths['/api/records/{id}'].parameters = read.parameters;
    delete read.parameters;
    contract.paths['/api/session'] = {
      post: {
        summary: 'Cerrar sesión de prueba',
        operationId: 'closeTestSession',
        tags: ['Registros'],
        security: [],
        responses: { 204: { description: 'Sin contenido.' } }
      }
    };

    expect(validateOpenApiContract(contract)).toHaveLength(2);
  });

  it('rechaza el esquema ausente aunque los métodos y las rutas estén documentados', () => {
    const contract = createContract();
    delete contract.components.schemas.Record;
    expect(() => validateOpenApiContract(contract)).toThrow('Referencia OpenAPI inexistente');
  });

  it('rechaza operationId repetidos entre rutas distintas', () => {
    const contract = createContract();
    contract.paths['/api/other/{id}'] = structuredClone(contract.paths['/api/records/{id}']);
    expect(() => validateOpenApiContract(contract)).toThrow('operationId ausente o repetido');
  });

  it('rechaza parámetros repetidos incluso si uno llega por referencia', () => {
    const contract = createContract();
    const parameter = { name: 'search', in: 'query', schema: { type: 'string' } };
    contract.components.parameters = { Search: parameter };
    operation(contract).parameters.push(parameter, { $ref: '#/components/parameters/Search' });
    expect(() => validateOpenApiContract(contract)).toThrow('Parámetro OpenAPI repetido');
  });

  it('no acepta una variable de ruta sin parámetro obligatorio', () => {
    const contract = createContract();
    operation(contract).parameters[0].required = false;
    expect(() => validateOpenApiContract(contract)).toThrow('Parámetro de ruta no declarado');
  });

  it.each([
    ['resumen', contract => { delete operation(contract).summary; }, 'Resumen OpenAPI ausente'],
    ['grupo', contract => { operation(contract).tags = ['Desconocido']; }, 'Grupo OpenAPI'],
    ['autenticación', contract => { operation(contract).security = [{ unknown: [] }]; }, 'Esquema de autenticación'],
    ['éxito', contract => { operation(contract).responses = { 404: { description: 'Ausente.' } }; }, 'sin respuesta exitosa'],
    ['descripción', contract => { delete operation(contract).responses[200].description; }, 'Respuesta sin descripción']
  ])('detecta un contrato incompleto de %s', (_, change, message) => {
    const contract = createContract();
    change(contract);
    expect(() => validateOpenApiContract(contract)).toThrow(message);
  });

  it('impide incorporar una ruta web EJS al contrato API', () => {
    const contract = createContract();
    contract.paths['/cerrar-sesion'] = contract.paths['/api/records/{id}'];
    delete contract.paths['/api/records/{id}'];
    expect(() => validateOpenApiContract(contract)).toThrow('Ruta web fuera del contrato API');
  });
});
