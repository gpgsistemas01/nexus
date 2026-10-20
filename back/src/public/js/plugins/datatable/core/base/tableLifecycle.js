import { initMdbTooltips } from '../../../mdb/baseInstance.js';

export const getLastAvailableDataTablePage = (pageInfo = {}) => {
    const recordsDisplay = Number(pageInfo.recordsDisplay) || 0;
    const pages = Number(pageInfo.pages) || 0;

    if (recordsDisplay <= 0 || pages <= 0 || pageInfo.page < pages) return null;

    return pages - 1;
};

export const adjustDataTableColumns = (table) => {
    if (typeof table?.columns?.adjust !== 'function') return;

    table.columns.adjust();

    if (typeof table?.responsive?.recalc === 'function') table.responsive.recalc();
};

export const initDataTableMdbComponents = (table) => {
    const tableNode = table?.table?.().node?.();

    if (tableNode) initMdbTooltips(tableNode);
};
