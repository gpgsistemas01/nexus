import { describe, expect, it } from 'vitest';

import { resolveIssueEditMode } from '../../../../../../src/public/js/ui/issues/issueFormUI.js';

describe('modo CRUD compartido de salidas según surtido', () => {
  it.each([
    ['surtido parcial', 'Surtido parcial'],
    ['surtido completo', 'Surtido']
  ])('limita a editar el encabezado cuando el documento tiene %s', (_, fulfillmentStatus) => {
    expect(resolveIssueEditMode({
      status: { name: 'Aprobada' },
      fulfillmentStatus: { name: fulfillmentStatus }
    })).toBe('edit-header');
  });

  it('habilita el CRUD de detalles únicamente cuando el documento está pendiente', () => {
    expect(resolveIssueEditMode({
      status: { name: 'Aprobada' },
      fulfillmentStatus: { name: 'Pendiente' }
    })).toBe('edit');
  });

  it('limita a consulta cuando el documento está cancelado', () => {
    expect(resolveIssueEditMode({
      status: { name: 'Cancelada' },
      fulfillmentStatus: { name: 'Cancelado' }
    })).toBe('view');
  });
});
