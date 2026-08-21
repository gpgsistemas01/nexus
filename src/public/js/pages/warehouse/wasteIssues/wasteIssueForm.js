import {
    editWasteIssue,
    editWasteIssueHeader,
    editWasteIssueDetails,
    registerWasteIssue
} from '../../../application/warehouse/wasteIssues/wasteIssues.js';
import { DOM_EVENT_NAMES } from '../../../constants/events.js';
import { FORM_MODES } from '../../../constants/formModes.js';
import {
    BUTTON_SELECTORS,
    DATATABLE_SELECTORS,
    FORM_SELECTORS,
    INPUT_SELECTORS,
    MODAL_SELECTORS,
    SELECT_SELECTORS
} from '../../../constants/selectors.js';
import { refreshMaterialTable } from '../../../plugins/datatable/shared/inventory/renderMaterialDatatable.js';
import { clearAddedItemInput } from '../../../ui/forms/detailFormUI.js';
import { normalizeFormErrors } from '../../../ui/forms/formErrorsUI.js';
import { bindIssueProjectQuantityControls, useIssueForm } from '../../../ui/issues/issueFormUI.js';
import { removeDetail, upsertDetail } from '../../../utils/detailCollectionUtils.js';
import { on } from '../../../utils/domUtils.js';
import { roundTo } from '../../../utils/formatUtils.js';
import { hasValidationErrors, validateDetailsFields, validateFields } from '../../../utils/formUtils.js';
import {
    addWasteIssueDetailValidation,
    issueProjectQuantityDetailsValidation,
    wasteIssueValidation
} from '../../../utils/validations/validators.js';
import {
    getPresentation,
    getUnitMeasure,
    mapIssueDetailsToSupplyRequest
} from '../../../utils/warehouseInventoryUtils.js';
import { wasteIssueDetails as details, wasteIssueHeaderForm } from './wasteIssueModal.js';

const formId = FORM_SELECTORS.WASTE_ISSUE;
const form = document.querySelector(formId);
const detailTableSelector = DATATABLE_SELECTORS.MATERIAL;
const presentationDisplaySelector = `${ MODAL_SELECTORS.WASTE_ISSUE } ${ INPUT_SELECTORS.PRESENTATION_DISPLAY }`;

const normalizeWasteIssueData = ({ form }) => {
    const { mode } = form.dataset;

    if (mode === FORM_MODES.EDIT_DETAIL) {
        return {
            details: mapIssueDetailsToSupplyRequest(details)
        };
    }

    const formData = wasteIssueHeaderForm.readData();

    if (mode !== FORM_MODES.EDIT_HEADER) {
        formData.details = details.map(({ wasteId, quantity }) => ({
            wasteId,
            quantity
        }));
    }

    return formData;
};

useIssueForm({
    selector: formId,
    normalizeData: normalizeWasteIssueData,
    getErrors: ({ form, formData }) => {
        if (form.dataset.mode === FORM_MODES.EDIT_DETAIL) {
            const detailsToSupply = mapIssueDetailsToSupplyRequest(details);

            return detailsToSupply.length
                ? validateDetailsFields(issueProjectQuantityDetailsValidation, detailsToSupply)
                : { details: 'Seleccione al menos una merma pendiente por surtir.' };
        }

        const errors = validateFields(wasteIssueValidation, formData);

        if (form.dataset.mode === FORM_MODES.EDIT_HEADER) errors.details = null;

        return errors;
    },
    register: registerWasteIssue,
    edit: editWasteIssue,
    editHeader: editWasteIssueHeader,
    editDetails: editWasteIssueDetails,
    onSaved: async () => {
        details.length = 0;
        refreshMaterialTable(details);
    }
});

const addWaste = () => {
    const option = document.querySelector(`${ SELECT_SELECTORS.WASTE } option:checked`);

    if (!option) return;

    let { id, text, base, height, supplierMaterial } = option.dataset;
    supplierMaterial = JSON.parse(supplierMaterial);
    const wasteId = option.value || id;
    const quantity = Number(document.querySelector(INPUT_SELECTORS.QUANTITY).value);

    const errors = validateFields(addWasteIssueDetailValidation, {
        wasteId,
        quantity
    });

    normalizeFormErrors({ form, errors });

    if (hasValidationErrors(errors)) return;

    const waste = {
        wasteId,
        name: text,
        base,
        height,
        presentation: getPresentation(supplierMaterial),
        unitMeasure: getUnitMeasure(supplierMaterial),
        quantity,
        convertedQuantity: base && height
            ? roundTo(base * height * quantity)
            : quantity
    };

    upsertDetail({
        details,
        detail: waste,
        matches: item => item.wasteId === wasteId
    });

    refreshMaterialTable(details);
    clearAddedItemInput({
        itemSelector: SELECT_SELECTORS.WASTE,
        quantitySelector: INPUT_SELECTORS.QUANTITY,
        presentationSelector: presentationDisplaySelector
    });
};

const findDetailByElement = element => details.find(detail => (
    detail.id === element.dataset.detailId
    || detail.id === element.dataset.id
    || detail.wasteId === element.dataset.id
));

on(DOM_EVENT_NAMES.CLICK, BUTTON_SELECTORS.ADD_MATERIAL, addWaste);
on(DOM_EVENT_NAMES.CLICK, `${ detailTableSelector } .delete-btn`, (event, button) => {
    const removedDetail = removeDetail({
        details,
        matches: detail => detail.wasteId === button.dataset.id
    });

    if (!removedDetail) return;

    refreshMaterialTable(details);
});

bindIssueProjectQuantityControls({
    form,
    tableSelector: detailTableSelector,
    findDetail: findDetailByElement
});
