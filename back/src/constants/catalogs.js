import { PUBLIC_CATALOGS } from '../shared/constants/catalogs.js';

const storage = {
    departments: { model: 'department', hasStableKey: true },
    roles: { model: 'role', hasStableKey: true },
    presentations: { model: 'presentation' },
    'unit-measures': { model: 'unitMeasure' },
    reasons: { model: 'stockAdjustmentReason' },
    'fulfillment-statuses': { model: 'fulfillmentStatus' }
};

export const MANAGED_CATALOGS = Object.freeze(Object.fromEntries(
    Object.entries(storage).map(([name, internal]) => [name, { ...PUBLIC_CATALOGS[name], ...internal }])
));

export const MANAGED_CATALOG_NAMES = Object.freeze(Object.keys(MANAGED_CATALOGS));

export const findManagedCatalog = name => Object.hasOwn(MANAGED_CATALOGS, name)
    ? MANAGED_CATALOGS[name] : undefined;
