import { INTERNAL_CLIENT_NAME } from "../../../constants/issueHeaderRules.js";
import { ROLE_KEYS } from "../../../constants/roles.js";
import { normalizeText } from '../../../utils/formattersUtils.js';

const isInternalClient = (client) => (
    normalizeText(client?.name || '') === normalizeText(INTERNAL_CLIENT_NAME)
);

export const isValidInternalClientAdvisor = ({ client, advisor }) => {

    if (!isInternalClient(client)) return true;

    return advisor?.accesses?.some(({ role }) => role?.key === ROLE_KEYS.COORDINATOR) || false;
};
