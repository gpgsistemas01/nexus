import { getAllWastes } from "../../../application/warehouse/wastes/wastes.js";
import { mapSelectWasteData } from "../../../utils/warehouseInventoryUtils.js";
import { buildPaginatedSelectParams, initDomainSelect2, toggleSelectOption } from "../baseSelect.js";

const initWasteSelect = ({
    modalSelector,
    supplierSelector,
    baseSelector
}) => initDomainSelect2({
    selector: baseSelector,
    containerSelector: modalSelector,
    get: getAllWastes,
    placeholder: 'Buscar merma...',
    mapOption: mapSelectWasteData,
    data: (params) => buildPaginatedSelectParams(params, {
        additionalParams: {
            supplierId: supplierSelector
                ? $(`${ modalSelector } ${ supplierSelector }`).val()
                : ''
        }
    }),
    allowCreate: false,
    newTagLabel: 'Nueva merma'
});

export const toggleWasteOption = ({
    selector,
    data
}) => toggleSelectOption({
    selector,
    data
});

export const setupWasteSelect = ({
    modalSelector,
    supplierSelector = null,
    wasteSelector
}) => {

    const baseSelector = `${ modalSelector } ${ wasteSelector }`;

    initWasteSelect({
        modalSelector,
        supplierSelector,
        baseSelector
    });

};
