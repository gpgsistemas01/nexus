import { describe, expect, it } from 'vitest';

import {
  matchesDetailIdentifier,
  removeDetail,
  upsertDetail,
  upsertIssueDetail
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

  it.each([
    ['material', 'materialId', 'material-2', { supplierId: 'supplier-1' }],
    ['merma', 'wasteId', 'waste-2', {}]
  ])('agrega y elimina un detalle nuevo de %s durante la edición pendiente', (
    _,
    inventoryIdKey,
    inventoryId,
    identity
  ) => {
    const details = [];
    const newDetail = { [inventoryIdKey]: inventoryId, ...identity, quantity: 2 };

    upsertIssueDetail({
      details,
      detail: newDetail,
      matches: detail => (
        detail[inventoryIdKey] === inventoryId
        && Object.entries(identity).every(([key, value]) => detail[key] === value)
      )
    });
    const removedDetail = removeDetail({
      details,
      matches: detail => matchesDetailIdentifier({
        detail,
        identifier: inventoryId,
        inventoryIdKey
      })
    });

    expect(removedDetail).toBe(newDetail);
    expect(details).toEqual([]);
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

  it.each([
    [
      'material del mismo proveedor',
      { id: 'detail-1', materialId: 'material-1', supplierId: 'supplier-1', quantity: 1 },
      { materialId: 'material-1', supplierId: 'supplier-1', quantity: 3 },
      detail => detail.materialId === 'material-1' && detail.supplierId === 'supplier-1'
    ],
    [
      'merma',
      { id: 'detail-1', wasteId: 'waste-1', quantity: 1 },
      { wasteId: 'waste-1', quantity: 3 },
      detail => detail.wasteId === 'waste-1'
    ]
  ])('sustituye durante la edición pendiente %s ya registrado y conserva su id', (
    _,
    previousDetail,
    editedDetail,
    matches
  ) => {
    const details = [previousDetail];

    const replacedDetail = upsertIssueDetail({
      details,
      detail: editedDetail,
      matches
    });

    expect(replacedDetail).toBe(previousDetail);
    expect(details).toEqual([{ ...editedDetail, id: 'detail-1' }]);
  });

  it('agrega otra relación cuando se registra el mismo material con un proveedor diferente', () => {
    const persistedDetail = {
      id: 'detail-1',
      materialId: 'material-1',
      supplierId: 'supplier-1',
      quantity: 1
    };
    const details = [persistedDetail];
    const newDetail = {
      materialId: 'material-1',
      supplierId: 'supplier-2',
      quantity: 3
    };

    const replacedDetail = upsertDetail({
      details,
      detail: newDetail,
      matches: detail => (
        detail.materialId === newDetail.materialId
        && detail.supplierId === newDetail.supplierId
      ),
      preserveKeys: ['id']
    });

    expect(replacedDetail).toBeNull();
    expect(details).toEqual([persistedDetail, newDetail]);
  });

  it.each([
    ['material', 'materialId', 'material-1', { supplierId: 'supplier-1' }],
    ['merma', 'wasteId', 'waste-1', {}]
  ])('elimina durante la edición pendiente un detalle de %s registrado después de sustituirlo', (
    _,
    inventoryIdKey,
    inventoryId,
    identity
  ) => {
    const persistedDetail = { id: 'detail-1', [inventoryIdKey]: inventoryId, ...identity, quantity: 1 };
    const details = [persistedDetail];

    upsertIssueDetail({
      details,
      detail: { [inventoryIdKey]: inventoryId, ...identity, quantity: 3 },
      matches: item => (
        item[inventoryIdKey] === inventoryId
        && Object.entries(identity).every(([key, value]) => item[key] === value)
      )
    });
    const removedDetail = removeDetail({
      details,
      matches: detail => matchesDetailIdentifier({
        detail,
        identifier: 'detail-1',
        inventoryIdKey
      })
    });

    expect(removedDetail).toEqual({
      id: 'detail-1',
      [inventoryIdKey]: inventoryId,
      ...identity,
      quantity: 3
    });
    expect(details).toEqual([]);
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
