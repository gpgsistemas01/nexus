export const getResponsiveRowData = (datatable, element) => {
    let tableRow = $(element).closest('tr');

    if (tableRow.hasClass('child')) tableRow = tableRow.prev();

    return datatable.row(tableRow).data();
};
