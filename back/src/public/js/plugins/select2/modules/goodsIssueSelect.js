import { FORM_SELECTORS, INPUT_SELECTORS, MODAL_SELECTORS, SELECT_SELECTORS } from '../../../constants/selectors.js';
import { setupMaterialSelect, toggleMaterialOption } from '../domains/material.js';
import { createIssueHeaderSelects } from './issueHeaderSelect.js';

const modalSelector = MODAL_SELECTORS.GOODS_ISSUE;
export const getGoodsIssueHeaderSelects = ({ resource, onCreateClient }) => {
    const headerSelects = createIssueHeaderSelects({
        modalSelector,
        onCreateClient,
        formSelector: FORM_SELECTORS.GOODS_ISSUE,
        selectors: {
            requester: SELECT_SELECTORS.REQUESTER,
            client: SELECT_SELECTORS.CLIENT,
            department: SELECT_SELECTORS.DEPARTMENT,
            advisor: SELECT_SELECTORS.ADVISOR,
            projectNumber: INPUT_SELECTORS.PROJECT_NUMBER
        }
    });

    return {
        init: () => {

            headerSelects.init();
            setupMaterialSelect({
                modalSelector,
                materialSelector: SELECT_SELECTORS.MATERIAL,
                allowCreate: false,
                resource
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
    };
};
