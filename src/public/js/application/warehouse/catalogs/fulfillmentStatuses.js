import { getAllFulfillmentStatusesRequest } from "../../../services/warehouse/fulfillmentStatusService.js";
import { createApplicationList } from "../../createCrudApplication.js";

export const getAllFulfillmentStatuses = createApplicationList(getAllFulfillmentStatusesRequest);

export const getFulfillmentStatusOptions = async (params = {}) => {

    const response = await getAllFulfillmentStatusesRequest({ params });
    
    const list = response?.data?.data || [];

    return list
        .filter(status => status?.id && status?.name)
        .map(status => ({
            value: status.id,
            label: status.name
        }));
};
