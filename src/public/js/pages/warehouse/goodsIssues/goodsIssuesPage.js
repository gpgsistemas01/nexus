import { createGoodsIssueDatatable } from '../../../plugins/datatable/warehouse/goodsIssues/goodsIssueDatatable.js';
import { createIssueTableActions } from '../../../ui/issues/issueFormUI.js';
import './goodsIssueForm.js';
import { openGoodsIssueModal } from './goodsIssueModal.js';

createGoodsIssueDatatable({
    context: window.meta || {},
    ...createIssueTableActions({ openIssueModal: openGoodsIssueModal })
});
