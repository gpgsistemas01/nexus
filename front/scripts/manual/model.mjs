import { PUBLIC_CATALOGS } from '../../../back/src/shared/constants/catalogs.js';
import { PERMISSIONS as P } from '../../../back/src/shared/constants/permissions.js';

const chapter = (file, title, any = [], section = 'tasks') => ({ file, title, any, section });

export const MANUAL_SECTIONS = [
    { id: 'start', title: 'Para empezar' },
    { id: 'tasks', title: 'Sus tareas' },
    { id: 'help', title: 'Ayuda y consulta' },
];

export const MANUAL_CHAPTERS = [
    chapter('00-induction.md', 'Primera jornada: recorrido de inducción', [], 'start'),
    chapter('01-access.md', 'Acceso y sesión', [], 'start'),
    chapter('02-navigation-and-controls.md', 'Navegación y controles', [], 'start'),
    chapter('03-materials.md', 'Materiales', [P.MATERIALS_READ]),
    chapter('04-consumables.md', 'Consumibles', [P.MATERIALS_READ]),
    chapter('05-wastes.md', 'Mermas', [P.WASTES_PAGE_VIEW]),
    chapter('06-catalogs.md', 'Catálogos', [P.CATALOGS_MANAGE]),
    chapter('07-persons.md', 'Personas', [P.PERSONS_PAGE_VIEW]),
    chapter('08-users.md', 'Usuarios', [P.USERS_MANAGE]),
    chapter('09-clients.md', 'Clientes', [P.CLIENTS_PAGE_VIEW, P.CLIENTS_CREATE]),
    chapter('10-suppliers.md', 'Proveedores', [P.SUPPLIERS_PAGE_VIEW, P.SUPPLIERS_MANAGE]),
    chapter('11-purchases.md', 'Compras', [P.GOODS_RECEIPTS_PAGE_VIEW]),
    chapter('12-issues.md', 'Salidas', [P.GOODS_ISSUES_PAGE_VIEW, P.WASTE_ISSUES_PAGE_VIEW]),
    chapter('13-movements.md', 'Movimientos', [P.MOVEMENTS_READ]),
    chapter('14-reports.md', 'Reportes', [
        P.WAREHOUSE_REPORTS_READ,
        P.ADMIN_REPORTS_READ,
        P.PERSON_REPORTS_READ,
        P.CLIENT_REPORTS_READ,
        P.SUPPLIER_REPORTS_READ,
    ]),
    chapter('15-errors-and-recovery.md', 'Errores y recuperación', [], 'help'),
    chapter('16-glossary.md', 'Glosario para trabajar en Nexus', [], 'help'),
];

export const permits = (permissions, any = []) =>
    !any.length || any.some((permission) => permissions.includes(permission));
export const selectedChapters = (permissions) =>
    MANUAL_CHAPTERS.filter(({ any }) => permits(permissions, any));

/** Conditional prose is curated, but uses the same permission identifiers as Vue. */
const filterConditionalContent = (content, prefix, known, permitsTag) => {
    const stack = [true];
    const result = [];
    for (const [lineIndex, line] of content.split(/\r?\n/).entries()) {
        const open = new RegExp(`^<!-- ${prefix}:(any|all) ([a-z0-9: -]+) -->$`).exec(line);
        if (open) {
            const required = open[2].split(' ');
            if (required.some((permission) => !known.has(permission)))
                throw new Error(
                    `El manual contiene un ${prefix === 'manual' ? 'permiso' : 'contexto'} desconocido (línea ${lineIndex + 1}).`,
                );
            const allowed =
                open[1] === 'any' ? required.some(permitsTag) : required.every(permitsTag);
            stack.push(stack.at(-1) && allowed);
        } else if (line === `<!-- ${prefix}:end -->`) {
            if (stack.length === 1)
                throw new Error(
                    `Cierre condicional de manual sin apertura (línea ${lineIndex + 1}).`,
                );
            stack.pop();
        } else {
            if (line.includes(`<!-- ${prefix}:`))
                throw new Error(`Directiva de manual inválida (línea ${lineIndex + 1}).`);
            if (stack.at(-1)) result.push(line);
        }
    }
    if (stack.length !== 1) throw new Error('Bloque condicional de manual sin cerrar.');
    return result.join('\n').replace(/\n{3,}/g, '\n\n');
};

export const filterManualContent = (content, permissions) =>
    filterConditionalContent(content, 'manual', new Set(Object.values(P)), (tag) =>
        permissions.includes(tag),
    );

const moduleDefinition = (id, title, chapter, any, tags, reportPermission) => ({
    id,
    title,
    chapter,
    any,
    tags: [id, ...tags],
    reportPermission,
});
export const MANUAL_MODULES = [
    moduleDefinition('inicio', 'Acceso, navegación y recuperación', null, [], ['common']),
    ...[
        ['materiales', 'Materiales', '03-materials.md', P.MATERIALS_READ, 'materials'],
        ['consumibles', 'Consumibles', '04-consumables.md', P.MATERIALS_READ, 'consumables'],
        ['mermas', 'Mermas', '05-wastes.md', P.WASTES_PAGE_VIEW, 'wastes'],
    ].map(([id, title, chapter, permission, resource]) =>
        moduleDefinition(
            `almacen-${id}`,
            `Almacén — ${title}`,
            chapter,
            [permission],
            ['common', 'warehouse', 'inventory', resource],
            P.WAREHOUSE_REPORTS_READ,
        ),
    ),
    ...['materiales', 'consumibles'].map((resource, index) =>
        moduleDefinition(
            `compras-${resource}`,
            `Compras — ${index ? 'Consumibles' : 'Materiales'}`,
            '11-purchases.md',
            [P.GOODS_RECEIPTS_PAGE_VIEW],
            ['common', 'documents', 'inventory', 'purchases', index ? 'consumables' : 'materials'],
            P.WAREHOUSE_REPORTS_READ,
        ),
    ),
    ...['materiales', 'consumibles', 'mermas'].flatMap((resource, index) => {
        const label = ['Materiales', 'Consumibles', 'Mermas'][index];
        const tag = ['materials', 'consumables', 'wastes'][index];
        return [
            moduleDefinition(
                `salidas-${resource}`,
                `Salidas — ${label}`,
                '12-issues.md',
                [index === 2 ? P.WASTE_ISSUES_PAGE_VIEW : P.GOODS_ISSUES_PAGE_VIEW],
                ['common', 'documents', 'inventory', 'issues', tag],
                P.WAREHOUSE_REPORTS_READ,
            ),
            moduleDefinition(
                `movimientos-${resource}`,
                `Movimientos — ${label}`,
                '13-movements.md',
                [P.MOVEMENTS_READ],
                ['common', 'inventory', 'movements', tag],
                P.ADMIN_REPORTS_READ,
            ),
        ];
    }),
    ...Object.entries(PUBLIC_CATALOGS).map(([key, definition]) =>
        moduleDefinition(
            `catalogos-${key}`,
            `Catálogos — ${definition.label}`,
            '06-catalogs.md',
            [P.CATALOGS_MANAGE],
            ['common', 'catalogs', `catalog-${key}`],
        ),
    ),
    moduleDefinition(
        'personas',
        'Personas',
        '07-persons.md',
        [P.PERSONS_PAGE_VIEW],
        ['common', 'persons'],
        P.PERSON_REPORTS_READ,
    ),
    moduleDefinition('usuarios', 'Usuarios', '08-users.md', [P.USERS_MANAGE], ['common', 'users']),
    moduleDefinition(
        'clientes',
        'Clientes',
        '09-clients.md',
        [P.CLIENTS_PAGE_VIEW, P.CLIENTS_CREATE],
        ['common', 'clients'],
        P.CLIENT_REPORTS_READ,
    ),
    moduleDefinition(
        'proveedores',
        'Proveedores',
        '10-suppliers.md',
        [P.SUPPLIERS_PAGE_VIEW, P.SUPPLIERS_MANAGE],
        ['common', 'suppliers'],
        P.SUPPLIER_REPORTS_READ,
    ),
];
export const selectedManualModules = (permissions) =>
    MANUAL_MODULES.filter(({ any }) => permits(permissions, any));
const moduleTags = new Set([
    'reference',
    'report',
    'import',
    ...MANUAL_MODULES.flatMap(({ tags }) => tags),
]);
export const filterManualModule = (content, module) =>
    filterConditionalContent(content, 'module', moduleTags, (tag) => module.tags.includes(tag));

export const imageReferences = (content) =>
    [...content.matchAll(/!\[[^\]\r\n]*\]\(([^)\r\n]+)\)/g)].map((match) => match[1]);

export const imageNames = (content) =>
    imageReferences(content).flatMap((reference) => {
        const match = /^(?:\.\.\/)?images\/([a-z0-9-]+\.png)$/.exec(reference);
        return match ? [match[1]] : [];
    });

export const MANUAL_REFERENCE_CONTEXT = {
    tags: [...moduleTags].filter((tag) => !MANUAL_MODULES.some((module) => module.id === tag)),
};

export const MANUAL_MODULE_EDITION_VERSION = 1;
