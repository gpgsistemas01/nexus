import { describe, expect, it } from 'vitest';
import { normalizeHttpError } from '../../../../../src/public/js/api/utils.js';

describe('errores HTTP en descargas', () => {
  it('recupera el código y el mensaje desde una respuesta JSON recibida como Blob', async () => {
    const data = {
      code: 'DATABASE_TABLE_MISSING',
      message: 'Falta una tabla requerida en la base de datos. Contacta a soporte.'
    };
    const error = {
      message: 'Request failed with status code 503',
      response: { status: 503, data: new Blob([JSON.stringify(data)], { type: 'application/json' }) }
    };

    expect(await normalizeHttpError(error)).toEqual({
      status: 503,
      requiresAuth: true,
      data,
      message: data.message,
      raw: error
    });
  });

  it('traduce los códigos conocidos cuando el error JSON de la descarga no incluye mensaje', async () => {
    const error = { response: { status: 500, data: new Blob(['{"code":"SERVER_ERROR"}'], { type: 'application/json' }) } };
    expect(await normalizeHttpError(error)).toMatchObject({ status: 500, data: { code: 'SERVER_ERROR' }, message: 'Error del servidor.' });
  });

  it('conserva las respuestas JSON normales y los errores de conexión', async () => {
    const data = { code: 'FORBIDDEN', message: 'Sin permiso' };
    expect(await normalizeHttpError({ response: { status: 403, data } })).toMatchObject({ status: 403, data, message: 'Sin permiso' });
    expect(await normalizeHttpError(new Error('Network Error'))).toMatchObject({ status: 0, data: null });
  });

  it('no expone contenido inválido como mensaje y conserva el estado HTTP', async () => {
    const error = { response: { status: 503, data: new Blob(['{invalid'], { type: 'application/json' }) } };
    expect(await normalizeHttpError(error)).toMatchObject({
      status: 503, data: null, message: 'El servidor devolvió una respuesta no válida.'
    });
  });
});
