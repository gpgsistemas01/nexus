import { formatDateLongWithTime, toNumber } from "../../utils/formattersUtils.js";
import { findAllSupplierProducts } from "./products/supplierProductService.js";
import { findAllGoodsIssues } from "./goodsIssues/goodsIssueService.js";
import { findAllGoodsReceipts } from "./goodsReceipts/goodsReceiptService.js";

const mapProductRows = (products = []) => products.map((item) => ({
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

const formatQuantity = ({ quantity, unit = '' }) => {

    const normalizedQuantity = toNumber(quantity);

    if (normalizedQuantity == null) return '';

    return [normalizedQuantity, unit].filter(Boolean).join(' ');
};

const mapGoodsIssueDetailRows = (goodsIssues = []) => goodsIssues.flatMap((goodsIssue) => {

    const details = goodsIssue.details || [];

    return details.map((detail) => ({
        referenceNumber: goodsIssue.referenceNumber,
        requestDate: formatDateLongWithTime(goodsIssue.requestDate),
        departmentName: goodsIssue.departmentName,
        requesterName: goodsIssue.requesterName,
        clientName: goodsIssue.clientName,
        projectNumber: goodsIssue.projectNumber,
        fulfillmentStatusName: goodsIssue.fulfillmentStatus?.name,
        productName: detail.productName,
        supplierName: detail.supplierName,
        productBase: toNumber(detail.productBase),
        productHeight: toNumber(detail.productHeight),
        requestedQuantity: formatQuantity({
            quantity: detail.quantity,
            unit: detail.presentationName
        }),
        convertedQuantity: formatQuantity({
            quantity: detail.convertedQuantity,
            unit: detail.unitMeasureSymbol || detail.unitMeasureName
        }),
        suppliedQuantity: formatQuantity({
            quantity: detail.suppliedQuantity,
            unit: detail.unitMeasureSymbol || detail.unitMeasureName
        }),
        detailFulfillmentStatusName: detail.fulfillmentStatus?.name
    }));
});

const mapGoodsReceiptDetailRows = (goodsReceipts = []) => goodsReceipts.flatMap((goodsReceipt) => {

    const details = goodsReceipt.details || [];

    return details.map((detail) => ({
        referenceNumber: goodsReceipt.referenceNumber,
        receptionDate: formatDateLongWithTime(goodsReceipt.receptionDate),
        receivedByName: goodsReceipt.receivedByName,
        supplierName: goodsReceipt.supplierName,
        invoice: goodsReceipt.isInvoiced ? goodsReceipt.invoice : 'Sin factura',
        productName: detail.productName,
        productBase: toNumber(detail.productBase),
        productHeight: toNumber(detail.productHeight),
        quantity: formatQuantity({
            quantity: detail.quantity,
            unit: detail.presentationName
        }),
        convertedQuantity: formatQuantity({
            quantity: detail.convertedQuantity,
            unit: detail.unitMeasureSymbol || detail.unitMeasureName
        }),
        conversionUnitCost: toNumber(detail.conversionUnitCost),
        costPerUnitType: toNumber(detail.costPerUnitType),
        netPurchaseAmount: toNumber(detail.netPurchaseAmount),
        grossPurchaseAmount: toNumber(detail.grossPurchaseAmount)
    }));
});

export const findWarehouseReportRows = async () => {

    const productsResult = await findAllSupplierProducts({
        skip: 0,
        take: 100000,
        search: '',
        supplierId: null,
        orderBy: 'name',
        orderDir: 'asc'
    });

    return mapProductRows(productsResult.data);
};

export const findGoodsIssueReportRows = async ({
    search = '',
    fulfillmentStatusId = '',
    accesses = []
} = {}) => {

    const goodsIssuesResult = await findAllGoodsIssues({
        skip: 0,
        take: 100000,
        search,
        fulfillmentStatusId,
        orderBy: 'referenceNumber',
        orderDir: 'desc',
        accesses
    });

    return mapGoodsIssueDetailRows(goodsIssuesResult.data);
};

export const findGoodsReceiptReportRows = async ({
    search = ''
} = {}) => {

    const goodsReceiptsResult = await findAllGoodsReceipts({
        skip: 0,
        take: 100000,
        search,
        orderBy: 'referenceNumber',
        orderDir: 'desc'
    });

    return mapGoodsReceiptDetailRows(goodsReceiptsResult.data);
};
