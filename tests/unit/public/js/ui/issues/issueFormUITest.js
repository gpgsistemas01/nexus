import { describe, expect, it } from 'vitest';

import {
  applyIssueModalMode,
  resolveIssueEditMode
} from '../../../../../../src/public/js/ui/issues/issueFormUI.js';

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

describe('etiquetas del formulario compartido de salidas', () => {
  it('usa el verbo de la operación para confirmar el surtimiento', () => {
    const title = { textContent: '' };
    const submit = {
      textContent: '',
      classList: { add: () => {} }
    };

    applyIssueModalMode({
      form: { querySelector: () => submit },
      modalElement: { querySelector: () => title },
      mode: 'edit-detail',
      entityName: 'salida',
      referenceNumber: 'S-1',
      createTitle: 'Registrar salida',
      detailAction: 'Surtir materiales de la'
    });

    expect(title.textContent).toBe('Surtir materiales de la salida - Folio S-1');
    expect(submit.textContent).toBe('Surtir');
  });
});
