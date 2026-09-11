const CATALOG_PAGES = Object.freeze({
    roles: { title: 'Roles', apiRoute: '/api/admin/roles', fields: [{ name: 'name', label: 'Nombre' }] },
    departments: { title: 'Departamentos', apiRoute: '/api/admin/departments', fields: [{ name: 'name', label: 'Nombre' }] },
    statuses: { title: 'Estados operativos', apiRoute: '/api/admin/statuses', fields: [{ name: 'name', label: 'Nombre' }] },
    presentations: { title: 'Presentaciones', apiRoute: '/api/warehouse/presentations', fields: [{ name: 'name', label: 'Nombre' }] },
    'unit-measures': {
        title: 'Unidades de medida',
        apiRoute: '/api/warehouse/unit-measures',
        fields: [{ name: 'name', label: 'Nombre' }, { name: 'symbol', label: 'Símbolo' }]
    },
    reasons: {
        title: 'Motivos de ajuste',
        apiRoute: '/api/warehouse/reasons',
        fields: [{ name: 'name', label: 'Nombre' }, { name: 'isActive', label: 'Activo', type: 'checkbox' }]
    },
    'fulfillment-statuses': {
        title: 'Estados de surtido',
        apiRoute: '/api/warehouse/fulfillment-statuses',
        fields: [{ name: 'name', label: 'Nombre' }]
    }
});

export const getCatalogPage = (req, res) => {
    const config = CATALOG_PAGES[req.params.catalog];

    if (!config) return res.sendStatus(404);

    const currentRoute = `/catalogos/${ req.params.catalog }`;

    return res.render('pages/admin/catalogs/catalogPage', {
        config,
        catalogConfigJson: JSON.stringify(config).replaceAll('<', '\\u003c'),
        currentRoute,
        user: req.user
    });
};
