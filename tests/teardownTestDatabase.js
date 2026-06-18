import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export default async function teardownTestDatabase() {
  if (!process.env.DATABASE_TEST_URL || !existsSync(resolve('generated/prisma/client.ts'))) return;

  const { prisma } = await import('../src/lib/prisma.js');

  const adminUsers = await prisma.user.findMany({
    where: {
      OR: [
        { name: { startsWith: 'UsuarioIntegracion' } },
        { name: { startsWith: 'UsuarioEditado' } }
      ]
    },
    select: { id: true }
  });
  const adminProfiles = await prisma.profile.findMany({
    where: { fullName: { startsWith: 'Perfil integración' } },
    select: { id: true }
  });
  const adminRoles = await prisma.role.findMany({
    where: { name: { startsWith: 'IT Admin Role ' } },
    select: { id: true }
  });
  const adminDepartments = await prisma.department.findMany({
    where: { name: { startsWith: 'IT Admin Department' } },
    select: { id: true }
  });

  await prisma.userRoleDepartment.deleteMany({
    where: {
      OR: [
        { userId: { in: adminUsers.map(({ id }) => id) } },
        { roleId: { in: adminRoles.map(({ id }) => id) } },
        { departmentId: { in: adminDepartments.map(({ id }) => id) } }
      ]
    }
  });
  await prisma.user.deleteMany({ where: { id: { in: adminUsers.map(({ id }) => id) } } });
  await prisma.departmentProfile.deleteMany({
    where: {
      OR: [
        { profileId: { in: adminProfiles.map(({ id }) => id) } },
        { departmentId: { in: adminDepartments.map(({ id }) => id) } }
      ]
    }
  });
  await prisma.profile.deleteMany({ where: { id: { in: adminProfiles.map(({ id }) => id) } } });
  await prisma.role.deleteMany({ where: { id: { in: adminRoles.map(({ id }) => id) } } });
  await prisma.department.deleteMany({ where: { id: { in: adminDepartments.map(({ id }) => id) } } });

  const receiptProducts = await prisma.product.findMany({ where: { name: { startsWith: 'IT Receipt Product ' } }, select: { id: true } });
  const receiptSuppliers = await prisma.supplier.findMany({ where: { tradeName: { startsWith: 'IT Receipt Supplier ' } }, select: { id: true } });
  const receiptProfiles = await prisma.profile.findMany({ where: { fullName: { startsWith: 'IT Receipt Profile ' } }, select: { id: true } });
  const receiptPresentations = await prisma.presentation.findMany({ where: { name: { startsWith: 'IT Receipt Presentation ' } }, select: { id: true } });
  const receiptUnits = await prisma.unitMeasure.findMany({ where: { name: { startsWith: 'IT REC Unit ' } }, select: { id: true } });
  const receipts = await prisma.goodsReceipt.findMany({
    where: {
      OR: [
        { invoice: { startsWith: 'REC-' } },
        { supplierId: { in: receiptSuppliers.map(({ id }) => id) } },
        { receivedById: { in: receiptProfiles.map(({ id }) => id) } }
      ]
    },
    select: { id: true }
  });
  const receiptDetails = await prisma.goodsReceiptDetail.findMany({ where: { goodsReceiptId: { in: receipts.map(({ id }) => id) } }, select: { id: true } });

  await prisma.movementDetail.deleteMany({ where: { goodsReceiptDetailId: { in: receiptDetails.map(({ id }) => id) } } });
  await prisma.inventoryMovement.deleteMany({ where: { goodsReceiptId: { in: receipts.map(({ id }) => id) } } });
  await prisma.goodsReceiptDetail.deleteMany({ where: { id: { in: receiptDetails.map(({ id }) => id) } } });
  await prisma.goodsReceipt.deleteMany({ where: { id: { in: receipts.map(({ id }) => id) } } });
  await prisma.supplierProduct.deleteMany({ where: { OR: [{ productId: { in: receiptProducts.map(({ id }) => id) } }, { supplierId: { in: receiptSuppliers.map(({ id }) => id) } }] } });
  await prisma.product.deleteMany({ where: { id: { in: receiptProducts.map(({ id }) => id) } } });
  await prisma.supplier.deleteMany({ where: { id: { in: receiptSuppliers.map(({ id }) => id) } } });
  await prisma.profile.deleteMany({ where: { id: { in: receiptProfiles.map(({ id }) => id) } } });
  await prisma.presentation.deleteMany({ where: { id: { in: receiptPresentations.map(({ id }) => id) } } });
  await prisma.unitMeasure.deleteMany({ where: { id: { in: receiptUnits.map(({ id }) => id) } } });

  const wasteIssueProducts = await prisma.product.findMany({ where: { name: { startsWith: 'IT WasteIssue Product ' } }, select: { id: true } });
  const wasteIssueSuppliers = await prisma.supplier.findMany({ where: { tradeName: { startsWith: 'IT WasteIssue Supplier ' } }, select: { id: true } });
  const wasteIssueReasons = await prisma.stockAdjustmentReason.findMany({ where: { name: { startsWith: 'IT WasteIssue Reason ' } }, select: { id: true } });
  const wasteIssueUsers = await prisma.user.findMany({ where: { name: { startsWith: 'ITWasteIssueUser' } }, select: { id: true } });
  const wasteIssueProfiles = await prisma.profile.findMany({ where: { fullName: { startsWith: 'IT WasteIssue ' } }, select: { id: true } });
  const wasteIssueDepartments = await prisma.department.findMany({ where: { name: { startsWith: 'IT WasteIssue Department ' } }, select: { id: true } });
  const wasteIssueClients = await prisma.client.findMany({ where: { name: { startsWith: 'IT WasteIssue Client ' } }, select: { id: true } });
  const wasteIssuePresentations = await prisma.presentation.findMany({ where: { name: { startsWith: 'IT WasteIssue Presentation ' } }, select: { id: true } });
  const wasteIssueUnits = await prisma.unitMeasure.findMany({ where: { name: { startsWith: 'IT WI Unit ' } }, select: { id: true } });
  const wasteIssueAdjustments = await prisma.stockAdjustment.findMany({
    where: {
      OR: [
        { reasonId: { in: wasteIssueReasons.map(({ id }) => id) } },
        { createdById: { in: wasteIssueUsers.map(({ id }) => id) } },
        { details: { some: { productId: { in: wasteIssueProducts.map(({ id }) => id) } } } },
        { details: { some: { supplierId: { in: wasteIssueSuppliers.map(({ id }) => id) } } } }
      ]
    },
    select: { id: true }
  });
  const wasteIssueAdjustmentDetails = await prisma.stockAdjustmentDetail.findMany({
    where: { stockAdjustmentId: { in: wasteIssueAdjustments.map(({ id }) => id) } },
    select: { id: true }
  });
  const wasteIssueGoodsIssues = await prisma.goodsIssue.findMany({
    where: {
      OR: [
        { clientId: { in: wasteIssueClients.map(({ id }) => id) } },
        { requesterId: { in: wasteIssueProfiles.map(({ id }) => id) } },
        { departmentId: { in: wasteIssueDepartments.map(({ id }) => id) } },
        { projectNumber: { startsWith: 'IW' } }
      ]
    },
    select: { id: true }
  });

  await prisma.goodsIssueDetail.deleteMany({ where: { goodsIssueId: { in: wasteIssueGoodsIssues.map(({ id }) => id) } } });
  await prisma.goodsIssue.deleteMany({ where: { id: { in: wasteIssueGoodsIssues.map(({ id }) => id) } } });
  await prisma.waste.deleteMany({ where: { supplierProduct: { productId: { in: wasteIssueProducts.map(({ id }) => id) } } } });
  await prisma.movementDetail.deleteMany({ where: { stockAdjustmentDetailId: { in: wasteIssueAdjustmentDetails.map(({ id }) => id) } } });
  await prisma.inventoryMovement.deleteMany({ where: { stockAdjustmentId: { in: wasteIssueAdjustments.map(({ id }) => id) } } });
  await prisma.stockAdjustmentDetail.deleteMany({ where: { id: { in: wasteIssueAdjustmentDetails.map(({ id }) => id) } } });
  await prisma.stockAdjustment.deleteMany({ where: { id: { in: wasteIssueAdjustments.map(({ id }) => id) } } });
  await prisma.supplierProduct.deleteMany({ where: { OR: [{ productId: { in: wasteIssueProducts.map(({ id }) => id) } }, { supplierId: { in: wasteIssueSuppliers.map(({ id }) => id) } }] } });
  await prisma.product.deleteMany({ where: { id: { in: wasteIssueProducts.map(({ id }) => id) } } });
  await prisma.supplier.deleteMany({ where: { id: { in: wasteIssueSuppliers.map(({ id }) => id) } } });
  await prisma.stockAdjustmentReason.deleteMany({ where: { id: { in: wasteIssueReasons.map(({ id }) => id) } } });
  await prisma.client.deleteMany({ where: { id: { in: wasteIssueClients.map(({ id }) => id) } } });
  await prisma.departmentProfile.deleteMany({ where: { OR: [{ profileId: { in: wasteIssueProfiles.map(({ id }) => id) } }, { departmentId: { in: wasteIssueDepartments.map(({ id }) => id) } }] } });
  await prisma.profile.deleteMany({ where: { id: { in: wasteIssueProfiles.map(({ id }) => id) } } });
  await prisma.department.deleteMany({ where: { id: { in: wasteIssueDepartments.map(({ id }) => id) } } });
  await prisma.user.deleteMany({ where: { id: { in: wasteIssueUsers.map(({ id }) => id) } } });
  await prisma.presentation.deleteMany({ where: { id: { in: wasteIssuePresentations.map(({ id }) => id) } } });
  await prisma.unitMeasure.deleteMany({ where: { id: { in: wasteIssueUnits.map(({ id }) => id) } } });

  const adjustmentProducts = await prisma.product.findMany({
    where: { name: { startsWith: 'IT Adjustment Product ' } },
    select: { id: true }
  });
  const adjustmentSuppliers = await prisma.supplier.findMany({
    where: { tradeName: { startsWith: 'IT Adjustment Supplier ' } },
    select: { id: true }
  });
  const adjustmentReasons = await prisma.stockAdjustmentReason.findMany({
    where: { name: { startsWith: 'IT Adjustment Reason ' } },
    select: { id: true }
  });
  const adjustmentUsers = await prisma.user.findMany({
    where: { name: { startsWith: 'ITAdjustUser' } },
    select: { id: true }
  });
  const adjustmentPresentations = await prisma.presentation.findMany({
    where: { name: { startsWith: 'IT Adjustment Presentation ' } },
    select: { id: true }
  });
  const adjustmentUnits = await prisma.unitMeasure.findMany({
    where: { name: { startsWith: 'IT Adj Unit ' } },
    select: { id: true }
  });
  const adjustments = await prisma.stockAdjustment.findMany({
    where: {
      OR: [
        { reasonId: { in: adjustmentReasons.map(({ id }) => id) } },
        { createdById: { in: adjustmentUsers.map(({ id }) => id) } },
        { details: { some: { productId: { in: adjustmentProducts.map(({ id }) => id) } } } },
        { details: { some: { supplierId: { in: adjustmentSuppliers.map(({ id }) => id) } } } }
      ]
    },
    select: { id: true }
  });
  const adjustmentDetails = await prisma.stockAdjustmentDetail.findMany({
    where: { stockAdjustmentId: { in: adjustments.map(({ id }) => id) } },
    select: { id: true }
  });

  await prisma.movementDetail.deleteMany({
    where: { stockAdjustmentDetailId: { in: adjustmentDetails.map(({ id }) => id) } }
  });
  await prisma.inventoryMovement.deleteMany({
    where: { stockAdjustmentId: { in: adjustments.map(({ id }) => id) } }
  });
  await prisma.stockAdjustmentDetail.deleteMany({
    where: { id: { in: adjustmentDetails.map(({ id }) => id) } }
  });
  await prisma.stockAdjustment.deleteMany({
    where: { id: { in: adjustments.map(({ id }) => id) } }
  });
  await prisma.supplierProduct.deleteMany({
    where: {
      OR: [
        { productId: { in: adjustmentProducts.map(({ id }) => id) } },
        { supplierId: { in: adjustmentSuppliers.map(({ id }) => id) } }
      ]
    }
  });
  await prisma.product.deleteMany({ where: { id: { in: adjustmentProducts.map(({ id }) => id) } } });
  await prisma.supplier.deleteMany({ where: { id: { in: adjustmentSuppliers.map(({ id }) => id) } } });
  await prisma.stockAdjustmentReason.deleteMany({ where: { id: { in: adjustmentReasons.map(({ id }) => id) } } });
  await prisma.user.deleteMany({ where: { id: { in: adjustmentUsers.map(({ id }) => id) } } });
  await prisma.presentation.deleteMany({ where: { id: { in: adjustmentPresentations.map(({ id }) => id) } } });
  await prisma.unitMeasure.deleteMany({ where: { id: { in: adjustmentUnits.map(({ id }) => id) } } });

  await prisma.stockAdjustmentReason.deleteMany({ where: { name: { startsWith: 'IT Reason ' } } });
  await prisma.fulfillmentStatus.deleteMany({ where: { name: { startsWith: 'IT Status ' } } });
  await prisma.unitMeasure.deleteMany({ where: { name: { startsWith: 'IT Unit ' } } });
  await prisma.presentation.deleteMany({ where: { name: { startsWith: 'IT Presentation ' } } });
  await prisma.role.deleteMany({ where: { name: { startsWith: 'IT Role ' } } });
  await prisma.department.deleteMany({ where: { name: { startsWith: 'IT Department ' } } });
  await prisma.supplier.deleteMany({ where: { tradeName: { startsWith: 'Proveedor integración ' } } });
  await prisma.client.deleteMany({ where: { name: { startsWith: 'Cliente integración ' } } });

  await prisma.$disconnect();
}
