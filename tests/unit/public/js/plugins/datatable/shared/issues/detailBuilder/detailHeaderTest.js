import { describe, expect, it } from 'vitest';

import { FORM_MODES } from '../../../../../../../../../src/public/js/constants/formModes.js';
import { buildDetailsHeader } from '../../../../../../../../../src/public/js/plugins/datatable/shared/issues/detailBuilder/detailHeader.js';

describe('encabezado del detalle compartido para los CRUD de entradas y salidas', () => {
  it('compone las columnas de compra y sus acciones al editar una entrada', () => {
    const header = buildDetailsHeader({ type: 'receipt', mode: FORM_MODES.EDIT });

    expect(header).toContain('Compra');
    expect(header).toContain('Monto s/ IVA');
    expect(header).toContain('Monto c/ IVA');
    expect(header).toContain('Acciones');
    expect(header).not.toContain('Surtir');
  });

  it('compone surtido y proyecto al editar el detalle de una salida con permiso', () => {
    const header = buildDetailsHeader({
      type: 'issue',
      mode: FORM_MODES.EDIT_DETAIL,
      canManageProjectQuantity: true
    });

    expect(header).toContain('Salida');
    expect(header).toContain('Cantidad surtida');
    expect(header).toContain('Cantidad de proyecto');
    expect(header).toContain('Surtir');
    expect(header).not.toContain('Monto s/ IVA');
  });

  it('compone devolución sin acciones genéricas al devolver una salida', () => {
    const header = buildDetailsHeader({ type: 'issue', mode: FORM_MODES.RETURN });

    expect(header).toContain('Cantidad surtida');
    expect(header).toContain('Cantidad devuelta');
    expect(header).toContain('Acciones');
    expect(header).not.toContain('Surtir');
  });

  it('presenta el nombre del recurso del CRUD sin duplicar la tabla compartida', () => {
    const wasteHeader = buildDetailsHeader({
      type: 'issue',
      mode: FORM_MODES.CREATE,
      itemLabel: 'Merma'
    });
    const materialHeader = buildDetailsHeader({ type: 'issue', mode: FORM_MODES.CREATE });

    expect(wasteHeader).toContain('<th rowspan="2">Merma</th>');
    expect(wasteHeader).not.toContain('<th rowspan="2">Material</th>');
    expect(materialHeader).toContain('<th rowspan="2">Material</th>');
  });
});
