import { MATERIAL_SELECT_RESULTS_LIMIT } from '../../../application/warehouse/materials.js';
import { FORM_SELECTORS, MODAL_SELECTORS } from '../../../constants/selectors.js';
import { setupMaterialSelect, toggleMaterialOption } from '../domains/material.js';
import { createIssueHeaderSelects } from './issueHeaderSelect.js';

const modalSelector = MODAL_SELECTORS.GOODS_ISSUE;
const headerSelects = createIssueHeaderSelects({
    modalSelector,
    formSelector: FORM_SELECTORS.GOODS_ISSUE,
    selectors: {
        requester: FORM_SELECTORS.REQUESTER,
        client: FORM_SELECTORS.CLIENT,
        department: FORM_SELECTORS.DEPARTMENT,
        advisor: FORM_SELECTORS.ADVISOR,
        projectNumber: FORM_SELECTORS.PROJECT_NUMBER
    }
});

export const getGoodsIssueHeaderSelects = () => ({
    init: () => {

        headerSelects.init();
        setupMaterialSelect({
            modalSelector,
            materialSelector: FORM_SELECTORS.MATERIAL,
            allowCreate: false
        });
    },
    setOptions: (data) => {

        headerSelects.setOptions(data);
        toggleMaterialOption({
            selector: `${ modalSelector } ${ FORM_SELECTORS.MATERIAL }`,
            data: { id: null, text: null }
        });
    },
    syncState: headerSelects.syncState
});