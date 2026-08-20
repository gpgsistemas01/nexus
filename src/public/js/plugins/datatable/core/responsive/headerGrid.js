export const buildHeaderGrid = (tableNode, mapCell = cell => cell) => {
    const headerRows = Array.from(tableNode?.querySelectorAll?.('thead tr') || []);
    const grid = [];

    headerRows.forEach((row, rowIndex) => {
        grid[rowIndex] ||= [];
        let columnIndex = 0;

        Array.from(row.children).forEach((cell) => {
            while (grid[rowIndex][columnIndex]) columnIndex += 1;

            const colspan = Number(cell.getAttribute('colspan')) || 1;
            const rowspan = Number(cell.getAttribute('rowspan')) || 1;
            const value = mapCell(cell);

            for (let rowOffset = 0; rowOffset < rowspan; rowOffset += 1) {
                grid[rowIndex + rowOffset] ||= [];

                for (let colOffset = 0; colOffset < colspan; colOffset += 1) {
                    grid[rowIndex + rowOffset][columnIndex + colOffset] = value;
                }
            }

            columnIndex += colspan;
        });
    });

    return grid;
};

export const getHeaderColumnMap = (grid) => grid.reduce((cellMap, row) => {
    row.forEach((cell, columnIndex) => {
        if (cell && !cellMap.has(cell)) cellMap.set(cell, columnIndex);
    });

    return cellMap;
}, new Map());
