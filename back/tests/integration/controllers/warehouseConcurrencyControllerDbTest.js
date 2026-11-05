import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { ROLE_KEYS } from '../../../src/constants/roles.js';
import { createControllerTestApp } from '../../helpers/controllerTestHarness.js';
import { runContendedOperations } from '../../helpers/concurrentDatabaseOperations.js';
import { lockGoodsIssue, lockWasteIssue, lockGoodsReceipt } from '../../../src/repository/warehouse/documentLockRepository.js';
import { lockSupplierMaterialStock, lockWasteStock } from '../../../src/repository/warehouse/stockLockRepository.js';

let prisma;
let app;
let applyInventoryMovement;
let applyWasteMovement;
let createStockAdjustment;
const ids = {};
const suffix = randomUUID().slice(0, 8);
const goodsIds = [];
const wasteIds = [];
const receiptIds = [];
const materials = [];
const wastes = [];
const statuses = {};
const issueModel = kind => kind === 'goods' ? prisma.goodsIssue : prisma.wasteIssue;
const issueDetailModel = kind => kind === 'goods' ? prisma.goodsIssueDetail : prisma.wasteIssueDetail;

const createStock = async (kind = 'goods', stock = 20) => {
  const data = { name: `CC ${kind} ${randomUUID()}`, presentationId: ids.presentation, unitMeasureId: ids.unit };
  if (kind === 'waste') {
    const waste = await prisma.waste.create({ data: { ...data, supplierId: ids.supplier, base: 1, height: 1, currentStock: stock, convertedQuantity: stock } });
    wastes.push(waste.id);
    return waste;
  }
  const material = await prisma.material.create({ data: { ...data, type: kind === 'consumable' ? 'CONSUMABLE' : 'MATERIAL' } });
  materials.push(material.id);
  await prisma.supplierMaterial.create({ data: { materialId: material.id, supplierId: ids.supplier, currentStock: stock, convertedQuantity: stock, maxUnitCost: 10 } });
  return material;
};

const stock = async (kind, item) => {
  const value = kind === 'waste'
    ? await prisma.waste.findUnique({ where: { id: item.id } })
    : await prisma.supplierMaterial.findUnique({ where: { supplierId_materialId: { supplierId: ids.supplier, materialId: item.id } } });
  return [Number(value.currentStock), Number(value.convertedQuantity)];
};

const createIssue = async (kind, items) => {
  const issue = await issueModel(kind).create({ data: {
    referenceNumber: `CC-${randomUUID()}`, requestDate: new Date(), projectNumber: 'CC',
    departmentId: ids.department, departmentName: 'CC department', requesterId: ids.person, requesterName: 'CC person',
    advisorId: ids.person, advisorName: 'CC person', clientId: ids.client, clientName: 'CC client',
    statusId: ids.approved, fulfillmentStatusId: statuses.Pendiente,
    ...(kind === 'waste' && { createdById: ids.user }),
    details: { create: items.map(item => ({
      materialName: item.name, quantity: 4, convertedQuantity: 4, suppliedQuantity: 0,
      fulfillmentStatusId: statuses.Pendiente,
      ...(kind === 'goods' ? { materialId: item.id, supplierId: ids.supplier, maxUnitCost: 10 } : { wasteId: item.id })
    })) }
  }, include: { details: true } });
  (kind === 'goods' ? goodsIds : wasteIds).push(issue.id);
  return issue;
};

const contendIssue = (kind, issue, actions) => runContendedOperations({
  prisma, table: kind === 'goods' ? 'GoodsIssue' : 'WasteIssue',
  lock: tx => (kind === 'goods' ? lockGoodsIssue : lockWasteIssue)({ tx, id: issue.id }), actions
});
const supply = (kind, issue, details = issue.details) => request(app).patch(`/${kind}/${issue.id}/details`).send({
  details: details.map(detail => ({ id: detail.id, isSupplied: true, projectConvertedQuantity: 4 }))
});
const issueMovements = (kind, issue) => kind === 'goods'
  ? prisma.movementDetail.findMany({ where: { movement: { goodsIssueId: issue.id } } })
  : prisma.wasteMovementDetail.findMany({ where: { movement: { wasteIssueId: issue.id } } });

const createReceipt = async (count = 2) => {
  const items = await Promise.all(Array.from({ length: count }, () => createStock()));
  const receipt = await prisma.goodsReceipt.create({ data: {
    referenceNumber: `CC-${randomUUID()}`, supplierId: ids.supplier, supplierName: 'CC supplier',
    receivedById: ids.person, receivedByName: 'CC person', receptionDate: new Date(), statusId: ids.confirmed,
    totalQuantity: count * 2, totalNetPurchaseAmount: count * 20, totalGrossPurchaseAmount: count * 23.2,
    details: { create: items.map(item => ({ materialId: item.id, materialName: item.name, quantity: 2, convertedQuantity: 2,
      costPerUnitType: 10, conversionUnitCost: 10, netPurchaseAmount: 20, grossPurchaseAmount: 23.2 })) }
  }, include: { details: true } });
  receiptIds.push(receipt.id);
  return receipt;
};

describe('consistencia de operaciones simultáneas de almacén', () => {
  beforeAll(async () => {
    prisma = (await import('../../../src/lib/prisma.js')).prisma;
    ({ applyInventoryMovement } = await import('../../../src/services/inventory/movementService.js'));
    ({ applyWasteMovement } = await import('../../../src/services/warehouse/wastes/wasteMovementService.js'));
    ({ createStockAdjustment } = await import('../../../src/services/warehouse/adjustmentService.js'));
    const goods = await import('../../../src/controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueController.js');
    const waste = await import('../../../src/controllers/api/warehouse/wasteIssueController.js');
    const receipt = await import('../../../src/controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptController.js');
    const wasteStock = await import('../../../src/controllers/api/warehouse/wasteController.js');
    app = createControllerTestApp({ registerRoutes: router => {
      router.use((req, _res, next) => { req.user = { id: req.get('x-actor-id') || ids.user, accesses: [{ roleKey: ROLE_KEYS.SYSTEM_ADMIN }] }; next(); });
      router.patch('/goods/:id', goods.editMaterialGoodsIssue);
      router.patch('/goods/:id/details', goods.editMaterialGoodsIssueDetails);
      router.patch('/goods/:id/details/:detailId/returns', goods.registerMaterialGoodsIssueDetailReturn);
      router.patch('/waste/:id', waste.editWasteIssue);
      router.patch('/waste/:id/details', waste.editWasteIssueDetails);
      router.patch('/waste/:id/details/:detailId/returns', waste.registerWasteIssueDetailReturn);
      router.patch('/receipts/:id', receipt.editMaterialGoodsReceipt);
      router.patch('/receipts/:id/details/:detailId/corrections', receipt.correctMaterialGoodsReceiptDetail);
      router.patch('/receipts/:id/details/:detailId/cancel', receipt.cancelMaterialGoodsReceiptDetail);
      router.patch('/stock/waste/:id', wasteStock.editWasteStock);
    } });
    for (const name of ['Pendiente', 'Surtido parcial', 'Surtido', 'Cancelado']) {
      statuses[name] = (await prisma.fulfillmentStatus.upsert({ where: { name }, update: {}, create: { name } })).id;
    }
    ids.approved = (await prisma.status.upsert({ where: { name: 'Aprobada' }, update: {}, create: { name: 'Aprobada' } })).id;
    ids.confirmed = (await prisma.status.upsert({ where: { name: 'Confirmada' }, update: {}, create: { name: 'Confirmada' } })).id;
    ids.user = (await prisma.user.create({ data: { name: `CC${suffix}`, password: 'test-fixture' } })).id;
    ids.unit = (await prisma.unitMeasure.create({ data: { name: `CC unit ${suffix}`, symbol: `c${suffix}` } })).id;
    ids.presentation = (await prisma.presentation.create({ data: { name: `CC presentation ${suffix}` } })).id;
    ids.supplier = (await prisma.supplier.create({ data: { codeNumber: Date.now() % 100000000, code: `CC${suffix}`, legalName: `CC legal ${suffix}`, tradeName: `CC supplier ${suffix}` } })).id;
    ids.person = (await prisma.person.create({ data: { fullName: `CC person ${suffix}` } })).id;
    ids.department = (await prisma.department.create({ data: { name: `CC department ${suffix}` } })).id;
    ids.client = (await prisma.client.create({ data: { name: `CC client ${suffix}`, advisorId: ids.person } })).id;
    ids.reason = (await prisma.stockAdjustmentReason.create({ data: { name: `CC reason ${suffix}` } })).id;
  });

  afterAll(async () => {
    if (!prisma || !ids.supplier) return;
    await prisma.goodsIssueReturn.deleteMany({ where: { goodsIssueId: { in: goodsIds } } });
    await prisma.wasteIssueReturn.deleteMany({ where: { wasteIssueId: { in: wasteIds } } });
    await prisma.goodsReceiptDetailChange.deleteMany({ where: { goodsReceiptId: { in: receiptIds } } });
    const movements = await prisma.movementDetail.findMany({ where: { supplierId: ids.supplier }, select: { movementId: true } });
    await prisma.movementDetail.deleteMany({ where: { supplierId: ids.supplier } });
    await prisma.inventoryMovement.deleteMany({ where: { id: { in: movements.map(row => row.movementId) } } });
    const wasteMovements = await prisma.wasteMovementDetail.findMany({ where: { wasteId: { in: wastes } }, select: { movementId: true } });
    await prisma.wasteStockEntry.deleteMany({ where: { wasteId: { in: wastes } } });
    await prisma.wasteMovementDetail.deleteMany({ where: { wasteId: { in: wastes } } });
    await prisma.wasteMovement.deleteMany({ where: { id: { in: wasteMovements.map(row => row.movementId) } } });
    await prisma.wasteStockAdjustment.deleteMany({ where: { createdById: ids.user } });
    await prisma.stockAdjustmentDetail.deleteMany({ where: { stockAdjustment: { createdById: ids.user } } });
    await prisma.stockAdjustment.deleteMany({ where: { createdById: ids.user } });
    await prisma.goodsIssueDetail.deleteMany({ where: { goodsIssueId: { in: goodsIds } } });
    await prisma.goodsReceiptDetail.deleteMany({ where: { goodsReceiptId: { in: receiptIds } } });
    await prisma.goodsIssue.deleteMany({ where: { id: { in: goodsIds } } });
    await prisma.wasteIssue.deleteMany({ where: { id: { in: wasteIds } } });
    await prisma.goodsReceipt.deleteMany({ where: { id: { in: receiptIds } } });
    await prisma.waste.deleteMany({ where: { id: { in: wastes } } });
    await prisma.supplierMaterial.deleteMany({ where: { supplierId: ids.supplier } });
    await prisma.material.deleteMany({ where: { id: { in: materials } } });
    await prisma.supplier.delete({ where: { id: ids.supplier } });
    await prisma.user.delete({ where: { id: ids.user } });
    await prisma.client.delete({ where: { id: ids.client } });
    await prisma.person.delete({ where: { id: ids.person } });
    await prisma.department.delete({ where: { id: ids.department } });
    await prisma.presentation.delete({ where: { id: ids.presentation } });
    await prisma.unitMeasure.delete({ where: { id: ids.unit } });
    await prisma.stockAdjustmentReason.delete({ where: { id: ids.reason } });
  });

  it.each(['goods', 'waste'])('dos surtidos del mismo detalle de %s descuentan una sola vez', async kind => {
    const item = await createStock(kind);
    const issue = await createIssue(kind, [item]);
    const responses = await contendIssue(kind, issue, [() => supply(kind, issue), () => supply(kind, issue)]);
    expect(responses.map(row => row.status).sort()).toEqual([200, 409]);
    expect(await stock(kind, item)).toEqual([16, 16]);
    const detail = await issueDetailModel(kind).findUnique({ where: { id: issue.details[0].id } });
    expect(Number(detail.suppliedQuantity)).toBe(4);
    expect(await issueMovements(kind, issue)).toHaveLength(1);
  });

  it.each(['goods', 'waste'])('el surtido por lote de %s conserva detalles pendientes y ya surtidos', async kind => {
    const items = await Promise.all(Array.from({ length: 3 }, () => createStock(kind)));
    const issue = await createIssue(kind, items);
    const [first, second, pending] = issue.details;
    await supply(kind, issue, [first]).expect(200);
    await issueDetailModel(kind).update({
      where: { id: second.id },
      data: { updatedAt: new Date('2000-01-01T00:00:00Z') }
    });

    await request(app).patch(`/${kind}/${issue.id}/details`).send({ details: [
      { id: first.id, isSupplied: true, projectConvertedQuantity: 8 },
      { id: second.id, isSupplied: true, projectConvertedQuantity: 2.5 },
      { id: pending.id, isSupplied: false, projectConvertedQuantity: 1 }
    ] }).expect(200);

    const saved = await issueModel(kind).findUnique({
      where: { id: issue.id },
      include: { fulfillmentStatus: true, details: true }
    });
    const byId = new Map(saved.details.map(detail => [detail.id, detail]));
    expect(saved.fulfillmentStatus.name).toBe('Surtido parcial');
    expect(Number(byId.get(second.id).projectConvertedQuantity)).toBe(2.5);
    expect(Number(byId.get(second.id).convertedQuantityDifference)).toBe(1.5);
    expect(byId.get(second.id).updatedAt.getUTCFullYear()).toBeGreaterThan(2000);
    expect(byId.get(pending.id).isSupplied).toBe(false);
    expect(Number(byId.get(pending.id).suppliedQuantity)).toBe(0);
    // Se conserva el contrato existente: sólo materiales permiten editar el uso ya surtido.
    expect(Number(byId.get(first.id).projectConvertedQuantity)).toBe(kind === 'goods' ? 8 : 4);
    const pendingItemId = kind === 'goods' ? pending.materialId : pending.wasteId;
    expect(await Promise.all(items.map(item => stock(kind, item)))).toEqual(
      items.map(item => item.id === pendingItemId ? [20, 20] : [16, 16])
    );
    expect(await issueMovements(kind, issue)).toHaveLength(2);
  });

  it.each(['goods', 'waste'])('rechaza ids duplicados o ajenos en %s sin guardar parte del lote', async kind => {
    const item = await createStock(kind);
    const issue = await createIssue(kind, [item]);
    const other = await createIssue(kind, [item]);
    const detail = { id: issue.details[0].id, isSupplied: true, projectConvertedQuantity: 4 };

    for (const invalidId of [detail.id, other.details[0].id]) {
      const response = await request(app).patch(`/${kind}/${issue.id}/details`).send({
        details: [detail, { ...detail, id: invalidId }]
      }).expect(404);
      expect(response.body.code).toBe(kind === 'goods' ? 'GOODS_ISSUE_DETAIL_NOT_FOUND' : 'WASTE_ISSUE_DETAIL_NOT_FOUND');
    }

    const saved = await issueDetailModel(kind).findUnique({ where: { id: detail.id } });
    expect(saved.isSupplied).toBe(false);
    expect(saved.projectConvertedQuantity).toBeNull();
    expect(await stock(kind, item)).toEqual([20, 20]);
    expect(await issueMovements(kind, issue)).toHaveLength(0);
  });

  it.each(['goods', 'waste'])('surtir detalles distintos de %s conserva el estado final completo', async kind => {
    const items = await Promise.all([createStock(kind), createStock(kind)]);
    const issue = await createIssue(kind, items);
    const responses = await contendIssue(kind, issue, issue.details.map(detail => () => supply(kind, issue, [detail])));
    expect(responses.map(row => row.status)).toEqual([200, 200]);
    const saved = await issueModel(kind).findUnique({ where: { id: issue.id }, include: { fulfillmentStatus: true, details: true } });
    expect(saved.fulfillmentStatus.name).toBe('Surtido');
    expect(saved.details.every(detail => detail.isSupplied)).toBe(true);
    expect(await Promise.all(items.map(item => stock(kind, item)))).toEqual([[16, 16], [16, 16]]);
  });

  it.each(['goods', 'waste'])('dos lotes de %s con artículos en orden inverso conservan saldos e historial', async kind => {
    const items = await Promise.all([createStock(kind), createStock(kind)]);
    const first = await createIssue(kind, items);
    const second = await createIssue(kind, [...items].reverse());
    const lock = tx => kind === 'goods'
      ? lockSupplierMaterialStock({ tx, materialId: items[0].id, supplierId: ids.supplier })
      : lockWasteStock({ tx, id: items[0].id });
    const responses = await runContendedOperations({
      prisma,
      table: kind === 'goods' ? 'SupplierMaterial' : 'Waste',
      lock,
      actions: [() => supply(kind, first), () => supply(kind, second)]
    });

    expect(responses.map(response => response.status)).toEqual([200, 200]);
    expect(await Promise.all(items.map(item => stock(kind, item)))).toEqual([[12, 12], [12, 12]]);
    const lines = [...await issueMovements(kind, first), ...await issueMovements(kind, second)];
    for (const item of items) {
      const chain = lines.filter(line => (kind === 'goods' ? line.materialId : line.wasteId) === item.id)
        .map(line => [Number(line.previousStock), Number(line.newStock)]).sort((a, b) => b[0] - a[0]);
      expect(chain).toEqual([[20, 16], [16, 12]]);
    }
  });

  it.each(['goods', 'waste'])('dos devoluciones de %s respetan el saldo disponible', async kind => {
    const item = await createStock(kind);
    const issue = await createIssue(kind, [item]);
    await supply(kind, issue).expect(200);
    const perform = () => request(app).patch(`/${kind}/${issue.id}/details/${issue.details[0].id}/returns`).send({ returnQuantity: 3 });
    const responses = await contendIssue(kind, issue, [perform, perform]);
    expect(responses.map(row => row.status).sort()).toEqual([200, 409]);
    expect(await stock(kind, item)).toEqual([19, 19]);
    expect(Number((await issueDetailModel(kind).findUnique({ where: { id: issue.details[0].id } })).returnedQuantity)).toBe(3);
    const returns = kind === 'goods' ? prisma.goodsIssueReturn : prisma.wasteIssueReturn;
    expect(await returns.count({ where: kind === 'goods' ? { goodsIssueId: issue.id } : { wasteIssueId: issue.id } })).toBe(1);
  });

  it.each(['goods', 'waste'])('editar mientras se surte %s conserva los detalles respaldados por movimientos', async kind => {
    const item = await createStock(kind);
    const issue = await createIssue(kind, [item]);
    const edit = () => request(app).patch(`/${kind}/${issue.id}`).send({
      requesterId: ids.person, advisorId: ids.person, clientId: ids.client, departmentId: ids.department,
      projectNumber: 'CC', requestDate: new Date().toISOString(), details: [{ quantity: 4,
        ...(kind === 'goods' ? { materialId: item.id, supplierId: ids.supplier } : { wasteId: item.id }) }]
    });
    const responses = await contendIssue(kind, issue, [() => supply(kind, issue), edit]);
    expect(responses.filter(row => row.status === 200)).toHaveLength(1);
    expect(responses.every(row => [200, 404, 409].includes(row.status))).toBe(true);
    const saved = await issueModel(kind).findUnique({ where: { id: issue.id }, include: { details: true } });
    const movements = await issueMovements(kind, issue);
    if (movements.length) {
      expect(saved.details[0].id).toBe(issue.details[0].id);
      expect(saved.details[0].isSupplied).toBe(true);
      expect(await stock(kind, item)).toEqual([16, 16]);
    } else {
      expect(await stock(kind, item)).toEqual([20, 20]);
      expect(saved.details[0].isSupplied).toBe(false);
    }
  });

  it.each(['goods', 'waste'])('stock insuficiente revierte detalles y movimientos de %s', async kind => {
    const items = await Promise.all([createStock(kind), createStock(kind, 1)]);
    const issue = await createIssue(kind, items);
    await supply(kind, issue).expect(409);
    expect(await Promise.all(items.map(item => stock(kind, item)))).toEqual([[20, 20], [1, 1]]);
    const saved = await issueModel(kind).findUnique({ where: { id: issue.id }, include: { details: true, fulfillmentStatus: true } });
    expect(saved.details.every(detail => Number(detail.suppliedQuantity) === 0)).toBe(true);
    expect(saved.fulfillmentStatus.name).toBe('Pendiente');
    expect(await issueMovements(kind, issue)).toHaveLength(0);
  });

  it.each(['goods', 'consumable', 'waste'])('dos descuentos de %s conservan ambos saldos y el historial', async kind => {
    const item = await createStock(kind);
    const isWaste = kind === 'waste';
    const actions = [0, 1].map(() => () => prisma.$transaction(tx => isWaste
      ? applyWasteMovement({ tx, details: [{ wasteId: item.id, quantity: 4, convertedQuantity: 4 }], movementType: 'ISSUE' })
      : applyInventoryMovement({ tx, details: [{ materialId: item.id, supplierId: ids.supplier, quantity: 4 }], movementType: 'ISSUE' })));
    const movements = await runContendedOperations({ prisma, table: isWaste ? 'Waste' : 'SupplierMaterial', actions,
      lock: tx => isWaste ? lockWasteStock({ tx, id: item.id }) : lockSupplierMaterialStock({ tx, materialId: item.id, supplierId: ids.supplier }) });
    expect(await stock(kind, item)).toEqual([12, 12]);
    expect(movements.map(row => [Number(row.details[0].previousStock), Number(row.details[0].newStock)]).sort((a, b) => b[0] - a[0]))
      .toEqual([[20, 16], [16, 12]]);
  });

  it.each(['goods', 'waste'])('el ajuste de %s registra diferencias sobre el saldo vigente junto a una entrada', async kind => {
    const item = await createStock(kind, 10);
    const isWaste = kind === 'waste';
    const entry = () => prisma.$transaction(tx => isWaste
      ? applyWasteMovement({ tx, details: [{ wasteId: item.id, quantity: 3, convertedQuantity: 3 }], movementType: 'ENTRY' })
      : applyInventoryMovement({ tx, details: [{ materialId: item.id, supplierId: ids.supplier, quantity: 3 }], movementType: 'ENTRY' }));
    const adjust = () => isWaste
      ? request(app).patch(`/stock/waste/${item.id}`).send({ newStock: 8, reasonId: ids.reason })
      : createStockAdjustment({ materialId: item.id, supplierId: ids.supplier, newStock: 8, reasonId: ids.reason, userId: ids.user });
    const results = await runContendedOperations({ prisma, table: isWaste ? 'Waste' : 'SupplierMaterial', actions: [entry, adjust],
      lock: tx => isWaste ? lockWasteStock({ tx, id: item.id }) : lockSupplierMaterialStock({ tx, materialId: item.id, supplierId: ids.supplier }) });
    if (isWaste) expect(results[1].body.waste).toMatchObject({ id: item.id });
    const rows = isWaste
      ? await prisma.wasteMovementDetail.findMany({ where: { wasteId: item.id }, orderBy: { createdAt: 'asc' } })
      : await prisma.movementDetail.findMany({ where: { materialId: item.id }, orderBy: { createdAt: 'asc' } });
    expect(rows).toHaveLength(2);
    const [final] = await stock(kind, item);
    const last = rows.find(row => Number(row.newStock) === final && rows.some(other => other.id !== row.id && Number(other.newStock) === Number(row.previousStock)));
    expect(last).toBeDefined();
    for (const row of rows) expect(Number(row.newStock) - Number(row.previousStock)).toBe(Number(row.quantity));
  });

  it('corregir líneas distintas conserva los totales y las dos auditorías de compra', async () => {
    const receipt = await createReceipt();
    const responses = await runContendedOperations({ prisma, table: 'GoodsReceipt', lock: tx => lockGoodsReceipt({ tx, id: receipt.id }),
      actions: receipt.details.map((detail, index) => () => request(app).patch(`/receipts/${receipt.id}/details/${detail.id}/corrections`).send({ quantity: 2, costPerUnitType: 20 + index * 10 })) });
    expect(responses.map(row => row.status)).toEqual([200, 200]);
    const saved = await prisma.goodsReceipt.findUnique({ where: { id: receipt.id }, include: { details: true } });
    expect(Number(saved.totalNetPurchaseAmount)).toBe(100);
    expect(saved.details.reduce((sum, detail) => sum + Number(detail.netPurchaseAmount), 0)).toBe(100);
    expect(await prisma.goodsReceiptDetailChange.count({ where: { goodsReceiptId: receipt.id } })).toBe(2);
  });

  it('dos cancelaciones de la misma compra modifican existencias una sola vez', async () => {
    const receipt = await createReceipt(1);
    const perform = () => request(app).patch(`/receipts/${receipt.id}/details/${receipt.details[0].id}/cancel`);
    const responses = await runContendedOperations({ prisma, table: 'GoodsReceipt', lock: tx => lockGoodsReceipt({ tx, id: receipt.id }), actions: [perform, perform] });
    expect(responses.map(row => row.status).sort()).toEqual([200, 409]);
    expect(await stock('goods', { id: receipt.details[0].materialId })).toEqual([18, 18]);
    expect(await prisma.goodsReceiptDetailChange.count({ where: { goodsReceiptId: receipt.id } })).toBe(1);
    expect(await prisma.movementDetail.count({ where: { goodsReceiptDetailId: receipt.details[0].id } })).toBe(1);
  });

  it('agregar un detalle mientras se cancela el último conserva el estado de la compra', async () => {
    const receipt = await createReceipt(1);
    const item = await createStock();
    const responses = await runContendedOperations({ prisma, table: 'GoodsReceipt', lock: tx => lockGoodsReceipt({ tx, id: receipt.id }), actions: [
      () => request(app).patch(`/receipts/${receipt.id}/details/${receipt.details[0].id}/cancel`),
      () => request(app).patch(`/receipts/${receipt.id}`).send({
        supplierId: ids.supplier, receivedById: ids.person, receptionDate: new Date().toISOString(),
        details: [{ materialId: item.id, quantity: 2, costPerUnitType: 10 }]
      })
    ] });
    expect(responses[0].status).toBe(200);
    expect([200, 409]).toContain(responses[1].status);
    const saved = await prisma.goodsReceipt.findUnique({ where: { id: receipt.id }, include: { details: true, status: true } });
    const active = saved.details.filter(detail => detail.status === 'ACTIVE');
    expect(saved.status.name === 'Cancelada').toBe(active.length === 0);
    expect(await stock('goods', item)).toEqual(responses[1].status === 200 ? [22, 22] : [20, 20]);
  });

  it('un error en auditoría revierte la corrección, el stock y los costos de compra', async () => {
    const receipt = await createReceipt(1);
    const before = await prisma.goodsReceipt.findUnique({ where: { id: receipt.id }, include: { details: true } });
    await request(app).patch(`/receipts/${receipt.id}/details/${receipt.details[0].id}/corrections`).set('x-actor-id', randomUUID()).send({ quantity: 1, costPerUnitType: 30 }).expect(500);
    expect(await prisma.goodsReceipt.findUnique({ where: { id: receipt.id }, include: { details: true } })).toEqual(before);
    expect(await stock('goods', { id: receipt.details[0].materialId })).toEqual([20, 20]);
    expect(await prisma.movementDetail.count({ where: { goodsReceiptDetailId: receipt.details[0].id } })).toBe(0);
    const offer = await prisma.supplierMaterial.findUnique({ where: { supplierId_materialId: { supplierId: ids.supplier, materialId: receipt.details[0].materialId } } });
    expect(Number(offer.maxUnitCost)).toBe(10);
  });

  it('agregar detalles conserva los totales activos sin volver a sumar líneas canceladas', async () => {
    const receipt = await createReceipt();
    await request(app).patch(`/receipts/${receipt.id}/details/${receipt.details[0].id}/cancel`).expect(200);
    const item = await createStock();
    await request(app).patch(`/receipts/${receipt.id}`).send({
      supplierId: ids.supplier, receivedById: ids.person, receptionDate: new Date().toISOString(),
      details: [{ materialId: item.id, quantity: 2, costPerUnitType: 10 }]
    }).expect(200);
    const saved = await prisma.goodsReceipt.findUnique({ where: { id: receipt.id }, include: { details: true } });
    expect(Number(saved.totalQuantity)).toBe(4);
    expect(Number(saved.totalNetPurchaseAmount)).toBe(40);
    expect(saved.details).toHaveLength(3);
  });
});
