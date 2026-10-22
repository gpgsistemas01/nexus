import {
    mdiWarehouse,
    mdiLayersTripleOutline,
    mdiPackageVariantClosed,
    mdiRecycleVariant,
    mdiFolderCogOutline,
    mdiOfficeBuildingOutline,
    mdiAccountKeyOutline,
    mdiPackageVariant,
    mdiRulerSquare,
    mdiClipboardEditOutline,
    mdiListStatus,
    mdiLogout,
} from '@mdi/js';

// SVG oficiales importados por nombre; Vite conserva los iconos utilizados.
export const APP_ICONS = {
    warehouse: `svg:${mdiWarehouse}`,
    materials: `svg:${mdiLayersTripleOutline}`,
    consumables: `svg:${mdiPackageVariantClosed}`,
    wastes: `svg:${mdiRecycleVariant}`,
    catalogs: `svg:${mdiFolderCogOutline}`,
    departments: `svg:${mdiOfficeBuildingOutline}`,
    roles: `svg:${mdiAccountKeyOutline}`,
    presentations: `svg:${mdiPackageVariant}`,
    'unit-measures': `svg:${mdiRulerSquare}`,
    reasons: `svg:${mdiClipboardEditOutline}`,
    'fulfillment-statuses': `svg:${mdiListStatus}`,
    logout: `svg:${mdiLogout}`,
};
