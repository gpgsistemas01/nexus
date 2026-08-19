import { getAllWastes } from "../../../application/warehouse/wastes.js";
import { FILTER_SELECTORS, FORM_SELECTORS } from "../../../constants/selectors.js";
import { mapSelectWasteData } from "../../../utils/materialSelectUtils.js";
import { buildPaginatedSelectParams, buildPaginatedSelectResults, initDomainSelect2, initFilterSelect2, setMdbWrapperInputValue, toggleSelectOption } from "../baseSelect.js";

const wrapperSelector = FORM_SELECTORS.PRESENTATION_DISPLAY;
const materialSelector = '#wasteFilter';

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

    $(baseSelector).off('select2:select').on('select2:select', (e) => {

        const { data } = e.params;

        const option = e.target.querySelector('option:checked');

        if (!option) return;

        Object.entries(data).forEach(([key, value]) => {
            option.dataset[key] = value;
        });

        const value = data.presentationName || '';

        setMdbWrapperInputValue({
            selector: `${ modalSelector } ${ wrapperSelector }`,
            value
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