import { getAllMaterials } from "../../../application/warehouse/materials.js";
import { mapSupplierMaterialToSelectData } from "../../../utils/materialSelectUtils.js";
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
        mapOption: mapSupplierMaterialToSelectData,
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
