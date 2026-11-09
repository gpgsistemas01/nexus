import { internalClientName } from "../../../shared/inventory/issueHeaderRules.js";
import { ROLE_KEYS } from "../../../constants/roles.js";
import { normalizeText } from '../../../utils/formattersUtils.js';

const isInternalClient = (client) => (
    normalizeText(client?.name || '') === normalizeText(internalClientName)
);

export const isValidInternalClientAdvisor = ({ client, advisor }) => {

    if (!isInternalClient(client)) return true;

    return advisor?.accesses?.some(({ role }) => role?.key === ROLE_KEYS.COORDINATOR) || false;
};
