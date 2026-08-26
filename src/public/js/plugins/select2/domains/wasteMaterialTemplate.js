import { getWasteMaterialTemplates } from '../../../application/warehouse/wastes/wastes.js';
import { initDomainSelect2, toggleSelectOption } from '../baseSelect.js';
import { mapSelectWasteMaterialTemplateData, normalizeInventorySelectRelations } from '../../../utils/warehouseInventoryUtils.js';
import { SELECT2_EVENT_NAMES } from '../../../constants/events.js';
import { FORM_SELECTORS } from '../../../constants/selectors.js';
import { applyWasteMaterialTemplate } from '../../../ui/inventory/inventorySelectUI.js';

const wasteMaterialTemplateChangeEvent = 'change.wasteMaterialTemplate';

export const initWasteMaterialTemplateSelect = ({ modalSelector, baseSelector, supplierSelector, data }) => {
    const form = document.querySelector(FORM_SELECTORS.WASTE);

    initDomainSelect2({
        selector: baseSelector,
        containerSelector: modalSelector,
        get: getWasteMaterialTemplates,
        placeholder: 'Buscar material de referencia...',
        mapOption: mapSelectWasteMaterialTemplateData,
        allowCreate: false,
        data
    });

    $(baseSelector)
        .off(`${ SELECT2_EVENT_NAMES.SELECT } ${ SELECT2_EVENT_NAMES.CLEAR } ${ wasteMaterialTemplateChangeEvent }`)
        .on(SELECT2_EVENT_NAMES.SELECT, ({ params }) => {
            applyWasteMaterialTemplate({
                form,
                template: normalizeInventorySelectRelations(params.data)
            });
        })
        .on(`${ SELECT2_EVENT_NAMES.CLEAR } ${ wasteMaterialTemplateChangeEvent }`, () => {
            if (!$(baseSelector).val()) applyWasteMaterialTemplate({ form });
        });

    if (supplierSelector) $(supplierSelector)
        .off(`${ SELECT2_EVENT_NAMES.SELECT }.wasteMaterialDependency ${ SELECT2_EVENT_NAMES.CLEAR }.wasteMaterialDependency`)
        .on(`${ SELECT2_EVENT_NAMES.SELECT }.wasteMaterialDependency ${ SELECT2_EVENT_NAMES.CLEAR }.wasteMaterialDependency`, () => {
            toggleSelectOption({ selector: baseSelector, data: null });
        });
};

export const toggleWasteMaterialTemplateOption = ({ selector, data }) => {
    toggleSelectOption({ selector, data });
};
