import { FORM_SELECTORS, INPUT_SELECTORS, MODAL_SELECTORS, SELECT_SELECTORS } from '../../../constants/selectors.js';
import { setupWasteSelect, toggleWasteOption } from '../domains/waste.js';
import { createIssueHeaderSelects } from './issueHeaderSelect.js';

const modalSelector = MODAL_SELECTORS.WASTE_ISSUE;
const headerSelects = createIssueHeaderSelects({
    modalSelector,
    formSelector: FORM_SELECTORS.WASTE_ISSUE,
    selectors: {
        requester: SELECT_SELECTORS.REQUESTER,
        client: SELECT_SELECTORS.CLIENT,
        department: SELECT_SELECTORS.DEPARTMENT,
        advisor: SELECT_SELECTORS.ADVISOR,
        projectNumber: INPUT_SELECTORS.PROJECT_NUMBER
    }
});

export const getWasteIssueHeaderSelects = () => ({
    init: () => {

        headerSelects.init();
        setupWasteSelect({
            modalSelector,
            wasteSelector: SELECT_SELECTORS.WASTE,
            allowCreate: false
        });
    },
    setOptions: (data) => {

        headerSelects.setOptions(data);
        toggleWasteOption({
            selector: `${ modalSelector } ${ SELECT_SELECTORS.WASTE }`,
            data: { id: null, text: null }
        });
    },
    syncState: headerSelects.syncState
});
