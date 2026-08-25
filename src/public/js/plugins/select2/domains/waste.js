import { getAllWastes } from "../../../application/warehouse/wastes/wastes.js";
import { mapSelectWasteData } from "../../../utils/warehouseInventoryUtils.js";
import { buildPaginatedSelectParams, initDomainSelect2, toggleSelectOption } from "../baseSelect.js";
import { FILTER_SELECTORS } from '../../../constants/selectors.js';

const initWasteSelect = ({
    modalSelector,
    supplierSelector,
    baseSelector,
    resultsLimit = null
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

export const initWasteFilterSelect = () => initWasteSelect({
    modalSelector: 'body',
    supplierSelector: FILTER_SELECTORS.SUPPLIER,
    baseSelector: FILTER_SELECTORS.MATERIAL
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
    wasteSelector,
    allowCreate = true,
    creationContext = null
}) => {

    const baseSelector = `${ modalSelector } ${ wasteSelector }`;

    initWasteSelect({
        modalSelector,
        supplierSelector,
        baseSelector,
        allowCreate
    });

};
