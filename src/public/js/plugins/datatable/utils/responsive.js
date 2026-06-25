export const getResponsiveRowData = (datatable, element) => {

    let tr = $(element).closest('tr');

    if (tr.hasClass('child')) {
        tr = tr.prev();
    }

    return datatable.row(tr).data();
};


const isResponsiveColumnVisible = (table, columnIndex) => {

    const columnApi = table.column(columnIndex);
    const isDataTablesVisible = typeof columnApi.visible === 'function' ? columnApi.visible() : true;
    const isResponsiveVisible = typeof columnApi.responsiveHidden === 'function' ? columnApi.responsiveHidden() !== false : true;

    return isDataTablesVisible && isResponsiveVisible;
};

const getHeaderColumnMap = (tableNode) => {

    const headerRows = Array.from(tableNode?.querySelectorAll?.('thead tr') || []);
    const grid = [];

    headerRows.forEach((row, rowIndex) => {
        grid[rowIndex] ||= [];
        let columnIndex = 0;

        Array.from(row.children).forEach((cell) => {
            while (grid[rowIndex][columnIndex]) columnIndex += 1;

            const colspan = Number(cell.getAttribute('colspan')) || 1;
            const rowspan = Number(cell.getAttribute('rowspan')) || 1;

            for (let rowOffset = 0; rowOffset < rowspan; rowOffset += 1) {
                grid[rowIndex + rowOffset] ||= [];

                for (let colOffset = 0; colOffset < colspan; colOffset += 1) {
                    grid[rowIndex + rowOffset][columnIndex + colOffset] = cell;
                }
            }

            columnIndex += colspan;
        });
    });

    return grid.reduce((cellMap, row) => {
        row.forEach((cell, columnIndex) => {
            if (cell && !cellMap.has(cell)) cellMap.set(cell, columnIndex);
        });

        return cellMap;
    }, new Map());
};

const resolveResponsiveHeaderGroups = (tableNode) => {

    const columnMap = getHeaderColumnMap(tableNode);
    const childHeaders = Array.from(tableNode?.querySelectorAll?.('thead th[data-responsive-parent]') || []);

    return childHeaders.reduce((groups, header) => {
        const groupName = header.getAttribute('data-responsive-parent');
        const columnIndex = columnMap.get(header);

        if (!groupName || columnIndex === undefined) return groups;

        groups[groupName] ||= [];
        groups[groupName].push({ header, columnIndex });

        return groups;
    }, {});
};

const syncResponsiveHeaderGroups = (table, groupedHeaders) => {

    const tableNode = table?.table?.().node?.();

    if (!tableNode || typeof table?.column !== 'function' || !groupedHeaders) return;

    Object.entries(groupedHeaders).forEach(([groupName, children]) => {
        const groupHeader = tableNode.querySelector(`thead th[data-responsive-group="${ groupName }"]`);
        const visibleChildren = children.filter(({ columnIndex }) => isResponsiveColumnVisible(table, columnIndex));
        const isGroupVisible = visibleChildren.length > 0;

        if (groupHeader) {
            groupHeader.hidden = !isGroupVisible;
            groupHeader.colSpan = Math.max(visibleChildren.length, 1);
        }

        children.forEach(({ header, columnIndex }) => {
            header.hidden = !isResponsiveColumnVisible(table, columnIndex);
        });
    });
};

export const configureResponsiveHeaderGroups = (table) => {

    const tableNode = table?.table?.().node?.();

    if (!tableNode) return;

    const groupedHeaders = resolveResponsiveHeaderGroups(tableNode);

    syncResponsiveHeaderGroups(table, groupedHeaders);

    $(tableNode).on('responsive-resize.dt column-visibility.dt draw.dt', () => {
        syncResponsiveHeaderGroups(table, groupedHeaders);
    });
};

const getHeaderText = (cell) => cell?.textContent?.replace(/\s+/g, ' ').trim() || '';

export const buildResponsiveHeaderLabels = (tableNode) => {

    const headerRows = Array.from(tableNode?.querySelectorAll?.('thead tr') || []);

    if (!headerRows.length) return [];

    const grid = [];

    headerRows.forEach((row, rowIndex) => {
        grid[rowIndex] ||= [];
        let columnIndex = 0;

        Array.from(row.children).forEach((cell) => {
            while (grid[rowIndex][columnIndex]) columnIndex += 1;

            const colspan = Number(cell.getAttribute('colspan')) || 1;
            const rowspan = Number(cell.getAttribute('rowspan')) || 1;
            const text = getHeaderText(cell);

            for (let rowOffset = 0; rowOffset < rowspan; rowOffset += 1) {
                grid[rowIndex + rowOffset] ||= [];

                for (let colOffset = 0; colOffset < colspan; colOffset += 1) {
                    grid[rowIndex + rowOffset][columnIndex + colOffset] = { cell, text };
                }
            }

            columnIndex += colspan;
        });
    });

    const columnCount = Math.max(...grid.map(row => row.length));

    return Array.from({ length: columnCount }, (_, columnIndex) => {
        const parts = [];

        grid.forEach((row) => {
            const item = row[columnIndex];

            if (item?.text && parts[parts.length - 1] !== item.text) parts.push(item.text);
        });

        return parts.join(' / ');
    });
};

export const renderResponsiveDetails = (api, rowIndex, columns) => {

    const tableNode = api.table().node();
    const headerLabels = buildResponsiveHeaderLabels(tableNode);
    const hiddenColumns = columns
        .filter(column => column.hidden)
        .map(column => {
            const title = headerLabels[column.columnIndex] || column.title || `Columna ${ column.columnIndex + 1 }`;

            return `
                <li class="datatable-responsive-detail-item" data-dt-row="${ column.rowIndex }" data-dt-column="${ column.columnIndex }">
                    <span class="datatable-responsive-detail-title">${ title }</span>
                    <span class="datatable-responsive-detail-value">${ column.data ?? '<span class="text-muted">—</span>' }</span>
                </li>
            `;
        })
        .join('');

    if (!hiddenColumns) return false;

    return `<ul class="datatable-responsive-detail-list" data-dt-row="${ rowIndex }">${ hiddenColumns }</ul>`;
};
