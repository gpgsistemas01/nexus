import { createGoodsIssueDatatable } from '../../../plugins/datatable/warehouse/goodsIssues/goodsIssueDatatable.js';
import { createIssueTableActions } from '../../../ui/issues/issueFormUI.js';
import '../../sales/clients/clientForm.js';
import './goodsIssueForm.js';
import { openGoodsIssueModal } from './goodsIssueModal.js';

export const startGoodsIssuesPage = () => createGoodsIssueDatatable({
    context: window.meta || {},
    ...createIssueTableActions({ openIssueModal: openGoodsIssueModal })
});
