export const getResponsiveRowData = (datatable, element) => {

    let tr = $(element).closest('tr');

    if (tr.hasClass('child')) {
        tr = tr.prev();
    }

    return datatable.row(tr).data();
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
