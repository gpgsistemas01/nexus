import {
    editGoodsIssue,
    editGoodsIssueHeader,
    editGoodsIssueDetails,
    registerGoodsIssue
} from '../../../application/warehouse/goodsIssues/goodsIssues.js';
import { DOM_EVENT_NAMES } from '../../../constants/events.js';
import { FORM_MODES } from '../../../constants/formModes.js';
import {
    BUTTON_SELECTORS,
    DATATABLE_SELECTORS,
    FORM_SELECTORS,
    INPUT_SELECTORS,
    SELECT_SELECTORS
} from '../../../constants/selectors.js';
import { refreshMaterialTable } from '../../../plugins/datatable/shared/inventory/renderMaterialDatatable.js';
import { clearAddedMaterialInput } from '../../../ui/forms/detailFormUI.js';
import { normalizeFormErrors } from '../../../ui/forms/formErrorsUI.js';
import { bindIssueProjectQuantityControls } from '../../../ui/issues/issueFormUI.js';
import {
    matchesDetailIdentifier,
    removeDetail,
    upsertDetail
} from '../../../utils/detailCollectionUtils.js';
import { on } from '../../../utils/domUtils.js';
import { roundTo } from '../../../utils/formatUtils.js';
import { hasValidationErrors, validateDetailsFields, validateFields } from '../../../utils/formUtils.js';
import { goodsIssueDetails } from './goodsIssueModal.js';
import { useIssueForm } from '../../../ui/issues/issueFormUI.js';
import {
    addGoodsIssueMaterialValidation,
    goodsIssueValidation,
    issueProjectQuantityDetailsValidation
} from '../../../utils/validations/validators.js';
import {
    getBase,
    getHeight,
    getPresentation,
    getUnitMeasure,
    mapGoodsIssueDetailsToRequest,
    mapIssueDetailsToSupplyRequest
} from '../../../utils/warehouseInventoryUtils.js';

const formId = FORM_SELECTORS.GOODS_ISSUE;
const form = document.querySelector(formId);
const details = goodsIssueDetails;
const detailTableSelector = DATATABLE_SELECTORS.MATERIAL;

const normalizeGoodsIssueData = ({ form, formData }) => {
    const { mode } = form.dataset;

    if (mode === FORM_MODES.EDIT_DETAIL) {
        return {
            id: form.dataset.id,
            details: mapIssueDetailsToSupplyRequest(goodsIssueDetails)
        };
    }

    if (mode === FORM_MODES.EDIT_HEADER) return formData;

    return {
        ...formData,
        details: mapGoodsIssueDetailsToRequest(goodsIssueDetails)
    };
};

useIssueForm({
    selector: formId,
    normalizeData: normalizeGoodsIssueData,
    getErrors: ({ form, formData }) => {
        const { mode } = form.dataset;

        if (mode === FORM_MODES.EDIT_DETAIL) {
            const detailsToSupply = mapIssueDetailsToSupplyRequest(goodsIssueDetails);

            return detailsToSupply.length
                ? validateDetailsFields(issueProjectQuantityDetailsValidation, detailsToSupply)
                : { details: 'Seleccione al menos un material pendiente por surtir.' };
        }

        const errors = validateFields(goodsIssueValidation, formData);

        if (mode === FORM_MODES.EDIT_HEADER) errors.details = null;

        return errors;
    },
    register: registerGoodsIssue,
    edit: editGoodsIssue,
    editHeader: editGoodsIssueHeader,
    editDetails: editGoodsIssueDetails
});

const addGoodsIssueMaterial = () => {
    const option = document.querySelector(`${ SELECT_SELECTORS.MATERIAL } option:checked`);

    if (!option) return;

    let { text, material, supplier, maxUnitCost } = option.dataset || {};
    material = JSON.parse(material);
    supplier = JSON.parse(supplier);
    const quantity = Number(document.querySelector(INPUT_SELECTORS.QUANTITY).value);

    const errors = validateFields(addGoodsIssueMaterialValidation, {
        materialId: material.id,
        supplierId: supplier.id,
        quantity
    });

    normalizeFormErrors({ form: document.querySelector(formId), errors });

    if (hasValidationErrors(errors)) return;

    const newMaterial = {
        materialId: material.id,
        name: text,
        base: getBase(material),
        height: getHeight(material),
        quantity,
        unitMeasure: getUnitMeasure(material),
        presentation: getPresentation(material),
        convertedQuantity: (!material.base || !material.height)
            ? quantity
            : roundTo(material.base * material.height * quantity),
        supplier: supplier.name,
        maxUnitCost,
        supplierId: supplier.id
    };

    upsertDetail({
        details,
        detail: newMaterial,
        matches: detail => detail.materialId === material.id && detail.supplierId === supplier.id,
        preserveKeys: ['id']
    });

    refreshMaterialTable(details);
    clearAddedMaterialInput();
};

const findDetailByElement = (element) => {
    const { detailId } = element.dataset;

    if (detailId) {
        const detail = details.find(item => item.id === detailId);

        if (detail) return detail;

        return details.find(item => item.materialId === detailId);
    }

    return details.find(detail => detail.materialId === element.dataset.id);
};

on(DOM_EVENT_NAMES.CLICK, BUTTON_SELECTORS.ADD_MATERIAL, addGoodsIssueMaterial);
on(DOM_EVENT_NAMES.CLICK, `${ detailTableSelector } .delete-btn`, (event, button) => {
    const removedDetail = removeDetail({
        details,
        matches: detail => matchesDetailIdentifier({
            detail,
            identifier: button.dataset.id,
            inventoryIdKey: 'materialId'
        })
    });

    if (!removedDetail) return;

    refreshMaterialTable(details);
});
bindIssueProjectQuantityControls({
    form,
    tableSelector: detailTableSelector,
    findDetail: findDetailByElement
});
