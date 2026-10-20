import { DATATABLE_SELECTORS } from '../../../../constants/selectors.js';

export const reloadMainTable = ({ resetPaging = false } = {}) => {
    const table = $(DATATABLE_SELECTORS.MAIN).DataTable();
    table.ajax.reload(null, resetPaging);
};

export const configureRealtimeReload = ({ table, eventName, matches = () => true, delay = 100 }) => {
    let reloadTimer = null;

    window.addEventListener(eventName, (event) => {
        if (!matches(event)) return;

        clearTimeout(reloadTimer);
        reloadTimer = setTimeout(() => {
            table.ajax.reload(null, false);
        }, delay);
    });
};

export const refreshDataTable = ({ selector, data }) => {
    const table = $(selector).DataTable();
    table.clear();
    table.rows.add(data);
    table.draw();
};

export const resetDataTable = selector => {
    if (!$.fn.DataTable.isDataTable(selector)) return;

    $(selector).DataTable().clear().destroy();
    $(selector).empty();
};
