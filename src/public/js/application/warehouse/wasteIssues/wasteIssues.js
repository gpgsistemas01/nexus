import {
    editWasteIssueDetailsRequest,
    editWasteIssueHeaderRequest,
    editWasteIssueRequest,
    getAllWasteIssuesRequest,
    registerWasteIssueRequest,
    returnWasteIssueDetailRequest
} from '../../../services/warehouse/wasteIssueService.js';
import { createIssueApplication } from '../issues/createIssueApplication.js';

const wasteIssueApplication = createIssueApplication({
    requests: {
        getAll: getAllWasteIssuesRequest,
        register: registerWasteIssueRequest,
        edit: editWasteIssueRequest,
        editHeader: editWasteIssueHeaderRequest,
        editDetails: editWasteIssueDetailsRequest,
        returnDetail: returnWasteIssueDetailRequest
    },
    dataKeys: {
        issue: 'wasteIssue',
        issueReturn: 'wasteIssueReturn'
    }
});

export const getAllWasteIssues = wasteIssueApplication.getAll;
export const registerWasteIssue = wasteIssueApplication.register;
export const editWasteIssue = wasteIssueApplication.edit;
export const editWasteIssueHeader = wasteIssueApplication.editHeader;
export const editWasteIssueDetails = wasteIssueApplication.editDetails;
export const returnWasteIssueDetail = wasteIssueApplication.returnDetail;
