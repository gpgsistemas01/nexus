import { formatDateLongWithTime, roundTo, toNumber } from "../../utils/formattersUtils.js";
import { findAllGoodsIssues } from "./goodsIssues/goodsIssueService.js";
import { findAllGoodsReceipts } from "./goodsReceipts/goodsReceiptService.js";
import { findAllSuppliers } from "./supplierService.js";
import { GOODS_RECEIPT_STATUS_NAMES } from "../../constants/warehouseStatuses.js";
import { getDb } from "../../repository/baseRepository.js";
import { buildDateRangeFilter } from "../../utils/requestQueryUtils.js";

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
    base: true,
    height: true,
    currentStock: true,
    convertedQuantity: true,
    supplierMaterial: {
        select: {
            maxUnitCost: true,
            material: {
                select: {
                    name: true,
                    presentation: { select: { name: true } },
                    unitMeasure: { select: { name: true } }
                }
            },
            supplier: { select: { tradeName: true } }
        }
    }
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

const mapInventoryReportWaste = ({ supplierMaterial, ...waste }) => ({
    ...waste,
    name: supplierMaterial.material.name,
    presentation: supplierMaterial.material.presentation,
    unitMeasure: supplierMaterial.material.unitMeasure,
    maxUnitCost: supplierMaterial.maxUnitCost,
    supplier: supplierMaterial.supplier
});

const mapGoodsIssueDetailRows = (goodsIssues = [], { supplierId = '', materialId = '' } = {}) => goodsIssues.flatMap((goodsIssue) => {

    const details = (goodsIssue.details || []).filter((detail) => {
        const isCanceledDetail = detail.fulfillmentStatus?.name === 'Cancelado';

        return (
            !isCanceledDetail &&
            (!supplierId || detail.supplierId === supplierId) &&
            (!materialId || detail.materialId === materialId)
        );
    });

    return details.map((detail) => ({
        referenceNumber: goodsIssue.referenceNumber,
        requestDate: formatDateLongWithTime(goodsIssue.requestDate),
        departmentName: goodsIssue.departmentName,
        requesterName: goodsIssue.requesterName,
        clientName: goodsIssue.clientName,
        projectNumber: goodsIssue.projectNumber,
        fulfillmentStatusName: goodsIssue.fulfillmentStatus?.name,
        materialName: detail.materialName,
        supplierName: detail.supplier?.tradeName,
        materialBase: toNumber(detail.material?.base),
        materialHeight: toNumber(detail.material?.height),
        requestedQuantity: toNumber(detail.quantity),
        suppliedQuantity: toNumber(detail.suppliedQuantity),
        presentationName: detail.material?.presentation?.name,
        convertedQuantity: toNumber(detail.convertedQuantity),
        convertedUnitMeasureName: detail.material?.unitMeasure?.symbol || detail.material?.unitMeasure?.name,
        projectConvertedQuantity: toNumber(detail.projectConvertedQuantity),
        convertedQuantityDifference: toNumber(detail.convertedQuantityDifference),
        detailFulfillmentStatusName: detail.fulfillmentStatus?.name
    }));
});

const mapWasteIssueDetailRows = (details = []) => details.map((detail) => {
    const wasteIssue = detail.wasteIssue;
    const material = detail.waste?.supplierMaterial?.material;

    return {
        referenceNumber: wasteIssue.referenceNumber,
        requestDate: formatDateLongWithTime(wasteIssue.requestDate),
        departmentName: wasteIssue.departmentName,
        requesterName: wasteIssue.requesterName,
        clientName: wasteIssue.clientName,
        projectNumber: wasteIssue.projectNumber,
        fulfillmentStatusName: wasteIssue.fulfillmentStatus?.name,
        materialName: detail.materialName,
        supplierName: detail.waste?.supplierMaterial?.supplier?.tradeName,
        wasteBase: toNumber(detail.waste?.base),
        wasteHeight: toNumber(detail.waste?.height),
        requestedQuantity: toNumber(detail.quantity),
        suppliedQuantity: toNumber(detail.suppliedQuantity),
        presentationName: material?.presentation?.name,
        convertedQuantity: toNumber(detail.convertedQuantity),
        convertedUnitMeasureName: material?.unitMeasure?.symbol || material?.unitMeasure?.name,
        projectConvertedQuantity: toNumber(detail.projectConvertedQuantity),
        convertedQuantityDifference: toNumber(detail.convertedQuantityDifference),
        detailFulfillmentStatusName: detail.fulfillmentStatus?.name
    };
});

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

export const findWasteIssueReportRows = async ({
    wasteIssueId = '',
    search = '',
    startDate = '',
    endDate = '',
    fulfillmentStatusId = '',
    observationsSearch = '',
    clientId = '',
    departmentId = '',
    personId = '',
    orderBy = 'requestDate',
    orderDir = 'desc'
} = {}) => {
    const sortableFields = new Set([
        'referenceNumber',
        'requestDate',
        'departmentName',
        'projectNumber',
        'clientName',
        'observations'
    ]);
    const issueWhere = {
        ...buildDateRangeFilter({ field: 'requestDate', startDate, endDate }),
        ...(clientId && { clientId }),
        ...(departmentId && { departmentId }),
        ...(personId && { requesterId: personId }),
        ...(fulfillmentStatusId && { fulfillmentStatusId }),
        ...(observationsSearch && {
            observations: { contains: observationsSearch, mode: 'insensitive' }
        }),
        ...(search && {
            OR: [
                { referenceNumber: { contains: search, mode: 'insensitive' } },
                { observations: { contains: search, mode: 'insensitive' } },
                { details: { some: { materialName: { contains: search, mode: 'insensitive' } } } }
            ]
        })
    };
    const details = await getDb().wasteIssueDetail.findMany({
        where: {
            ...(wasteIssueId && { wasteIssueId }),
            ...(Object.keys(issueWhere).length && {
                wasteIssue: { is: issueWhere }
            })
        },
        include: {
            fulfillmentStatus: { select: { name: true } },
            wasteIssue: {
                include: { fulfillmentStatus: { select: { name: true } } }
            },
            waste: {
                include: {
                    supplierMaterial: {
                        include: {
                            material: { include: { presentation: true, unitMeasure: true } },
                            supplier: true
                        }
                    }
                }
            }
        },
        orderBy: [
            {
                wasteIssue: {
                    [sortableFields.has(orderBy) ? orderBy : 'requestDate']: orderDir
                }
            },
            { createdAt: 'asc' }
        ]
    });

    return mapWasteIssueDetailRows(details);
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
            { supplierMaterial: { material: { name: { contains: search, mode: 'insensitive' } } } },
            { supplierMaterial: { supplier: { tradeName: { contains: search, mode: 'insensitive' } } } }
        ]
    });

    if (supplierId) where.AND.push({ supplierMaterial: { supplierId } });

    const orderMap = {
        name: { supplierMaterial: { material: { name: orderDir } } },
        base: { base: orderDir },
        height: { height: orderDir }
    };
    const wastes = await getDb().waste.findMany({
        where,
        select: WASTE_REPORT_SELECT,
        orderBy: orderMap[orderBy] || orderMap.name
    });

    return mapWasteRows(wastes.map(mapInventoryReportWaste));
};
