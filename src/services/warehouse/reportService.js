import { formatDateLongWithTime, roundTo, toNumber } from "../../utils/formattersUtils.js";
import { findAllGoodsIssues } from "./goodsIssues/goodsIssueService.js";
import { findAllGoodsReceipts } from "./goodsReceipts/goodsReceiptService.js";
import { findAllWasteIssues } from "./wasteIssues/wasteIssueService.js";
import { findAllSuppliers } from "./supplierService.js";
import { FULFILLMENT_STATUS_NAMES, GOODS_RECEIPT_STATUS_NAMES } from "../../constants/warehouseStatuses.js";
import { getDb } from "../../repository/baseRepository.js";

const INVENTORY_REPORT_MATERIAL_SELECT = {
    maxUnitCost: true,
    currentStock: true,
    convertedQuantity: true,
    material: {
        select: {
            name: true,
            minStock: true,
            base: true,
            height: true,
            presentation: { select: { name: true } },
            unitMeasure: { select: { name: true } }
        }
    },
    supplier: { select: { tradeName: true } }
};

const WASTE_REPORT_SELECT = {
    id: true,
    base: true,
    height: true,
    currentStock: true,
    convertedQuantity: true,
    maxUnitCost: true,
    name: true,
    supplierId: true,
    supplier: { select: { tradeName: true } },
    presentation: { select: { name: true } },
    unitMeasure: { select: { name: true } }
};

const mapMaterialRows = (materials = []) => materials.map((item) => ({
    supplier: item.supplier?.tradeName,
    name: item.name,
    base: toNumber(item.base),
    height: toNumber(item.height),
    currentStock: toNumber(item.currentStock),
    minStock: toNumber(item.minStock),
    presentation: item.presentation?.name,
    convertedQuantity: toNumber(item.convertedQuantity),
    unitMeasure: item.unitMeasure?.name,
    maxUnitCost: toNumber(item.maxUnitCost)
}));


const mapWasteRows = (wastes = []) => wastes.map((item) => ({
    id: item.id,
    materialId: item.materialId,
    supplierId: item.supplierId,
    supplier: item.supplier?.tradeName,
    name: item.name,
    base: toNumber(item.base),
    height: toNumber(item.height),
    currentStock: toNumber(item.currentStock),
    presentation: item.presentation?.name,
    convertedQuantity: toNumber(item.convertedQuantity),
    unitMeasure: item.unitMeasure?.name,
    maxUnitCost: toNumber(item.maxUnitCost)
}));

const mapInventoryReportMaterial = ({ material, supplier, ...stock }) => ({
    ...material,
    ...stock,
    supplier
});

const mapIssueDetailRow = ({ issue, detail, material, supplier }) => ({
    referenceNumber: issue.referenceNumber,
    requestDate: formatDateLongWithTime(issue.requestDate),
    departmentName: issue.departmentName,
    requesterName: issue.requesterName,
    clientName: issue.clientName,
    projectNumber: issue.projectNumber,
    fulfillmentStatusName: issue.fulfillmentStatus?.name,
    materialName: detail.materialName,
    supplierName: supplier?.tradeName,
    materialBase: toNumber(material?.base),
    materialHeight: toNumber(material?.height),
    requestedQuantity: toNumber(detail.quantity),
    suppliedQuantity: toNumber(detail.suppliedQuantity),
    presentationName: material?.presentation?.name,
    convertedQuantity: toNumber(detail.convertedQuantity),
    convertedUnitMeasureName: material?.unitMeasure?.symbol || material?.unitMeasure?.name,
    projectConvertedQuantity: toNumber(detail.projectConvertedQuantity),
    convertedQuantityDifference: toNumber(detail.convertedQuantityDifference),
    detailFulfillmentStatusName: detail.fulfillmentStatus?.name
});

const mapGoodsIssueDetailRows = (goodsIssues = [], { supplierId = '', materialId = '' } = {}) => goodsIssues.flatMap((goodsIssue) => {

    const details = (goodsIssue.details || []).filter((detail) => {
        const isCanceledDetail = detail.fulfillmentStatus?.name === FULFILLMENT_STATUS_NAMES.CANCELED;

        return (
            !isCanceledDetail &&
            (!supplierId || detail.supplierId === supplierId) &&
            (!materialId || detail.materialId === materialId)
        );
    });

    return details.map(detail => mapIssueDetailRow({
        issue: goodsIssue,
        detail,
        material: detail.material,
        supplier: detail.supplier
    }));
});

const mapWasteIssueDetailRows = (wasteIssues = []) => wasteIssues.flatMap((wasteIssue) => (
    (wasteIssue.details || [])
        .filter(detail => detail.fulfillmentStatus?.name !== FULFILLMENT_STATUS_NAMES.CANCELED)
        .map(detail => mapIssueDetailRow({
            issue: wasteIssue,
            detail,
            material: {
                name: detail.waste?.name,
                base: detail.waste?.base,
                height: detail.waste?.height
            },
            supplier: detail.waste?.supplier
        }))
));

const mapGoodsReceiptDetailRows = (goodsReceipts = [], { materialId = '' } = {}) => goodsReceipts.flatMap((goodsReceipt) => {

    if (goodsReceipt.status?.name === GOODS_RECEIPT_STATUS_NAMES.CANCELED) return [];

    const details = (goodsReceipt.details || []).filter((detail) => {
        const isCanceledDetail = detail.status === 'CANCELED';

        return (
            !isCanceledDetail &&
            (!materialId || detail.materialId === materialId)
        );
    });

    return details.map((detail) => ({
        referenceNumber: goodsReceipt.referenceNumber,
        receptionDate: formatDateLongWithTime(goodsReceipt.receptionDate),
        receivedByName: goodsReceipt.receivedByName,
        supplierName: goodsReceipt.supplierName,
        invoice: goodsReceipt.isInvoiced ? goodsReceipt.invoice : 'Sin factura',
        materialId: detail.materialId,
        materialName: detail.materialName,
        materialBase: toNumber(detail.material?.base),
        materialHeight: toNumber(detail.material?.height),
        quantity: toNumber(detail.quantity),
        presentationName: detail.material?.presentation?.name,
        convertedQuantity: toNumber(detail.convertedQuantity),
        unitMeasureName: detail.material?.unitMeasure?.symbol || detail.material?.unitMeasure?.name,
        conversionUnitCost: toNumber(detail.conversionUnitCost),
        costPerUnitType: toNumber(detail.costPerUnitType),
        netPurchaseAmount: toNumber(detail.netPurchaseAmount),
        grossPurchaseAmount: toNumber(detail.grossPurchaseAmount)
    }));
});

const sum = (rows, field) => rows.reduce((total, row) => total + toNumber(row[field]), 0);
const divideOrZero = (dividend, divisor) => divisor ? dividend / divisor : 0;
const VAT_RATE = 0.16;

/**
 * Consolidates waste inventory by material, supplier and width. Waste length
 * (height in storage) can vary because it comes from rolls with different
 * original lengths, so it does not identify whether two remnants are related.
 */
export const buildWasteReportSummary = (rows = []) => {
    const groups = new Map();

    rows.forEach((row) => {
        const width = toNumber(row.base);
        const key = JSON.stringify([
            row.materialId || row.name || 'no-material',
            row.supplierId || row.supplier || 'no-supplier',
            width
        ]);
        const group = groups.get(key) || {
            supplier: row.supplier || 'Sin proveedor',
            name: row.name || 'Sin material',
            width,
            wasteQuantity: 0,
            currentStock: 0,
            squareMeters: 0
        };

        group.wasteQuantity += 1;
        group.currentStock += toNumber(row.currentStock) || 0;
        group.squareMeters += toNumber(row.convertedQuantity) || 0;
        groups.set(key, group);
    });

    const summaryRows = [...groups.values()].map(row => ({
        ...row,
        currentStock: roundTo(row.currentStock),
        squareMeters: roundTo(row.squareMeters)
    }));

    return {
        rows: summaryRows,
        totals: {
            wasteQuantity: sum(summaryRows, 'wasteQuantity'),
            currentStock: roundTo(sum(summaryRows, 'currentStock')),
            squareMeters: roundTo(sum(summaryRows, 'squareMeters'))
        }
    };
};

/**
 * Builds the supplier and material breakdowns for the purchase report rows.
 * Monetary totals use the amounts recorded on each receipt detail so the summary
 * always reconciles with the detailed table, regardless of the report scope.
 */
export const buildMonthlyGoodsReceiptSummary = (rows = []) => {
    const monthlyNetPurchaseAmount = sum(rows, 'netPurchaseAmount');
    const suppliers = new Map();
    const materials = new Map();

    rows.forEach((row) => {
        const supplierName = row.supplierName || 'Sin proveedor';
        const supplier = suppliers.get(supplierName) || {
            supplierName,
            netPurchaseAmount: 0,
            monthlyPercentage: 0
        };

        const netPurchaseAmount = toNumber(row.netPurchaseAmount);

        supplier.netPurchaseAmount += netPurchaseAmount;
        suppliers.set(supplierName, supplier);

        const materialKey = row.materialId || row.materialName || 'Sin material';
        const material = materials.get(materialKey) || {
            materialName: row.materialName || 'Sin material',
            squareMeters: 0,
            costPerSquareMeter: 0,
            netPurchaseAmount: 0,
            quantity: 0
        };

        const convertedQuantity = toNumber(row.convertedQuantity);

        material.squareMeters += convertedQuantity;
        material.netPurchaseAmount += netPurchaseAmount;
        material.quantity += toNumber(row.quantity);
        materials.set(materialKey, material);
    });

    const supplierRows = [...suppliers.values()].map((supplier) => {
        const vatAmount = roundTo(supplier.netPurchaseAmount * VAT_RATE);

        return {
            ...supplier,
            vatAmount,
            grossPurchaseAmount: roundTo(supplier.netPurchaseAmount + vatAmount),
            monthlyPercentage: divideOrZero(supplier.netPurchaseAmount * 100, monthlyNetPurchaseAmount)
        };
    });
    const materialRows = [...materials.values()].map((material) => ({
        ...material,
        costPerSquareMeter: roundTo(divideOrZero(material.netPurchaseAmount, material.squareMeters))
    }));

    return {
        supplierRows,
        materialRows,
        supplierTotals: {
            netPurchaseAmount: monthlyNetPurchaseAmount,
            vatAmount: sum(supplierRows, 'vatAmount'),
            grossPurchaseAmount: sum(supplierRows, 'grossPurchaseAmount'),
            monthlyPercentage: monthlyNetPurchaseAmount ? 100 : 0
        },
        materialTotals: {
            squareMeters: sum(materialRows, 'squareMeters'),
            costPerSquareMeter: roundTo(sum(materialRows, 'costPerSquareMeter')),
            netPurchaseAmount: monthlyNetPurchaseAmount,
            quantity: sum(materialRows, 'quantity')
        }
    };
};

export const findWarehouseReportRows = async ({
    search = '',
    orderBy = 'name',
    orderDir = 'asc'
} = {}) => {
    const where = {
        AND: [
            // An inactive inventory item remains relevant while it still has stock.
            { OR: [{ material: { isActive: true } }, { currentStock: { not: 0 } }] }
        ]
    };

    if (search) where.AND.push({
        material: { name: { contains: search, mode: 'insensitive' } }
    });

    const materials = await getDb().supplierMaterial.findMany({
        where,
        select: INVENTORY_REPORT_MATERIAL_SELECT,
        orderBy: { material: { [orderBy]: orderDir } }
    });

    return mapMaterialRows(materials.map(mapInventoryReportMaterial));
};

export const findGoodsIssueReportRows = async ({
    search = '',
    startDate = '',
    endDate = '',
    fulfillmentStatusId = '',
    observationsSearch = '',
    clientId = '',
    departmentId = '',
    personId = '',
    accesses = [],
    orderBy = 'referenceNumber',
    orderDir = 'desc'
} = {}) => {
    const goodsIssuesResult = await findAllGoodsIssues({
        skip: 0,
        take: 100000,
        search,
        startDate,
        endDate,
        fulfillmentStatusId,
        observationsSearch,
        clientId,
        departmentId,
        personId,
        orderBy,
        orderDir,
        accesses
    });

    return mapGoodsIssueDetailRows(goodsIssuesResult.data);
};

export const findWasteIssueReportRows = async ({
    search = '',
    startDate = '',
    endDate = '',
    fulfillmentStatusId = '',
    observationsSearch = '',
    clientId = '',
    departmentId = '',
    personId = '',
    orderBy = 'referenceNumber',
    orderDir = 'desc'
} = {}) => {
    const wasteIssuesResult = await findAllWasteIssues({
        skip: 0,
        take: 100000,
        search,
        startDate,
        endDate,
        fulfillmentStatusId,
        observationsSearch,
        clientId,
        departmentId,
        personId,
        orderBy,
        orderDir
    });

    return mapWasteIssueDetailRows(wasteIssuesResult.data);
};

export const findGoodsReceiptReportRows = async ({
    search = '',
    startDate = '',
    endDate = '',
    supplierId = '',
    personId = '',
    orderBy = 'referenceNumber',
    orderDir = 'desc'
} = {}) => {

    const goodsReceiptsResult = await findAllGoodsReceipts({
        skip: 0,
        take: 100000,
        search,
        startDate,
        endDate,
        supplierId,
        personId,
        excludeCanceled: true,
        activeDetailsOnly: true,
        orderBy,
        orderDir
    });

    return mapGoodsReceiptDetailRows(goodsReceiptsResult.data);
};

export const findSupplierReportRows = async ({
    search = '',
    orderBy = 'tradeName',
    orderDir = 'asc'
} = {}) => {

    const suppliersResult = await findAllSuppliers({
        skip: 0,
        take: 0,
        search,
        orderBy,
        orderDir
    });

    return suppliersResult.data;
};


export const findWasteReportRows = async ({
    search = '',
    supplierId = null,
    orderBy = 'name',
    orderDir = 'asc'
} = {}) => {
    const where = {
        AND: [
            // Do not lose traceability of inactive waste that is still in inventory.
            { OR: [{ isActive: true }, { currentStock: { not: 0 } }] }
        ]
    };

    if (search) where.AND.push({
        OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { supplier: { tradeName: { contains: search, mode: 'insensitive' } } }
        ]
    });

    if (supplierId) where.AND.push({ supplierId });

    const orderMap = {
        name: { name: orderDir },
        base: { base: orderDir },
        height: { height: orderDir }
    };
    const wastes = await getDb().waste.findMany({
        where,
        select: WASTE_REPORT_SELECT,
        orderBy: orderMap[orderBy] || orderMap.name
    });

    return mapWasteRows(wastes);
};
