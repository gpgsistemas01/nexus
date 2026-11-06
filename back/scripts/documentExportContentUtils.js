import { createHash } from 'node:crypto';
import path from 'node:path';

const documentTitles = new Map([
    ['almacen-materiales', 'Almacén de materiales'],
    ['almacen-consumibles', 'Almacén de consumibles'],
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
    ['compras-materiales', 'Compras de materiales'],
    ['compras-consumibles', 'Compras de consumibles'],
    ['informacion-general-y-anexos', 'Información general y anexos'],
    ['movimientos-materiales', 'Movimientos de materiales'],
    ['movimientos-consumibles', 'Movimientos de consumibles'],
    ['movimientos-mermas', 'Movimientos de mermas'],
    ['personas', 'Personas'],
    ['proveedores', 'Proveedores'],
    ['salidas-materiales', 'Salidas de materiales'],
    ['salidas-consumibles', 'Salidas de consumibles'],
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

const documentDataPattern = /^## Datos generales del documento\r?\n\r?\n(?:\|[^\r\n]+\|\r?\n){3}/m;

export const exportedDocumentTitle = (output) => {
    const name = path.basename(output, path.extname(output));
    if (documentTitles.has(name)) return documentTitles.get(name);
    const words = name.split('-').map((word) => documentTitleWords.get(word) ?? word);
    return `${words[0][0].toUpperCase()}${words[0].slice(1)} ${words.slice(1).join(' ')}`.trim();
};

export const documentExportAnchor = (source, fragment) => {
    const destination = [source.replace(/\.md$/, ''), fragment].filter(Boolean).join('#');
    const identifier = createHash('sha256').update(destination).digest('hex').slice(0, 32);
    return `nexus_${identifier}`;
};

export const prepareSectionEntry = (content, title) => {
    const documentData = content.match(documentDataPattern);
    if (!documentData) throw new Error('La entrada temática no contiene datos generales del documento.');

    return `# ${title}\n\n${documentData[0].replace(/\r\n/g, '\n').trimEnd()}\n`;
};

export const prepareManualEntry = (content, output) => {
    if (!output.startsWith(`manuales${path.sep}`)
        || path.basename(output, path.extname(output)) === 'informacion-general-y-anexos') {
        return content;
    }

    const title = exportedDocumentTitle(output);
    const documentData = content.match(documentDataPattern);
    if (!documentData) return content;

    const end = documentData.index + documentData[0].length;
    return content.slice(0, end)
        .replace(/^(title:\s*)(.+)$/m, `$1$2 — ${title}`)
        .replace(/^(# .+)$/m, `$1 — ${title}`)
        .replace(/\s*$/, '\n');
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

export const externalDocumentAnchorFragment = ({ fragment, targetContent }) => {
    if (!fragment) return null;
    const sectionTitle = getHeadingTitle(targetContent, fragment);
    return sectionTitle ? headingFragment(sectionTitle) : fragment;
};

export const externalDocumentLinkLabel = ({ linkedOutput, fragment, targetContent }) => {
    const documentTitle = exportedDocumentTitle(linkedOutput);
    const sectionTitle = fragment ? getHeadingTitle(targetContent, fragment) : null;
    return sectionTitle ? `${sectionTitle} — ${documentTitle}` : documentTitle;
};

export const prepareManualImages = (content, directory) => {
    const actor = directory.split(path.sep).at(-1);
    if (!directory.startsWith(`manuales${path.sep}`)) return content;
    const area = actor === 'administrador' ? 'sistemas' : actor === 'almacen' ? 'almacen' : null;
    if (!area) throw new Error(`Actor del manual sin área de capturas: ${actor}.`);

    return content.replace(/(!\[[^\]]*\]\()(\.\.\/)*images\/(?:areas\/[^/]+\/)?([^) ]+)/g,
        (reference, prefix) => {
            const imagePath = reference.slice(prefix.length).replace(/^((?:\.\.\/)*images\/)(?:areas\/[^/]+\/)?/, `$1areas/${area}/`);
            return `${prefix}${imagePath}`;
        });
};

const markdownCode = /(^(`{3,}|~{3,})[^\r\n]*\r?\n[\s\S]*?^\2[ \t]*$)|(`+)([\s\S]*?)\3/gm;

export const getMarkdownProse = content => content.replace(markdownCode, '');

export const mapMarkdownProse = (content, transform) => {
    let offset = 0;
    let result = '';
    for (const match of content.matchAll(markdownCode)) {
        result += transform(content.slice(offset, match.index)) + match[0];
        offset = match.index + match[0].length;
    }
    return result + transform(content.slice(offset));
};
