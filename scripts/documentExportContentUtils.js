import path from 'node:path';

const documentTitles = new Map([
    ['almacen-materiales', 'Almacén de materiales'],
    ['almacen-mermas', 'Almacén de mermas'],
    ['autenticacion', 'Autenticación'],
    ['catalogo-areas', 'Catálogo de áreas'],
    ['catalogo-estados-cumplimiento', 'Catálogo de estados de cumplimiento'],
    ['catalogo-motivos-ajuste', 'Catálogo de motivos de ajuste'],
    ['catalogo-presentaciones', 'Catálogo de presentaciones'],
    ['catalogo-roles', 'Catálogo de roles'],
    ['catalogo-unidades-medida', 'Catálogo de unidades de medida'],
    ['clientes', 'Clientes'],
    ['compras', 'Compras'],
    ['informacion-general-y-anexos', 'Información general y anexos'],
    ['movimientos-materiales', 'Movimientos de materiales'],
    ['movimientos-mermas', 'Movimientos de mermas'],
    ['personas', 'Personas'],
    ['proveedores', 'Proveedores'],
    ['salidas-materiales', 'Salidas de materiales'],
    ['salidas-mermas', 'Salidas de mermas'],
    ['usuarios', 'Usuarios']
]);

const documentTitleWords = new Map([
    ['almacen', 'almacén'],
    ['areas', 'áreas'],
    ['autenticacion', 'autenticación'],
    ['catalogo', 'catálogo'],
    ['codigo', 'código'],
    ['construccion', 'construcción'],
    ['descripcion', 'descripción'],
    ['documentacion', 'documentación'],
    ['especificacion', 'especificación'],
    ['estandar', 'estándar'],
    ['informacion', 'información'],
    ['navegacion', 'navegación'],
    ['realizacion', 'realización'],
    ['tecnico', 'técnico'],
    ['tecnica', 'técnica'],
    ['vision', 'visión']
]);

const cleanHeadingTitle = (title) => title
    .replace(/\s+\{#[^}]+\}\s*$/, '')
    .replace(/[`*_\[\]]/g, '')
    .trim();

const headingFragment = (title) => cleanHeadingTitle(title)
    .toLowerCase()
    .replace(/[^\p{L}\p{N} _-]/gu, '')
    .trim()
    .replace(/[ _]/g, '-');

export const exportedDocumentTitle = (output) => {
    const name = path.basename(output, path.extname(output));
    if (documentTitles.has(name)) return documentTitles.get(name);
    const words = name.split('-').map((word) => documentTitleWords.get(word) ?? word);
    return `${words[0][0].toUpperCase()}${words[0].slice(1)} ${words.slice(1).join(' ')}`.trim();
};

export const getHeadingTitle = (content, fragment) => {
    const decodedFragment = decodeURIComponent(fragment);
    const headings = [...content.matchAll(/^#{1,6}\s+(.+)$/gm)];
    const implicitHeading = headings.find((match) => headingFragment(match[1]) === decodedFragment);
    if (implicitHeading) return cleanHeadingTitle(implicitHeading[1]);

    const explicitHeading = [...content.matchAll(
        /^<a id="([^"]+)"><\/a>\r?\n#{1,6}\s+(.+)$/gm
    )].find((match) => match[1] === decodedFragment);
    return explicitHeading ? cleanHeadingTitle(explicitHeading[2]) : null;
};

export const externalDocumentLinkLabel = ({ label, linkedOutput, fragment, targetContent }) => {
    const documentTitle = exportedDocumentTitle(linkedOutput);
    const sectionTitle = fragment ? getHeadingTitle(targetContent, fragment) : null;
    const destination = sectionTitle
        ? `sección «${sectionTitle}» del documento «${documentTitle}»`
        : `documento «${documentTitle}»`;
    return `${label} — ${destination}`;
};
