import { expect, it } from 'vitest';
import { successCodeMessages } from '@nexus/api-success-codes';
import { confirmMutation } from '../../../../src/shared/http/recordContract.js';

it('una confirmación utiliza el código recibido y el texto compartido con EJS', () => {
  const response = { code: 'CREATED_GOODS_RECEIPT', message: '<b>Texto ajeno</b>' };
  expect(confirmMutation(response, successCodeMessages.CREATED_GOODS_RECEIPT)).toEqual({
    code: 'CREATED_GOODS_RECEIPT',
    message: '¡Entrada de mercancía creada exitosamente!',
  });
  expect(response).toEqual({ code: 'CREATED_GOODS_RECEIPT', message: '<b>Texto ajeno</b>' });
});

it.each([null, {}, { code: 'SUCCESS' }, { code: 'UPDATED_GOODS_RECEIPT' }])(
  'un código ausente o ajeno a la operación no se transforma en éxito: %j',
  (response) => {
    expect(() => confirmMutation(response, successCodeMessages.CREATED_GOODS_RECEIPT)).toThrow(
      'confirmar',
    );
  },
);
