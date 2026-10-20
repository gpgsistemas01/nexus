const authenticationCases = ['index.md', '01-cap-aut-01-login.md', '02-cap-aut-02-menu.md', '03-cap-err-404-not-found.md']
    .map(name => `docs/user-manual/cases/authentication/${name}`);
const manualOverview = 'docs/user-manual/overview.md';
const manualProcedures = 'docs/user-manual/procedures.md';
const manualErrorCatalog = 'docs/user-manual/error-messages.md';
const manualValidationMatrix = 'docs/user-manual/form-validation-matrix.md';
const manualPart = (actor, cases) => [
    actor,
    ...cases
];
const manualAdditionalPart = (actor) => [
    actor,
    manualOverview,
    manualProcedures,
    manualValidationMatrix,
    manualErrorCatalog
];
const manualCaseFiles = (group, names) => names.map((name) => (
    `docs/user-manual/cases/${group}/${name}`
));
const administrator = 'docs/user-manual/actors/administrator.md';
const warehouse = 'docs/user-manual/actors/warehouse.md';
const manualDefinitions = {
    'manual-administrador': {
        directory: 'manuales/administrador',
        parts: {
            'informacion-general-y-anexos': manualAdditionalPart(administrator),
            autenticacion: manualPart(administrator, authenticationCases),
            'movimientos-materiales': manualPart(administrator, manualCaseFiles('reports', [
                '01-cap-rep-mov-mat-01-list.md',
                '02-cap-rep-mov-mat-02-export.md'
            ])),
            'movimientos-consumibles': manualPart(administrator, manualCaseFiles('reports', [
                '05-cap-rep-mov-con-01-list.md',
                '06-cap-rep-mov-con-02-export.md'
            ])),
            'movimientos-mermas': manualPart(administrator, manualCaseFiles('reports', [
                '03-cap-rep-mov-was-01-list.md',
                '04-cap-rep-mov-was-02-export.md'
            ])),
            usuarios: manualPart(administrator, manualCaseFiles('identity-access', [
                '04-cap-ida-usr-01-list.md',
                '05-cap-ida-usr-02-create.md',
                '06-cap-ida-usr-03-edit.md',
                '07-cap-ida-usr-04-password.md'
            ])),
            'catalogo-areas': manualPart(administrator, manualCaseFiles('catalogs', [
                '01-catalog-areas.md'
            ])),
            'catalogo-roles': manualPart(administrator, manualCaseFiles('catalogs', [
                '01-catalog-roles.md'
            ])),
            'catalogo-presentaciones': manualPart(administrator, manualCaseFiles('catalogs', [
                '01-catalog-presentations.md'
            ])),
            'catalogo-unidades-medida': manualPart(administrator, manualCaseFiles('catalogs', [
                '01-catalog-unit-measures.md'
            ])),
            'catalogo-motivos-ajuste': manualPart(administrator, manualCaseFiles('catalogs', [
                '01-catalog-adjustment-reasons.md'
            ])),
            'catalogo-estados-cumplimiento': manualPart(administrator, manualCaseFiles('catalogs', [
                '01-catalog-fulfillment-statuses.md'
            ])),
            personas: manualPart(administrator, manualCaseFiles('identity-access', [
                '01-cap-ida-per-01-list.md',
                '02-cap-ida-per-02-create.md',
                '03-cap-ida-per-03-edit.md'
            ])),
            clientes: manualPart(administrator, manualCaseFiles('catalogs', [
                '10-cap-cat-cli-01-list.md',
                '11-cap-cat-cli-02-create.md',
                '12-cap-cat-cli-03-edit.md'
            ])),
            proveedores: manualPart(administrator, manualCaseFiles('catalogs', [
                '07-cap-cat-sup-01-list.md',
                '08-cap-cat-sup-02-create.md',
                '09-cap-cat-sup-03-edit.md'
            ]))
        }
    },
    'manual-almacen': {
        directory: 'manuales/almacen',
        parts: {
            'informacion-general-y-anexos': manualAdditionalPart(warehouse),
            autenticacion: manualPart(warehouse, authenticationCases),
            'almacen-materiales': manualPart(warehouse, manualCaseFiles('catalogs', [
                '02-cap-cat-mat-01-list.md',
                '03-cap-cat-mat-02-create.md',
                '04-cap-cat-mat-03-edit.md',
                '06-cap-rep-mat-05-export.md'
            ])),
            'almacen-consumibles': manualPart(warehouse, manualCaseFiles('catalogs', [
                '19-cap-cat-con-01-list.md',
                '20-cap-cat-con-02-create.md',
                '21-cap-cat-con-03-edit.md',
                '22-cap-cat-con-04-remove.md',
                '24-cap-rep-con-06-export.md'
            ])),
            'almacen-mermas': manualPart(warehouse, manualCaseFiles('catalogs', [
                '13-cap-cat-was-01-list.md',
                '14-cap-cat-was-02-create.md',
                '15-cap-cat-was-03-edit.md',
                '17-cap-cat-was-05-add-stock.md',
                '18-cap-rep-was-05-export.md'
            ])),
            'compras-materiales': manualPart(warehouse, manualCaseFiles('purchases', [
                '01-cap-ent-01-list.md', '02-cap-ent-02-create.md', '03-cap-ent-03-edit.md',
                '04-cap-ent-04-correct.md', '05-cap-rep-ent-05-export.md', '06-cap-ent-06-view.md'
            ])),
            'compras-consumibles': manualPart(warehouse, manualCaseFiles('purchases', [
                '07-cap-ent-con-01-list.md', '08-cap-ent-con-02-create.md', '09-cap-ent-con-03-edit.md',
                '10-cap-ent-con-04-correct.md', '11-cap-ent-con-05-cancel.md', '12-cap-rep-ent-con-06-export.md'
            ])),
            'salidas-materiales': manualPart(warehouse, [
                ...manualCaseFiles('issues', [
                    '01-cap-sal-mat-01-list.md',
                    '02-cap-sal-mat-02-create.md',
                    '03-cap-sal-mat-03-edit.md',
                    '04-cap-sal-mat-04-supply.md',
                    '05-cap-sal-mat-05-return.md',
                    '06-cap-rep-sal-mat-06-export.md',
                    '07-cap-sal-mat-08-view.md'
                ]),
                ...manualCaseFiles('catalogs', ['11-cap-cat-cli-02-create.md'])
            ]),
            'salidas-consumibles': manualPart(warehouse, manualCaseFiles('issues', [
                '15-cap-sal-con-01-walkthrough.md'
            ])),
            'salidas-mermas': manualPart(warehouse, [
                ...manualCaseFiles('issues', [
                    '08-cap-sal-was-01-list.md',
                    '09-cap-sal-was-02-create.md',
                    '10-cap-sal-was-03-edit.md',
                    '11-cap-sal-was-04-supply.md',
                    '12-cap-sal-was-05-return.md',
                    '13-cap-rep-sal-was-06-export.md',
                    '14-cap-sal-was-08-view.md'
                ]),
                ...manualCaseFiles('catalogs', ['11-cap-cat-cli-02-create.md'])
            ])
        }
    }
};

for (const [module, sources] of Object.entries(manualDefinitions['manual-almacen'].parts)) {
    if (module === 'informacion-general-y-anexos' || module === 'autenticacion') continue;
    manualDefinitions['manual-administrador'].parts[module] = [administrator, ...sources.slice(1)];
}
for (const module of ['personas', 'clientes', 'proveedores']) {
    const sources = manualDefinitions['manual-administrador'].parts[module];
    const allowedSources = sources.slice(1).filter(source => !/-(?:cli|sup)-03-edit\.md$/.test(source));
    manualDefinitions['manual-almacen'].parts[module] = [warehouse, ...allowedSources];
}
for (const [module, source] of [
    ['almacen-materiales', '05-cap-cat-mat-04-stock.md'],
    ['almacen-consumibles', '23-cap-cat-con-05-stock.md'],
    ['almacen-mermas', '16-cap-cat-was-04-stock.md']
]) {
    const sources = manualDefinitions['manual-administrador'].parts[module];
    sources.splice(sources.length - 1, 0, ...manualCaseFiles('catalogs', [source]));
}

export const MANUALS = Object.freeze(manualDefinitions);
