import { ROLE_KEYS } from '../../src/constants/roles.js';
import { DEPARTMENT_KEYS } from '../../src/constants/departments.js';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const chunk = async (rows, model) => {
  for (let offset = 0; offset < rows.length; offset += 500) await model.createMany({ data: rows.slice(offset, offset + 500) });
};

export const createBackendFixture = async ({ prisma, count }) => {
  const suffix = randomUUID().slice(0, 8);
  const statuses = {};
  for (const name of ['Pendiente', 'Surtido parcial', 'Surtido', 'Cancelado']) {
    statuses[name] = (await prisma.fulfillmentStatus.upsert({ where: { name }, update: {}, create: { name } })).id;
  }
  const approved = await prisma.status.upsert({ where: { name: 'Aprobada' }, update: {}, create: { name: 'Aprobada' } });
  const confirmed = await prisma.status.upsert({ where: { name: 'Confirmada' }, update: {}, create: { name: 'Confirmada' } });
  const system = await prisma.department.upsert({ where: { name: 'SISTEMAS' }, update: {}, create: { name: 'SISTEMAS', key: DEPARTMENT_KEYS.SYSTEMS } });
  const role = await prisma.role.upsert({ where: { name: 'Administrador del sistema' }, update: {}, create: { name: 'Administrador del sistema', key: ROLE_KEYS.SYSTEM_ADMIN } });
  const user = await prisma.user.create({ data: { name: `Perf${suffix}`, password: 'test-fixture', accesses: { create: { roleId: role.id, departmentId: system.id } } } });
  const unit = await prisma.unitMeasure.create({ data: { name: 'METRO CUADRADO', symbol: suffix } });
  const presentation = await prisma.presentation.create({ data: { name: `Perf${suffix}` } });
  const supplier = await prisma.supplier.create({ data: { codeNumber: Date.now() % 100000000, code: suffix, legalName: suffix, tradeName: suffix } });
  const person = await prisma.person.create({ data: { fullName: suffix } });
  const department = await prisma.department.create({ data: { name: suffix } });
  const client = await prisma.client.create({ data: { name: suffix, advisorId: person.id } });
  const initialStock = 100000;
  const materialData = Array.from({ length: count }, (_, index) => ({ id: randomUUID(), name: `Perf ${String(index).padStart(6, '0')} ${suffix}`, presentationId: presentation.id, unitMeasureId: unit.id, ...(index % 2 ? {} : { base: 1, height: 1 }), type: index % 2 ? 'CONSUMABLE' : 'MATERIAL' }));
  await chunk(materialData, prisma.material);
  await chunk(materialData.map(item => ({ materialId: item.id, supplierId: supplier.id, currentStock: initialStock, convertedQuantity: initialStock, maxUnitCost: 10 })), prisma.supplierMaterial);
  const wasteData = materialData.map(({ id, type, ...item }) => ({ ...item, id: randomUUID(), supplierId: supplier.id, base: 1, height: 1, currentStock: initialStock, convertedQuantity: initialStock }));
  await chunk(wasteData, prisma.waste);
  const header = { requestDate: new Date(), projectNumber: suffix, departmentId: department.id, departmentName: suffix,
    requesterId: person.id, requesterName: suffix, advisorId: person.id, advisorName: suffix, clientId: client.id,
    clientName: suffix, statusId: approved.id, fulfillmentStatusId: statuses.Pendiente };
  const materials = materialData.filter(item => item.type === 'MATERIAL');
  const createIssue = async (kind, size = 100) => {
    const items = (kind === 'goods' ? materials : wasteData).slice(0, size);
    return (kind === 'goods' ? prisma.goodsIssue : prisma.wasteIssue).create({ data: {
      ...header, referenceNumber: randomUUID(), ...(kind === 'waste' && { createdById: user.id }),
      details: { create: items.map(item => ({ materialName: item.name, quantity: 4, convertedQuantity: 4,
        suppliedQuantity: 0, fulfillmentStatusId: statuses.Pendiente,
        ...(kind === 'goods' ? { materialId: item.id, supplierId: supplier.id, maxUnitCost: 10 } : { wasteId: item.id }) })) }
    }, include: { details: true } });
  };
  for (let index = 0; index < 30; index++) {
    await createIssue('goods', 10);
    await createIssue('waste', 10);
  }
  const movement = await prisma.inventoryMovement.create({ data: { type: 'ENTRY' } });
  await chunk(materials.map(item => ({ movementId: movement.id, materialId: item.id, supplierId: supplier.id, quantity: 1, previousStock: 0, newStock: 1 })), prisma.movementDetail);
  const receipt = await prisma.goodsReceipt.create({ data: {
    referenceNumber: randomUUID(), supplierId: supplier.id, supplierName: suffix, receivedById: person.id,
    receivedByName: suffix, receptionDate: new Date(), statusId: confirmed.id, totalQuantity: materials.length,
    totalNetPurchaseAmount: materials.length * 10, totalGrossPurchaseAmount: materials.length * 11.6
  } });
  await chunk(materials.map(item => ({ goodsReceiptId: receipt.id, materialId: item.id, materialName: item.name, quantity: 1, convertedQuantity: 1, costPerUnitType: 10, conversionUnitCost: 10, netPurchaseAmount: 10, grossPurchaseAmount: 11.6 })), prisma.goodsReceiptDetail);

  const verifySupply = async (kind, requests) => {
    const itemIds = (kind === 'goods' ? materials : wasteData).slice(0, 100).map(item => item.id);
    const stocks = kind === 'goods'
      ? await prisma.supplierMaterial.findMany({ where: { supplierId: supplier.id, materialId: { in: itemIds } } })
      : await prisma.waste.findMany({ where: { id: { in: itemIds } } });
    const expected = initialStock - requests * 4;
    assert.equal(stocks.length, 100);
    assert(stocks.every(row => Number(row.currentStock) === expected && Number(row.convertedQuantity) === expected));
  };
  const cleanup = async () => {
    await prisma.criticalWriteAudit.deleteMany({ where: { actorId: user.id } });
    await prisma.movementDetail.deleteMany({ where: { supplierId: supplier.id } });
    await prisma.inventoryMovement.deleteMany({ where: { OR: [{ id: movement.id }, { goodsIssue: { departmentId: department.id } }] } });
    await prisma.wasteMovementDetail.deleteMany({ where: { waste: { supplierId: supplier.id } } });
    await prisma.wasteMovement.deleteMany({ where: { wasteIssue: { departmentId: department.id } } });
    await prisma.goodsIssueDetail.deleteMany({ where: { goodsIssue: { departmentId: department.id } } });
    await prisma.goodsIssue.deleteMany({ where: { departmentId: department.id } });
    await prisma.wasteIssue.deleteMany({ where: { departmentId: department.id } });
    await prisma.goodsReceiptDetail.deleteMany({ where: { goodsReceiptId: receipt.id } });
    await prisma.goodsReceipt.delete({ where: { id: receipt.id } });
    await prisma.waste.deleteMany({ where: { supplierId: supplier.id } });
    await prisma.supplierMaterial.deleteMany({ where: { supplierId: supplier.id } });
    await prisma.material.deleteMany({ where: { presentationId: presentation.id } });
    await prisma.userRoleDepartment.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.supplier.delete({ where: { id: supplier.id } });
    await prisma.client.delete({ where: { id: client.id } });
    await prisma.person.delete({ where: { id: person.id } });
    await prisma.department.delete({ where: { id: department.id } });
    await prisma.presentation.delete({ where: { id: presentation.id } });
    await prisma.unitMeasure.delete({ where: { id: unit.id } });
  };
  return { user, supplier, createIssue, verifySupply, cleanup };
};
