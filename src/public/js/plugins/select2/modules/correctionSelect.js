import { MATERIAL_SELECT_RESULTS_LIMIT } from "../../../application/warehouse/materials.js";
import { setupMaterialSelect, toggleMaterialOption } from "../domains/material.js";

const modalSelector = '#goodsReceiptCorrectionModal';
const materialSelector = '#correctionMaterialInput';
const supplierSelector = '#correctionSupplierInput';

export const initGoodsReceiptCorrectionSelect2 = ({ detail }) => {
    setupMaterialSelect({
        modalSelector,
        supplierSelector,
        materialSelector,
        allowCreate: false,
        resultsLimit: MATERIAL_SELECT_RESULTS_LIMIT
    });

    toggleMaterialOption({
        selector: `${ modalSelector } ${ materialSelector }`,
        data: {
            id: detail.materialId || detail.material?.id,
            text: detail.materialName || detail.material?.name
        }
    });
};
