import { createSuccessResponseFromRequest } from '../../../utils/responseUtils.js';
import {
    editWasteIssueDetailsRequest,
    editWasteIssueHeaderRequest,
    editWasteIssueRequest,
    getAllWasteIssuesRequest,
    registerWasteIssueRequest,
    returnWasteIssueDetailRequest
} from '../../../services/warehouse/wasteIssueService.js';

export const getAllWasteIssues = async (params = {}) => getAllWasteIssuesRequest({ params });

export const registerWasteIssue = async ({ formData }) => {
    const response = await registerWasteIssueRequest({ data: formData });

    return createSuccessResponseFromRequest({ response, dataKey: 'wasteIssue' });
};

export const editWasteIssue = async ({ id, formData }) => {
    const response = await editWasteIssueRequest({ id, data: formData });

    return createSuccessResponseFromRequest({ response, dataKey: 'wasteIssue' });
};

export const editWasteIssueHeader = async ({ id, formData }) => {
    const response = await editWasteIssueHeaderRequest({ id, data: formData });

    return createSuccessResponseFromRequest({ response, dataKey: 'wasteIssue' });
};

export const editWasteIssueDetails = async ({ id, formData }) => {
    const response = await editWasteIssueDetailsRequest({ id, data: formData });

    return createSuccessResponseFromRequest({ response, dataKey: 'wasteIssue' });
};

export const returnWasteIssueDetail = async ({ id, detailId, formData }) => {
    const response = await returnWasteIssueDetailRequest({ id, detailId, data: formData });

    return createSuccessResponseFromRequest({ response, dataKey: 'wasteIssueReturn' });
};
