import { FORM_SELECTORS, INPUT_SELECTORS, MODAL_SELECTORS, SELECT_SELECTORS } from '../../../constants/selectors.js';
import { setupMaterialSelect, toggleMaterialOption } from '../domains/material.js';
import { createIssueHeaderSelects } from './issueHeaderSelect.js';

const modalSelector = MODAL_SELECTORS.GOODS_ISSUE;
const headerSelects = createIssueHeaderSelects({
    modalSelector,
    formSelector: FORM_SELECTORS.GOODS_ISSUE,
    selectors: {
        requester: SELECT_SELECTORS.REQUESTER,
        client: SELECT_SELECTORS.CLIENT,
        department: SELECT_SELECTORS.DEPARTMENT,
        advisor: SELECT_SELECTORS.ADVISOR,
        projectNumber: INPUT_SELECTORS.PROJECT_NUMBER
    }
});

export const getGoodsIssueHeaderSelects = () => ({
    init: () => {

        headerSelects.init();
        setupMaterialSelect({
            modalSelector,
            materialSelector: SELECT_SELECTORS.MATERIAL,
            allowCreate: false
        });
    },
    setOptions: (data) => {

        headerSelects.setOptions(data);
        toggleMaterialOption({
            selector: `${ modalSelector } ${ SELECT_SELECTORS.MATERIAL }`,
            data: { id: null, text: null }
        });
    },
    syncState: headerSelects.syncState
});