import { createDataTable, resetDataTable } from './baseDatatable.js';

/**
 * Initializes the detail table shared by warehouse issue flows.
 *
 * Domain modules remain responsible for mapping their material or waste data
 * and defining columns; table lifecycle belongs here so both flows behave the
 * same when a modal changes between create, edit and fulfillment modes.
 */
export const createIssueDetailDatatable = ({ selector, data, columns, header = null, options = {} }) => {
    resetDataTable(selector);

    const table = document.querySelector(selector);
    if (header) table.innerHTML = header;

    return createDataTable({
        selector,
        options: {
            data,
            columns,
            responsive: true,
            autoWidth: false,
            ...options
        }
    });
};

export const renderIssueSupplyCheckbox = ({ detailId, isSupplied, isDisabled = false }) => `
    <input type="checkbox"
        name="isSupplied"
        class="form-check-input supply-checkbox"
        data-detail-id="${ detailId }"
        ${ isSupplied ? 'checked' : '' }
        ${ isDisabled ? 'disabled' : '' }
    >
`;
