import { PERMISSIONS as P } from '../../../back/src/shared/constants/permissions.js';

const chapter = (file, title, any = []) => ({ file, title, any });
export const MANUAL_CHAPTERS = [
    chapter('00-induction.md', 'Primera jornada: recorrido de inducción'),
    chapter('01-access.md', 'Acceso y sesión'),
    chapter('02-navigation-and-controls.md', 'Navegación y controles'),
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
    chapter('15-errors-and-recovery.md', 'Errores y recuperación'),
    chapter('16-glossary.md', 'Glosario para trabajar en Nexus'),
];

export const permits = (permissions, any = []) =>
    !any.length || any.some((permission) => permissions.includes(permission));
export const selectedChapters = (permissions) =>
    MANUAL_CHAPTERS.filter(({ any }) => permits(permissions, any));

/** Conditional prose is curated, but uses the same permission identifiers as Vue. */
export const filterManualContent = (content, permissions) => {
    const known = new Set(Object.values(P));
    const stack = [true];
    const result = [];
    for (const line of content.split('\n')) {
        const open = /^<!-- manual:(any|all) ([a-z0-9: -]+) -->$/.exec(line);
        if (open) {
            const required = open[2].split(' ');
            if (required.some((permission) => !known.has(permission)))
                throw new Error('El manual contiene un permiso desconocido.');
            const allowed =
                open[1] === 'any'
                    ? permits(permissions, required)
                    : required.every((permission) => permissions.includes(permission));
            stack.push(stack.at(-1) && allowed);
        } else if (line === '<!-- manual:end -->') {
            if (stack.length === 1) throw new Error('Cierre condicional de manual sin apertura.');
            stack.pop();
        } else {
            if (line.includes('<!-- manual:')) throw new Error('Directiva de manual inválida.');
            if (stack.at(-1)) result.push(line);
        }
    }
    if (stack.length !== 1) throw new Error('Bloque condicional de manual sin cerrar.');
    return result.join('\n').replace(/\n{3,}/g, '\n\n');
};

export const imageNames = (content) =>
    [...content.matchAll(/!\[[^\]]+\]\(images\/([a-z0-9-]+\.png)\)/g)].map((match) => match[1]);
