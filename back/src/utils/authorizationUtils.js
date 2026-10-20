import { DATA_SCOPES, hasDataScope } from '../constants/permissions.js';

export const hasSystemWideReadAccess = (user) => hasDataScope(
    user?.accesses,
    DATA_SCOPES.SYSTEM_WIDE_READ
);
