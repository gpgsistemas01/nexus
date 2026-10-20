import { formatDateLongWithTime, toNumber } from '../../utils/formattersUtils.js';
import { findAllGoodsIssues } from "./goodsIssues/goodsIssueService.js";
import { findAllWasteIssues } from "./wasteIssues/wasteIssueService.js";
import { findAllSuppliers } from "./supplierService.js";
import { FULFILLMENT_STATUS_NAMES } from "../../constants/warehouseStatuses.js";
import { getDb } from "../../repository/baseRepository.js";
import { findBatches } from '../../repository/paginationRepository.js';
import { QUERY_BATCH_SIZES } from '../../constants/pagination.js';

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
    sourceMaterial: { select: { base: true, height: true } },
    id: true,
    base: true,
    height: true,
    currentStock: true,
    convertedQuantity: true,
    maxUnitCost: true,
    name: true,
    weightKg: true,
    supplierId: true,
    supplier: { select: { tradeName: true } },
    presentation: { select: { name: true } },
    unitMeasure: { select: { name: true } }
};

const mapMaterialRows = (materials = []) => materials.map((item) => ({
    supplier: item.supplier?.tradeName,
    name: item.material.name,
    base: toNumber(item.material.base),
    height: toNumber(item.material.height),
    currentStock: toNumber(item.currentStock),
    minStock: toNumber(item.material.minStock),
    presentation: item.material.presentation?.name,
    convertedQuantity: toNumber(item.convertedQuantity),
    unitMeasure: item.material.unitMeasure?.name,
    maxUnitCost: toNumber(item.maxUnitCost)
}));

const mapWasteRows = (wastes = []) => wastes.map((item) => ({
    id: item.id,
    materialId: item.materialId,
    sourceMaterial: item.sourceMaterial,
    supplierId: item.supplierId,
    supplier: item.supplier?.tradeName,
    name: item.name,
    base: toNumber(item.base),
    height: toNumber(item.height),
    currentStock: toNumber(item.currentStock),
    weightKg: item.weightKg == null ? null : toNumber(item.weightKg),
    presentation: item.presentation?.name,
    convertedQuantity: toNumber(item.convertedQuantity),
    unitMeasure: item.unitMeasure?.name,
    maxUnitCost: toNumber(item.maxUnitCost)
}));

const mapIssueDetailRow = ({ issue, detail, material, supplier, requestDate }) => ({
    referenceNumber: issue.referenceNumber,
    requestDate,
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

const mapGoodsIssueDetailRows = function* (goodsIssues = [], { supplierId = '', materialId = '' } = {}) {
    for (const issue of goodsIssues) {
        const requestDate = formatDateLongWithTime(issue.requestDate);
        for (const detail of issue.details || []) {
            if (detail.fulfillmentStatus?.name === FULFILLMENT_STATUS_NAMES.CANCELED
                || (supplierId && detail.supplierId !== supplierId)
                || (materialId && detail.materialId !== materialId)) continue;

            yield mapIssueDetailRow({ issue, detail, material: detail.material, supplier: detail.supplier, requestDate });
        }
    }
};

const mapWasteIssueDetailRows = function* (wasteIssues = []) {
    for (const issue of wasteIssues) {
        const requestDate = formatDateLongWithTime(issue.requestDate);
        for (const detail of issue.details || []) {
            if (detail.fulfillmentStatus?.name === FULFILLMENT_STATUS_NAMES.CANCELED) continue;

            yield mapIssueDetailRow({
                issue,
                detail,
                material: { name: detail.waste?.name, base: detail.waste?.base, height: detail.waste?.height },
                supplier: detail.waste?.supplier,
                requestDate
            });
        }
    }
};

export const findWarehouseReportRows = async function* ({
    search = '',
    inventoryScope = 'activeOrStock',
    type = null,
    orderBy = 'name',
    orderDir = 'asc'
} = {}) {
    const scopeFilter = {
        active: { isActive: true },
        inStock: { currentStock: { not: 0 } },
        activeOrStock: { OR: [{ isActive: true }, { currentStock: { not: 0 } }] }
    };
    const where = { AND: [scopeFilter[inventoryScope] || scopeFilter.activeOrStock] };

    if (type) where.AND.push({ material: { type } });

    if (search) where.AND.push({
        material: { name: { contains: search, mode: 'insensitive' } }
    });

    for await (const materials of findBatches({
        model: getDb().supplierMaterial,
        query: {
            where,
            select: { id: true, ...INVENTORY_REPORT_MATERIAL_SELECT },
            orderBy: [{ material: { [orderBy]: orderDir } }, { id: 'asc' }]
        }
    })) {
        yield* mapMaterialRows(materials);
    }
};

export const findGoodsIssueReportRows = async function* ({
    type,
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
} = {}) {
    for await (const page of findBatches({
        batchSize: QUERY_BATCH_SIZES.DOCUMENTS,
        fetchPage: async query => (await findAllGoodsIssues({ ...query, includeCounts: false })).data,
        query: {
            type,
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
        }
    })) yield* mapGoodsIssueDetailRows(page);
};

export const findWasteIssueReportRows = async function* ({
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
} = {}) {
    for await (const page of findBatches({
        batchSize: QUERY_BATCH_SIZES.DOCUMENTS,
        fetchPage: async query => (await findAllWasteIssues({ ...query, includeCounts: false })).data,
        query: {
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
        }
    })) yield* mapWasteIssueDetailRows(page);
};

export const findSupplierReportRows = async function* ({ search = '', orderBy = 'tradeName', orderDir = 'asc' } = {}) {
    for await (const page of findBatches({
        batchSize: QUERY_BATCH_SIZES.SUPPLIERS,
        query: { search, orderBy, orderDir },
        fetchPage: async query => (await findAllSuppliers({ ...query, includeCounts: false })).data
    })) yield* page;
};

export const findWasteReportRows = async function* ({
    search = '',
    supplierId = null,
    inventoryScope = 'activeOrStock',
    orderBy = 'name',
    orderDir = 'asc'
} = {}) {
    const scopeFilter = {
        active: { isActive: true },
        inStock: { currentStock: { not: 0 } },
        activeOrStock: { OR: [{ isActive: true }, { currentStock: { not: 0 } }] }
    };
    const where = { AND: [scopeFilter[inventoryScope] || scopeFilter.activeOrStock] };

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
    for await (const page of findBatches({
        model: getDb().waste,
        query: { where, select: WASTE_REPORT_SELECT, orderBy: [orderMap[orderBy] || orderMap.name, { id: 'asc' }] }
    })) yield* mapWasteRows(page);
};
