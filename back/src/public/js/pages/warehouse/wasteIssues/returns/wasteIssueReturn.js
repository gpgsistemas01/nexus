import { returnWasteIssueDetail } from '../../../../application/warehouse/wasteIssues/wasteIssues.js';
import { DOM_EVENT_NAMES } from '../../../../constants/events.js';
import { DATATABLE_SELECTORS } from '../../../../constants/selectors.js';
import { createIssueReturn } from '../../../../ui/issues/issueReturnUI.js';
import { on } from '../../../../utils/domUtils.js';

const wasteIssueReturn = createIssueReturn({
    sendReturn: returnWasteIssueDetail
});

const findDetailByElement = (details, element) => details.find(detail => (
    detail.id === element.dataset.detailId
    || detail.id === element.dataset.id
    || detail.wasteId === element.dataset.id
));

export const initializeWasteIssueReturns = ({ details, getIssueId }) => {
    wasteIssueReturn.initialize();

    on(DOM_EVENT_NAMES.CLICK, `${ DATATABLE_SELECTORS.MATERIAL } .return-issue-detail-btn`, (event, button) => {
        const detail = findDetailByElement(details, button);

        if (detail) wasteIssueReturn.open({ issue: { id: getIssueId() }, detail });
    });
};
