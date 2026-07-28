import { INTERNAL_CLIENT_NAME } from "../../../constants/goodsIssueRules.js";
import { ROLE_NAMES } from "../../../constants/roles.js";
import { normalizeText } from "../../../utils/formattersUtils.js";

const isInternalClient = (client) => (
    normalizeText(client?.name || '') === normalizeText(INTERNAL_CLIENT_NAME)
);

export const isValidInternalClientAdvisor = ({ client, advisor }) => {

    if (!isInternalClient(client)) return true;

    return advisor?.accesses?.some(({ role }) => (
        normalizeText(role?.name || '') === normalizeText(ROLE_NAMES.COORDINATOR)
    )) || false;
};
