const shouldShowIssueProjectColumns = ({ type, mode, isWarehouse, isCoordinator, isSystem }) => (
    type === 'issue'
    && ((isWarehouse && isCoordinator) || isSystem)
    && (mode === 'edit-detail' || mode === 'view')
);

export const buildDetailsHeader = ({ type, mode, isWarehouse, isCoordinator, isSystem }) => {

    let extraHeaders = '';
    const suppliedQuantityHeader = type === 'issue' && (mode === 'edit-detail' || mode === 'view' || mode === 'return')
        ? '<th rowspan="2">Cantidad surtida</th>'
        : '';

    if (shouldShowIssueProjectColumns({ type, mode, isWarehouse, isCoordinator, isSystem })) {
        extraHeaders += `
            <th rowspan="2">Costo unitario de Conversión</th>
            <th rowspan="2">Cantidad de proyecto</th>
            <th rowspan="2">Diferencia</th>
        `;
    }

    if (type === 'receipt') {
        extraHeaders += `
            <th rowspan="2">Costo Unitario de Conversión</th>
            <th rowspan="2">Costo por Presentación</th>
            <th rowspan="2">Monto s/ IVA</th>
            <th rowspan="2">Monto c/ IVA</th>
        `;
    }

    if (type === 'issue' && mode === 'edit-detail') {
        extraHeaders += `<th rowspan="2">Surtir</th>`;
    }

    if ((type === 'issue' || type === 'receipt') && mode === 'return') {
        extraHeaders += `
            <th rowspan="2">Total devuelto</th>
            <th rowspan="2">Cantidad devuelta registrada</th>
            <th rowspan="2">Devolver</th>
        `;
    }

    if (mode !== 'view' && mode !== 'edit-detail' && mode !== 'return') {
        extraHeaders += `<th rowspan="2">Acciones</th>`;
    }

    return `
        <thead>
            <tr>
                <th rowspan="2">Material</th>
                <th colspan="2">Medidas</th>
                <th rowspan="2">${ type === 'issue' ? 'Salida' : 'Compra' }</th>
                ${ suppliedQuantityHeader }
                <th rowspan="2">Presentación</th>
                <th colspan="2">Conversión</th>
                ${ extraHeaders }
            </tr>
            <tr>
                <th>Base</th>
                <th>Altura</th>
                <th>Cantidad</th>
                <th>Unidad</th>
            </tr>
        </thead>
    `;
};

export const buildDetailsColumns = ({ type, mode, render, isWarehouse, isCoordinator, isSystem }) => {

    const columns = [
        {
            data: null,
            render
        },
        { data: 'productBase' },
        { data: 'productHeight' },
        { data: 'quantity' },
        ...(type === 'issue' && (mode === 'edit-detail' || mode === 'view' || mode === 'return') ? [{ data: 'suppliedQuantity' }] : []),
        { data: 'presentationName' },
        { data: 'convertedQuantity' },
        { data: 'unitMeasureName' },
    ];

    if (shouldShowIssueProjectColumns({ type, mode, isWarehouse, isCoordinator, isSystem })) {
        columns.push(
            { data: 'maxUnitCost' },
            {
                data: 'projectConvertedQuantity',
                render: (value, _, row) => {

                    if (mode === 'view') return value ?? '';

                    const detailId = row.id || row.productId;
                    const isEditableDetail = mode === 'edit-detail' && !row.isSupplied;

                    return `
                        <input
                            type="number"
                            name="projectConvertedQuantity"
                            value="${ value ?? '' }"
                            class="form-control project-converted-quantity-input"
                            ${ isEditableDetail ? '' : 'disabled' }
                            data-detail-id="${ detailId }"
                            min=0
                        >
                        <div data-error-for="projectConvertedQuantity-${ detailId }" class="invalid-feedback d-none"></div>
                    `;
                }
            },
            { data: 'convertedQuantityDifference' }
        );
    }

    if (type === 'receipt') {
        columns.push(
            { data: 'conversionUnitCost' },
            { data: 'costPerUnitType' },
            { data: 'netPurchaseAmount' },
            { data: 'grossPurchaseAmount' }
        );
    }

    if ((type === 'issue' || type === 'receipt') && mode === 'return') {
        columns.push(
            { data: 'returnedQuantityTotal', defaultContent: 0 },
            {
                data: 'returnedQuantity',
                render: (value, _, row) => {
                    const detailId = row.id || row.productId;
                    return `
                        <input
                            type="number"
                            name="returnedQuantity"
                            value="${ value ?? '' }"
                            class="form-control return-quantity-input"
                            data-detail-id="${ detailId }"
                            min="0.01"
                            step="0.01"
                            ${ row.isReturned ? '' : 'disabled' }
                        >
                        <div data-error-for="returnedQuantity-${ detailId }" class="invalid-feedback d-none"></div>
                    `;
                }
            },
            {
                data: null,
                render: (_, __, row) => {
                    const detailId = row.id || row.productId;
                    return `
                        <input type="checkbox"
                            name="isReturned"
                            class="form-check-input return-checkbox"
                            data-detail-id="${ detailId }"
                            ${ row.isReturned ? 'checked' : '' }
                        >
                    `;
                }
            }
        );
    }

    if (type === 'issue' && mode === 'edit-detail') {
        columns.push({
            data: null,
            render: (_, __, row) => {
                
                const detailId = row.id || row.productId;
                const isEditableDetail = mode === 'edit-detail' && !row.isSupplied;

                return `
                    <input type="checkbox"
                        name="isSupplied"
                        class="form-check-input supply-checkbox"
                        data-detail-id="${ detailId }"
                        ${ row.isSupplied ? 'checked' : '' }
                        ${ isEditableDetail ? '' : 'disabled' }
                    >
                `;
            }
        });
    }

    if (mode !== 'view' && mode !== 'edit-detail' && mode !== 'return') {
        columns.push({
            data: null,
            render: (_, __, row) => {
                const isSuppliedDetail = type === 'issue' && row.isSupplied;

                return `
                    <button
                        type="button"
                        class="btn btn-danger btn-sm delete-btn"
                        data-id="${ row.productId }"
                        ${ isSuppliedDetail ? 'disabled title="El detalle ya fue surtido"' : '' }
                    >
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
            }
        });
    }

    return columns;
};
