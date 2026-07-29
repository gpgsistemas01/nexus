import { formatDateLongWithTime, toNumber } from "../../utils/formattersUtils.js";
import { findAllSupplierMaterials } from "./materials/supplierMaterialService.js";
import { findAllGoodsIssues } from "./goodsIssues/goodsIssueService.js";
import { findAllGoodsReceipts } from "./goodsReceipts/goodsReceiptService.js";
import { findAllSuppliers } from "./supplierService.js";
import { findAllWastes } from "./wasteService.js";

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
        supplierName: detail.supplierName,
        materialBase: toNumber(detail.materialBase),
        materialHeight: toNumber(detail.materialHeight),
        requestedQuantity: toNumber(detail.quantity),
        suppliedQuantity: toNumber(detail.suppliedQuantity),
        presentationName: detail.presentationName,
        convertedQuantity: toNumber(detail.convertedQuantity),
        convertedUnitMeasureName: detail.unitMeasureSymbol || detail.unitMeasureName,
        projectConvertedQuantity: toNumber(detail.projectConvertedQuantity),
        convertedQuantityDifference: toNumber(detail.convertedQuantityDifference),
        detailFulfillmentStatusName: detail.fulfillmentStatus?.name
    }));
});

const mapGoodsReceiptDetailRows = (goodsReceipts = [], { materialId = '' } = {}) => goodsReceipts.flatMap((goodsReceipt) => {

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
        materialName: detail.materialName,
        materialBase: toNumber(detail.materialBase),
        materialHeight: toNumber(detail.materialHeight),
        quantity: toNumber(detail.quantity),
        presentationName: detail.presentationName,
        convertedQuantity: toNumber(detail.convertedQuantity),
        unitMeasureName: detail.unitMeasureSymbol || detail.unitMeasureName,
        conversionUnitCost: toNumber(detail.conversionUnitCost),
        costPerUnitType: toNumber(detail.costPerUnitType),
        netPurchaseAmount: toNumber(detail.netPurchaseAmount),
        grossPurchaseAmount: toNumber(detail.grossPurchaseAmount)
    }));
});

export const findWarehouseReportRows = async ({
    search = '',
    orderBy = 'name',
    orderDir = 'asc'
} = {}) => {

    const materialsResult = await findAllSupplierMaterials({
        skip: 0,
        take: 100000,
        search,
        supplierId: null,
        orderBy,
        orderDir
    });

    return mapMaterialRows(materialsResult.data);
};

export const findGoodsIssueReportRows = async ({
    search = '',
    startDate = '',
    endDate = '',
    fulfillmentStatusId = '',
    observationsSearch = '',
    clientId = '',
    departmentId = '',
    profileId = '',
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
        profileId,
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
    profileId = '',
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
        profileId,
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

    const wastesResult = await findAllWastes({
        skip: 0,
        take: 100000,
        search,
        supplierId,
        orderBy,
        orderDir
    });

    return mapWasteRows(wastesResult.data);
};
