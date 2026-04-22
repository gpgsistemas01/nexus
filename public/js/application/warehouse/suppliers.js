import { getErrorMessage, getSuccessMessage } from "../../constants/apiMessages.js";
import { editSupplierRequest, registerSupplierRequest } from "../../services/warehouse/supplierService.js";

export const registerSupplier = async (formData) => {

    try {

        const response = await registerSupplierRequest(formData);

        const { data } = response;
        const { code, supplier } = data;
        let message = getSuccessMessage(code);

        return {
            data: supplier,
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

        } else throw err;
    }
}

export const editSupplier = async (formData, id) => {

    try {

        const response = await editSupplierRequest(formData, id);

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

        } else throw err;
    }
}