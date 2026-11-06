import { describe, expect, it } from 'vitest';
import { assertIssueNotCanceled } from '../../../../../src/services/warehouse/issues/issueFulfillmentRules.js';

describe('edición de documentos de salida cancelados', () => {
  it.each([
    { status: { name: 'Cancelada' }, fulfillmentStatus: { name: 'Surtido' } },
    { status: { name: 'Aprobada' }, fulfillmentStatus: { name: 'Cancelado' } }
  ])('bloquea cancelación del documento o de su surtido: %j', issue => {
    expect(() => assertIssueNotCanceled(issue)).toThrow(expect.objectContaining({ code: 'ISSUE_CANCELED_CONFLICT', statusCode: 409 }));
  });

  it.each(['Pendiente', 'Surtido parcial', 'Surtido'])('conserva edición de encabezado en %s', name => {
    expect(() => assertIssueNotCanceled({ status: { name: 'Aprobada' }, fulfillmentStatus: { name } })).not.toThrow();
  });
});
