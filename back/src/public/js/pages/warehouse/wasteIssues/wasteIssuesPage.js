import { createWasteIssueDatatable } from '../../../plugins/datatable/warehouse/wasteIssues/wasteIssueDatatable.js';
import { createIssueTableActions } from '../../../ui/issues/issueFormUI.js';
import './wasteIssueForm.js';
import { openWasteIssueModal } from './wasteIssueModal.js';

createWasteIssueDatatable({
    context: window.meta || {},
    ...createIssueTableActions({ openIssueModal: openWasteIssueModal })
});
