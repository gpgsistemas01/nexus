import { getSuccessMessage } from "../../constants/apiMessages.js";
import { approveGoodsIssueRequest, cancelGoodsIssueRequest, confirmGoodsIssueRequest, editGoodsIssueDetailsRequest, registerGoodsIssueRequest, rejectGoodsIssueRequest } from "../../services/warehouse/goodsIssueService.js";

export const registerGoodsIssue = async (formData) => {

    try {
    
        const response = await registerGoodsIssueRequest(formData);

        const { data } = response;
        const { code } = data;
        let message = getSuccessMessage(code);

        return {
            message
        };

    } catch (err) {

        if (err.response) {

            let message;
            const { data, status } = err.response;

            switch (status) {

                case 404:
                    message = getErrorMessage(data.code);
                    err.message = message;
                    throw err;
                default:
                    throw err;
            }

        } else {

            throw err;
        }
    }
};

export const editGoodsIssueDetails = async (formData, id) => {

    try {
    
        const response = await editGoodsIssueDetailsRequest(formData, id);

        const { data } = response;
        const { code } = data;
        let message = getSuccessMessage(code);

        return {
            message
        };

    } catch (err) {

        if (err.response) {

            let message;
            const { data, status } = err.response;

            switch (status) {

                case 404:
                    message = getErrorMessage(data.code);
                    err.message = message;
                    throw err;
                default:
                    throw err;
            }

        } else {

            throw err;
        }
    }
};

export const cancelGoodsIssue = async (id) => {

    try {
    
        const response = await cancelGoodsIssueRequest(id);

        const { data } = response;
        const { code } = data;
        let message = getSuccessMessage(code);

        return {
            message
        };

    } catch (err) {

        if (err.response) {

            let message;
            const { data, status } = err.response;

            switch (status) {

                case 404:
                    message = getErrorMessage(data.code);
                    err.message = message;
                    throw err;
                default:
                    throw err;
            }

        } else {

            throw err;
        }
    }
}

export const confirmGoodsIssue = async (id) => {

    try {
    
        const response = await confirmGoodsIssueRequest(id);

        const { data } = response;
        const { code } = data;
        let message = getSuccessMessage(code);

        return {
            message
        };

    } catch (err) {

        if (err.response) {

            let message;
            const { data, status } = err.response;

            switch (status) {

                case 404:
                    message = getErrorMessage(data.code);
                    err.message = message;
                    throw err;
                default:
                    throw err;
            }

        } else {

            throw err;
        }
    }
}

export const rejectGoodsIssue = async (id) => {

    try {
    
        const response = await rejectGoodsIssueRequest(id);

        const { data } = response;
        const { code } = data;
        let message = getSuccessMessage(code);

        return {
            message
        };

    } catch (err) {

        if (err.response) {

            let message;
            const { data, status } = err.response;

            switch (status) {

                case 404:
                    message = getErrorMessage(data.code);
                    err.message = message;
                    throw err;
                default:
                    throw err;
            }

        } else {

            throw err;
        }
    }
}

export const approveGoodsIssue = async (id) => {

    try {
    
        const response = await approveGoodsIssueRequest(id);

        const { data } = response;
        const { code } = data;
        let message = getSuccessMessage(code);

        return {
            message
        };

    } catch (err) {

        if (err.response) {

            let message;
            const { data, status } = err.response;

            switch (status) {

                case 404:
                    message = getErrorMessage(data.code);
                    err.message = message;
                    throw err;
                default:
                    throw err;
            }

        } else {

            throw err;
        }
    }
}