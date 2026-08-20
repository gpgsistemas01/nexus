import { FORM_SELECTORS, MODAL_SELECTORS } from '../../../constants/selectors.js';
import { setupWasteSelect, toggleWasteOption } from '../domains/waste.js';
import { createIssueHeaderSelects } from './issueHeaderSelect.js';

const modalSelector = MODAL_SELECTORS.WASTE_ISSUE;
const headerSelects = createIssueHeaderSelects({
    modalSelector,
    formSelector: FORM_SELECTORS.WASTE_ISSUE,
    selectors: {
        requester: FORM_SELECTORS.REQUESTER,
        client: FORM_SELECTORS.CLIENT,
        department: FORM_SELECTORS.DEPARTMENT,
        advisor: FORM_SELECTORS.ADVISOR,
        projectNumber: FORM_SELECTORS.PROJECT_NUMBER
    }
});

export const getWasteIssueHeaderSelects = () => ({
    init: () => {

        headerSelects.init();
        setupWasteSelect({
            modalSelector,
            wasteSelector: FORM_SELECTORS.WASTE_INPUT,
            allowCreate: false
        });
    },
    setOptions: (data) => {

        headerSelects.setOptions(data);
        toggleWasteOption({
            selector: `${ modalSelector } ${ FORM_SELECTORS.WASTE_INPUT }`,
            data: { id: null, text: null }
        });
    },
    syncState: headerSelects.syncState
});
