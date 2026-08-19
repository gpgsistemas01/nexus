import { getAllWastes } from '../../../application/warehouse/wastes.js';
import { FORM_SELECTORS } from '../../../constants/selectors.js';
import { setupWasteSelect, toggleWasteOption } from '../domains/waste.js';
import { createIssueHeaderSelects } from './issueHeaderSelect.js';

const modalSelector = '#wasteIssueModal';
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
            selector: `${ modalSelector } ${ FORM_SELECTORS.WASTE_FORM }`,
            data: { id: null, text: null }
        });
    },
    syncState: headerSelects.syncState
});