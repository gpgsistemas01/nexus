import { describe, expect, it, vi } from 'vitest';

import {
  checkContentTypePlainText,
  checkTypeContentFile,
  checkTypeContentJson
} from '../../src/middleware/contentTypeMiddleware.js';
import { errorMap } from '../../src/messages/codeMessages.js';

const createResponse = () => {
  const res = {
    status: vi.fn(() => res),
    json: vi.fn(() => res)
  };

  return res;
};

describe('contentTypeMiddleware', () => {
  it('permite solicitudes GET sin validar content-type', () => {
    const req = { method: 'GET', body: { name: 'Producto' }, headers: {} };
    const res = createResponse();
    const next = vi.fn();

    checkTypeContentJson(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('permite solicitudes sin body', () => {
    const req = { method: 'POST', body: {}, headers: {} };
    const res = createResponse();
    const next = vi.fn();

    checkTypeContentJson(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rechaza JSON con content-type incorrecto', () => {
    const req = {
      method: 'POST',
      body: { name: 'Producto' },
      headers: { 'content-type': 'text/plain' }
    };
    const res = createResponse();
    const next = vi.fn();

    checkTypeContentJson(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(415);
    expect(res.json).toHaveBeenCalledWith({
      code: errorMap.message.INVALID_CONTENT_TYPE,
      contentType: 'application/json'
    });
  });

  it('acepta JSON aunque content-type incluya charset', () => {
    const req = {
      method: 'POST',
      body: { name: 'Producto' },
      headers: { 'content-type': 'application/json; charset=utf-8' }
    };
    const res = createResponse();
    const next = vi.fn();

    checkTypeContentJson(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('valida cargas de archivo y texto plano con el content-type esperado', () => {
    const fileNext = vi.fn();
    const textNext = vi.fn();

    checkTypeContentFile({
      method: 'POST',
      body: { file: 'content' },
      headers: { 'content-type': 'multipart/form-data; boundary=abc' }
    }, createResponse(), fileNext);

    checkContentTypePlainText({
      method: 'POST',
      body: { text: 'content' },
      headers: { 'content-type': 'text/plain' }
    }, createResponse(), textNext);

    expect(fileNext).toHaveBeenCalledOnce();
    expect(textNext).toHaveBeenCalledOnce();
  });
});
