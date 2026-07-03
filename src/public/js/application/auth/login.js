import { createSuccessResponseFromRequest } from "../../utils/responseUtils.js";
import { loginRequest } from "../../services/authService.js";

export const login = async ({ formData }) => {

    const response = await loginRequest({ data: formData });

    return createSuccessResponseFromRequest({ response });
}
