import { getAllMaterials } from "../../../application/warehouse/materials.js";
import { mapSelectMaterialData } from "../../../utils/warehouseInventoryUtils.js";
import { initDomainSelect2, toggleSelectOption } from "../baseSelect.js";

export const initSupplierMaterialSelect = ({
    modalSelector,
    baseSelector,
    placeholder = 'Buscar material...'
}) => {

    initDomainSelect2({
        selector: baseSelector,
        containerSelector: modalSelector,
        get: getAllMaterials,
        placeholder,
        mapOption: mapSelectMaterialData,
        allowCreate: false
    });
};

export const toggleSupplierMaterialOption = ({
    selector,
    data,
    modalSelector = null
}) => {

    toggleSelectOption({
        selector,
        data
    });

    if (!modalSelector) return;
};
