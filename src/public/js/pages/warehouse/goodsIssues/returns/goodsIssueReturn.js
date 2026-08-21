import { returnGoodsIssueDetail } from '../../../../application/warehouse/goodsIssues/goodsIssues.js';
import { DOM_EVENT_NAMES } from '../../../../constants/events.js';
import { createIssueReturn } from '../../../../ui/issues/issueReturnUI.js';
import { on } from '../../../../utils/domUtils.js';

const goodsIssueReturn = createIssueReturn({
    sendReturn: returnGoodsIssueDetail
});

export const initializeGoodsIssueReturns = ({ details, getCurrentIssue }) => {
    goodsIssueReturn.initialize();

    on(DOM_EVENT_NAMES.CLICK, '#materialTable .return-issue-detail-btn', (event, button) => {
        const detail = details.find(item => item.id === button.dataset.id);
        const issue = getCurrentIssue();

        if (!detail || !issue) return;

        goodsIssueReturn.open({ issue, detail });
    });
};
