import { getSuccessMessage } from "../../constants/apiMessages.js";
import { getAllProfilesRequest, registerProfileRequest, updateProfileRequest } from "../../services/admin/profileService.js";

const getProfileSuccessResponse = ({ data }) => {

    const { code, profile } = data;

    return {
        message: getSuccessMessage(code),
        data: profile
    };
};

export const getAllProfiles = async (params = {}) => {

    const response = await getAllProfilesRequest({ params });

    return response;
};

export const registerProfile = async ({ formData }) => {

    const response = await registerProfileRequest({ data: formData });

    const { data } = response;

    return getProfileSuccessResponse({ data });
}

export const updateProfile = async ({ formData, id }) => {

    const response = await updateProfileRequest({ data: formData, id });

    const { data } = response;

    return getProfileSuccessResponse({ data });
}
