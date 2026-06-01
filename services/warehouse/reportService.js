import { formatDateLongWithTime, toNumber } from "../../utils/formattersUtils.js";
import { findAllSupplierProducts } from "./products/supplierProductService.js";
import { findAllGoodsIssues } from "./goodsIssues/goodsIssueService.js";

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
