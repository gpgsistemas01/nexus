import { SELECT2_EVENT_NAMES } from '../../../constants/events.js';
import { getAllWastes } from "../../../application/warehouse/wastes/wastes.js";
import { mapSelectWasteData } from "../../../utils/warehouseInventoryUtils.js";
import { buildPaginatedSelectParams, initDomainSelect2, toggleSelectOption, updatePresentationDisplay } from "../baseSelect.js";

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

const attachWasteHandler = ({
    modalSelector,
    baseSelector,
    supplierSelector,
    creationContext
}) => {

    $(baseSelector).off(SELECT2_EVENT_NAMES.SELECT).on(SELECT2_EVENT_NAMES.SELECT, (e) => {

        const { data } = e.params;
        const supplierMaterial = JSON.parse(data.supplierMaterial);

        updatePresentationDisplay({
            modalSelector,
            data,
            presentation: supplierMaterial.material.presentation,
            option: e.target.querySelector('option:checked')
        });
    });
};

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

    attachWasteHandler({
        modalSelector,
        baseSelector,
        supplierSelector,
        creationContext
    });
};
