import { getWasteMaterialTemplates } from '../../../application/warehouse/wastes/wastes.js';
import { initDomainSelect2, toggleSelectOption } from '../baseSelect.js';
import { mapSelectWasteMaterialTemplateData, normalizeInventorySelectRelations } from '../../../utils/warehouseInventoryUtils.js';
import { SELECT2_EVENT_NAMES } from '../../../constants/events.js';
import { FORM_SELECTORS } from '../../../constants/selectors.js';
import { applyWasteMaterialTemplate } from '../../../ui/inventory/wasteFormUI.js';

const wasteMaterialTemplateChangeEvent = 'change.wasteMaterialTemplate';

export const initWasteMaterialTemplateSelect = ({ modalSelector, baseSelector, data }) => {
    const form = document.querySelector(FORM_SELECTORS.WASTE);

    initDomainSelect2({
        selector: baseSelector,
        containerSelector: modalSelector,
        get: getWasteMaterialTemplates,
        placeholder: 'Buscar material de referencia...',
        mapOption: mapSelectWasteMaterialTemplateData,
        allowCreate: false,
        clearOnOpen: false,
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
        .on(wasteMaterialTemplateChangeEvent, () => {
            if (!$(baseSelector).val() && form.wasteMaterialTemplate) applyWasteMaterialTemplate({ form });
        });
};

export const toggleWasteMaterialTemplateOption = ({ selector, data }) => {
    toggleSelectOption({ selector, data });
};
