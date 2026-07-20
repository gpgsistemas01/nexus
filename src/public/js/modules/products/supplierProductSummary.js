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

    setTextSummaryValues([
        {
            selector: `${ modalSelector } ${ supplierSummarySelector }`,
            value: data.supplierName
        },
        {
            selector: `${ modalSelector } ${ presentationSummarySelector }`,
            value: data.presentationName
        },
        {
            selector: `${ modalSelector } ${ unitMeasureSummarySelector }`,
            value: data.unitMeasureName
        },
        {
            selector: `${ modalSelector } ${ baseSummarySelector }`,
            value: data.productBase
        },
        {
            selector: `${ modalSelector } ${ heightSummarySelector }`,
            value: data.productHeight
        }
    ]);
};
