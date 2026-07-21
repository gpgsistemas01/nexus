import { FORM_SELECTORS } from "../../constants/selectors.js";
import { setTextSummaryValues } from "../../ui/totalsSummaryUI.js";

const supplierSummarySelector = FORM_SELECTORS.SELECTED_PRODUCT_SUPPLIER;
const presentationSummarySelector = FORM_SELECTORS.SELECTED_PRODUCT_PRESENTATION;
const unitMeasureSummarySelector = FORM_SELECTORS.SELECTED_PRODUCT_UNIT_MEASURE;
const baseSummarySelector = FORM_SELECTORS.SELECTED_PRODUCT_BASE;
const heightSummarySelector = FORM_SELECTORS.SELECTED_PRODUCT_HEIGHT;

export const setSupplierProductSummaryValues = ({
    modalSelector,
    data = {}
}) => {

    const summaryData = data ?? {};

    setTextSummaryValues([
        {
            selector: `${ modalSelector } ${ supplierSummarySelector }`,
            value: summaryData.supplierName
        },
        {
            selector: `${ modalSelector } ${ presentationSummarySelector }`,
            value: summaryData.presentationName
        },
        {
            selector: `${ modalSelector } ${ unitMeasureSummarySelector }`,
            value: summaryData.unitMeasureName
        },
        {
            selector: `${ modalSelector } ${ baseSummarySelector }`,
            value: summaryData.productBase
        },
        {
            selector: `${ modalSelector } ${ heightSummarySelector }`,
            value: summaryData.productHeight
        }
    ]);
};
