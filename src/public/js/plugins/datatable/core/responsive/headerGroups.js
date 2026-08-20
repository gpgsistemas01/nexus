import { buildHeaderGrid, getHeaderColumnMap } from './headerGrid.js';

const configuredTableHeaderState = new WeakMap();

const isResponsiveColumnVisible = (table, columnIndex) => {
    const columnApi = table.column(columnIndex);
    const isDataTablesVisible = typeof columnApi.visible === 'function' ? columnApi.visible() : true;
    const isResponsiveVisible = typeof columnApi.responsiveHidden === 'function'
        ? columnApi.responsiveHidden() !== false
        : true;

    return isDataTablesVisible && isResponsiveVisible;
};

const setHeaderVisibility = (header, isVisible) => {
    if (!header) return;

    header.hidden = !isVisible;
    header.style.display = isVisible ? '' : 'none';
};

const addGroupChild = (groups, groupName, header, columnIndex) => {
    if (!groupName || columnIndex === undefined) return;

    groups[groupName] ||= [];

    if (!groups[groupName].some(child => child.header === header)) {
        groups[groupName].push({ header, columnIndex });
    }
};

const resolveResponsiveHeaderGroups = (tableNode) => {
    const grid = buildHeaderGrid(tableNode);
    const columnMap = getHeaderColumnMap(grid);
    const groups = {};
    const childHeaders = Array.from(tableNode?.querySelectorAll?.('thead th[data-responsive-parent]') || []);

    childHeaders.forEach((header) => {
        addGroupChild(groups, header.getAttribute('data-responsive-parent'), header, columnMap.get(header));
    });

    Array.from(tableNode?.querySelectorAll?.('thead th[colspan]') || []).forEach((groupHeader, groupIndex) => {
        const colspan = Number(groupHeader.getAttribute('colspan')) || 1;
        if (colspan <= 1) return;

        const groupName = groupHeader.getAttribute('data-responsive-group') || `__responsive_colspan_${ groupIndex }`;
        const startColumn = columnMap.get(groupHeader);
        if (startColumn === undefined) return;

        groups[groupName] ||= [];
        groups[groupName].groupHeader = groupHeader;

        grid.forEach((row) => {
            row.slice(startColumn, startColumn + colspan).forEach((header, offset) => {
                if (header && header !== groupHeader) addGroupChild(groups, groupName, header, startColumn + offset);
            });
        });
    });

    return groups;
};

const syncResponsiveHeaderGroups = (table, groupedHeaders) => {
    const tableNode = table?.table?.().node?.();
    if (!tableNode || typeof table?.column !== 'function' || !groupedHeaders) return;

    Object.entries(groupedHeaders).forEach(([groupName, children]) => {
        const groupHeader = children.groupHeader
            || tableNode.querySelector?.(`thead th[data-responsive-group="${ groupName }"]`)
            || null;
        const visibleChildren = children.filter(({ columnIndex }) => isResponsiveColumnVisible(table, columnIndex));

        children.forEach(({ header, columnIndex }) => {
            setHeaderVisibility(header, isResponsiveColumnVisible(table, columnIndex));
        });

        if (groupHeader) {
            groupHeader.colSpan = Math.max(visibleChildren.length, 1);
            setHeaderVisibility(groupHeader, visibleChildren.length > 0);
        }
    });
};

const getHeaderSignature = (tableNode) => Array.from(tableNode?.querySelectorAll?.('thead tr') || [])
    .map(row => Array.from(row.children)
        .map(cell => [
            cell.tagName,
            cell.textContent?.replace(/\s+/g, ' ').trim() || '',
            cell.getAttribute('rowspan') || '1',
            cell.getAttribute('colspan') || '1',
            cell.getAttribute('data-responsive-group') || '',
            cell.getAttribute('data-responsive-parent') || ''
        ].join(':'))
        .join('|'))
    .join('||');

export const configureResponsiveHeaderGroups = (table) => {
    const tableNode = table?.table?.().node?.();
    if (!tableNode) return;

    const headerSignature = getHeaderSignature(tableNode);
    const tableSettings = typeof table?.settings === 'function' ? table.settings()[0] : null;
    const configuredState = configuredTableHeaderState.get(tableNode);

    if (configuredState?.headerSignature === headerSignature && configuredState?.tableSettings === tableSettings) return;

    configuredTableHeaderState.set(tableNode, { headerSignature, tableSettings });
    $(tableNode).off('.responsiveHeaderGroups');

    const groupedHeaders = resolveResponsiveHeaderGroups(tableNode);
    syncResponsiveHeaderGroups(table, groupedHeaders);
    $(tableNode).on(
        'responsive-resize.dt.responsiveHeaderGroups column-visibility.dt.responsiveHeaderGroups draw.dt.responsiveHeaderGroups',
        () => syncResponsiveHeaderGroups(table, groupedHeaders)
    );
};
