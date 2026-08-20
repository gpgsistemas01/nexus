import { buildHeaderGrid } from './headerGrid.js';

const getHeaderText = (cell) => cell?.textContent?.replace(/\s+/g, ' ').trim() || '';
const isGroupHeaderCell = (cell) => (Number(cell?.getAttribute?.('colspan')) || 1) > 1;

export const buildResponsiveHeaderLabels = (tableNode) => {
    const grid = buildHeaderGrid(tableNode, cell => ({ cell, text: getHeaderText(cell) }));
    if (!grid.length) return [];

    const columnCount = Math.max(...grid.map(row => row.length));

    return Array.from({ length: columnCount }, (_, columnIndex) => {
        const parts = [];

        grid.forEach((row, rowIndex) => {
            const item = row[columnIndex];
            const hasChildHeader = grid
                .slice(rowIndex + 1)
                .some(nextRow => nextRow[columnIndex]?.cell && nextRow[columnIndex].cell !== item?.cell);

            if (isGroupHeaderCell(item?.cell) && hasChildHeader) return;
            if (item?.text && parts[parts.length - 1] !== item.text) parts.push(item.text);
        });

        return parts.join(' / ');
    });
};

export const renderResponsiveDetails = (api, rowIndex, columns) => {
    const headerLabels = buildResponsiveHeaderLabels(api.table().node());
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
