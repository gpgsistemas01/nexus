import { describe, expect, it } from 'vitest';

import {
  matchesDetailIdentifier,
  removeDetail,
  upsertDetail
} from '../../../../../src/public/js/utils/detailCollectionUtils.js';

describe('detailCollectionUtils', () => {
  it('agrega un detalle nuevo sin sustituir otros detalles del CRUD', () => {
    const details = [{ materialId: 'material-1', quantity: 1 }];
    const detail = { materialId: 'material-2', quantity: 2 };

    const previousDetail = upsertDetail({
      details,
      detail,
      matches: item => item.materialId === detail.materialId
    });

    expect(previousDetail).toBeNull();
    expect(details).toEqual([
      { materialId: 'material-1', quantity: 1 },
      detail
    ]);
  });

  it('sustituye y devuelve el detalle anterior para aplicar efectos relacionados', () => {
    const previousDetail = { materialId: 'material-1', quantity: 1 };
    const details = [previousDetail];
    const detail = { materialId: 'material-1', quantity: 3 };

    const replacedDetail = upsertDetail({
      details,
      detail,
      matches: item => item.materialId === detail.materialId
    });

    expect(replacedDetail).toBe(previousDetail);
    expect(details).toEqual([detail]);
  });

  it('elimina y devuelve el detalle para coordinar totales o refrescar la tabla', () => {
    const detail = { wasteId: 'waste-1', quantity: 2 };
    const details = [detail, { wasteId: 'waste-2', quantity: 1 }];

    const removedDetail = removeDetail({
      details,
      matches: item => item.wasteId === detail.wasteId
    });

    expect(removedDetail).toBe(detail);
    expect(details).toEqual([{ wasteId: 'waste-2', quantity: 1 }]);
  });

  it('no modifica la colección cuando el detalle no existe', () => {
    const details = [{ materialId: 'material-1' }];

    const removedDetail = removeDetail({
      details,
      matches: item => item.materialId === 'missing'
    });

    expect(removedDetail).toBeNull();
    expect(details).toEqual([{ materialId: 'material-1' }]);
  });

  it.each([
    ['identificador documental al editar', 'detail-1'],
    ['identificador de merma al crear', 'waste-1']
  ])('reconoce el %s para eliminar un detalle del CRUD', (_, identifier) => {
    const detail = { id: 'detail-1', wasteId: 'waste-1' };

    expect(matchesDetailIdentifier({
      detail,
      identifier,
      inventoryIdKey: 'wasteId'
    })).toBe(true);
  });
});
