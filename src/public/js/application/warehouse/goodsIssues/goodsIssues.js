import { createSuccessResponseFromRequest } from "../../../utils/responseUtils.js";
import { editGoodsIssueDetailsRequest, editGoodsIssueRequest, getAllGoodsIssuesRequest, registerGoodsIssueRequest } from "../../../services/warehouse/goodsIssueService.js";

export const getAllGoodsIssues = async (params = {}) => {

    const response = await getAllGoodsIssuesRequest({ params });

    return response;
};

export const registerGoodsIssue = async ({ formData }) => {

    const response = await registerGoodsIssueRequest({ data: formData });

    return createSuccessResponseFromRequest({ response });
};

export const editGoodsIssue = async ({ formData, id }) => {

    const response = await editGoodsIssueRequest({ data: formData, id });

    return createSuccessResponseFromRequest({ response });
};

export const editGoodsIssueDetails = async ({ formData, id }) => {

    const response = await editGoodsIssueDetailsRequest({ data: formData, id });

    return createSuccessResponseFromRequest({ response });
};
