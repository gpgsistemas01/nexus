import { FORM_SELECTORS } from "../../constants/selectors.js";
import { setTextSummaryValues } from "../../ui/totalsSummaryUI.js";
import { formatCurrency } from "../../utils/formatUtils.js";

const supplierSummarySelector = FORM_SELECTORS.SELECTED_MATERIAL_SUPPLIER;
const presentationSummarySelector = FORM_SELECTORS.SELECTED_MATERIAL_PRESENTATION;
const unitMeasureSummarySelector = FORM_SELECTORS.SELECTED_MATERIAL_UNIT_MEASURE;
const baseSummarySelector = FORM_SELECTORS.SELECTED_MATERIAL_BASE;
const heightSummarySelector = FORM_SELECTORS.SELECTED_MATERIAL_HEIGHT;
const maxUnitCostSummarySelector = FORM_SELECTORS.SELECTED_MATERIAL_MAX_UNIT_COST;

export const setSupplierMaterialSummaryValues = ({
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
            value: summaryData.materialBase
        },
        {
            selector: `${ modalSelector } ${ heightSummarySelector }`,
            value: summaryData.materialHeight
        },
        {
            selector: `${ modalSelector } ${ maxUnitCostSummarySelector }`,
            value: summaryData.maxUnitCost !== undefined && summaryData.maxUnitCost !== null
                ? formatCurrency(summaryData.maxUnitCost)
                : null
        }
    ]);
};
