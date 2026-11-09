import { readFile, writeFile, mkdir, access, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import {
    MANUAL_SECTIONS,
    selectedChapters,
    filterManualContent,
    imageNames,
    imageReferences,
} from './model.mjs';
import { validProfileId } from './profiles.mjs';
import { prepareManualDirectory } from './paths.mjs';
import { DATA_SCOPES, hasDataScope } from '../../../back/src/constants/permissions.js';
import { isUnavailableExample } from './documentCaptures.mjs';

export const permissionFingerprint = (permissions) =>
    createHash('sha256')
        .update([...new Set(permissions)].sort().join('\n'))
        .digest('hex');

export const recoverManualCaptures = (previous, revision, images) => {
    if (previous?.revision !== revision) return {};

    return Object.fromEntries(
        images
            .filter(
                (image) =>
                    previous.captures?.[image]?.status === 'complete' ||
                    isUnavailableExample(image, previous.captures?.[image], previous.mode),
            )
            .map((image) => [image, { ...previous.captures[image] }]),
    );
};

export const accessFingerprint = (session) =>
    createHash('sha256')
        .update(
            JSON.stringify({
                id: session.id,
                name: session.name ?? null,
                permissions: [...session.permissions].sort(),
                accesses: (session.accesses ?? [])
                    .map(({ roleKey, departmentKey, departmentId }) => ({
                        roleKey,
                        departmentKey,
                        departmentId,
                    }))
                    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
                scope: session.scope ?? null,
            }),
        )
        .digest('hex');

const manualText = (value) =>
    String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('\\', '\\\\')
        .replace(/[|[\]!*_`#]/g, (character) => '\\' + character)
        .replace(/\s+/g, ' ');

const removeUnselectedFiles = async (directory, selected, extension) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith(extension) && !selected.has(entry.name))
            await rm(path.join(directory, entry.name));
    }
};

const manualContents = (chapters) => {
    const lessons = chapters.map((chapter, index) => ({ ...chapter, number: index + 1 }));
    return MANUAL_SECTIONS.map(({ id, title }) => {
        const selected = lessons.filter((chapter) => chapter.section === id);
        if (!selected.length) return '';
        return `## ${title}\n\n| Orden | Lección |\n| --- | --- |\n${selected
            .map(({ number, title: label, file }) => `| ${number} | [${label}](${file}) |`)
            .join('\n')}\n`;
    })
        .filter(Boolean)
        .join('\n');
};

const readManualChapters = async (frontRoot, permissions) =>
    Promise.all(
        selectedChapters(permissions).map(async (chapter) => {
            const source = await readFile(
                path.join(frontRoot, 'docs/user-manual', chapter.file),
                'utf8',
            );
            try {
                return { ...chapter, content: filterManualContent(source, permissions) };
            } catch (cause) {
                throw new Error(`No se pudo preparar ${chapter.file}: ${cause.message}`, { cause });
            }
        }),
    );

export const prepareManual = async (frontRoot, profile, session) => {
    if (
        !validProfileId(profile.id) ||
        !Array.isArray(session.permissions) ||
        !session.permissions.every((p) => typeof p === 'string')
    )
        throw new Error('Perfil o permisos de sesión inválidos.');
    const root = await prepareManualDirectory(frontRoot, profile.id);
    await mkdir(path.join(root, 'images'), { recursive: true });
    const chapters = await readManualChapters(frontRoot, session.permissions);
    const files = new Set(['index.md', ...chapters.map(({ file }) => file)]);
    const sources = [];
    const images = new Set();
    for (const [chapterIndex, chapter] of chapters.entries()) {
        let content = chapter.content.replace(
            /^# [^\r\n]+/,
            `# ${chapterIndex + 1}. ${chapter.title}`,
        );
        for (const name of imageNames(content)) images.add(name);
        content = content.replace(/\]\(images\//g, '](../images/');
        content = content.replace(
            /(?<!!)\[([^\]]+)\]\(([a-z0-9-]+\.md)(#[^)]*)?\)/g,
            (link, label, filename) => (files.has(filename) ? link : label),
        );
        sources.push({ file: chapter.file, content });
    }
    const scope = !chapters.some((chapter) => chapter.file === '12-issues.md')
        ? ''
        : hasDataScope(session.accesses ?? [], DATA_SCOPES.ISSUES_ALL_DEPARTMENTS)
          ? 'Puede consultar las salidas de todas las áreas.'
          : 'Sólo puede consultar las salidas de las áreas asignadas a su cuenta.';
    const accessRows = [
        ...new Set(
            (session.accesses ?? []).map(
                (access) =>
                    '| ' +
                    manualText(access.department ?? access.departmentKey) +
                    ' | ' +
                    manualText(access.role ?? access.roleKey) +
                    ' |',
            ),
        ),
    ].sort();
    const detectedAccess = accessRows.length
        ? '## Su cuenta\n\n| Área | Rol |\n| --- | --- |\n' + accessRows.join('\n') + '\n'
        : '';
    const accountName =
        typeof session.name === 'string' && session.name.trim() ? session.name : profile.label;
    const title = `Manual de Nexus — ${manualText(accountName)}`;
    const documentDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Mexico_City',
    }).format(new Date());
    const index = `# ${title}\n\n## Datos generales del documento\n\n| Versión documental | Versión del sistema | Estado | Fecha | Responsable |\n| --- | --- | --- | --- | --- |\n| 1.3 | 1.0.0 | En revisión | ${documentDate} | Equipo Nexus |\n\n${detectedAccess}\n${scope}\n\nEsta guía reúne las tareas disponibles para su cuenta. Empiece por Primera jornada y continúe con la tarea que necesita.\n\n${profile.mode === 'demo' ? 'Las imágenes muestran ejemplos con datos ficticios.\n\n' : ''}${manualContents(chapters)}\nSi aparece un mensaje, consulte [Errores y recuperación](15-errors-and-recovery.md). Si cambia su acceso, solicite un manual actualizado.\n`;
    await mkdir(path.join(root, 'sources'), { recursive: true });
    await removeUnselectedFiles(path.join(root, 'sources'), files, '.md');
    await removeUnselectedFiles(path.join(root, 'images'), images, '.png');
    await writeFile(path.join(root, 'sources/index.md'), index);
    for (const source of sources)
        await writeFile(path.join(root, 'sources', source.file), source.content);
    return {
        root,
        id: profile.id,
        label: profile.label,
        mode: profile.mode,
        permissions: [...session.permissions].sort(),
        fingerprint: permissionFingerprint(session.permissions),
        accessFingerprint: accessFingerprint(session),
        sources: ['index.md', ...sources.map(({ file }) => file)],
        images: [...images].sort((left, right) =>
            left.localeCompare(right, 'en', { numeric: true }),
        ),
        status: 'pending',
    };
};

export const finalizeManualSources = async (manifest, captures) => {
    const unavailable = new Set(
        manifest.images.filter((image) =>
            isUnavailableExample(image, captures[image], manifest.mode),
        ),
    );
    if (!unavailable.size) return;
    for (const filename of manifest.sources) {
        const source = path.join(manifest.root, 'sources', filename);
        const content = await readFile(source, 'utf8');
        await writeFile(
            source,
            content.replace(
                /^!\[[^\r\n]+\]\(\.\.\/images\/([a-z0-9-]+\.png)\)[ \t]*\r?\n?/gm,
                (line, image) => (unavailable.has(image) ? '' : line),
            ),
        );
    }
};

export const loadManualPublication = async (frontRoot, id, { mode } = {}) => {
    if (!validProfileId(id)) throw new Error('Identificador de manual inválido.');
    const root = await prepareManualDirectory(frontRoot, id);
    const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
    if (mode !== undefined && manifest.mode !== mode)
        throw new Error(`Las capturas de ${id} no corresponden al modo ${mode}.`);
    if (
        manifest.id !== id ||
        manifest.status !== 'ready' ||
        !manifest.sources?.length ||
        manifest.sources[0] !== 'index.md'
    )
        throw new Error(`El manual ${id} no está completo; revise las capturas pendientes.`);
    if (
        !Array.isArray(manifest.permissions) ||
        !manifest.permissions.every((permission) => typeof permission === 'string') ||
        manifest.fingerprint !== permissionFingerprint(manifest.permissions) ||
        !Array.isArray(manifest.images)
    )
        throw new Error(`La selección del manual ${id} debe volver a generarse con esa cuenta.`);
    const chapters = await readManualChapters(frontRoot, manifest.permissions);
    const allowedSources = new Set(['index.md', ...chapters.map(({ file }) => file)]);
    const allowedImages = new Set(chapters.flatMap(({ content }) => imageNames(content)));
    const selectedImages = new Set(manifest.images);
    for (const image of selectedImages) {
        if (typeof image !== 'string' || !/^[a-z0-9-]+\.png$/.test(image))
            throw new Error('Imagen de manual inválida.');
        if (!allowedImages.has(image))
            throw new Error(`La imagen ${image} no corresponde al acceso de la cuenta ${id}.`);
    }
    const sources = [];
    const referencedImages = new Set();
    for (const filename of manifest.sources) {
        if (!/^[a-z0-9-]+\.md$/.test(filename)) throw new Error('Fuente de manual inválida.');
        if (!allowedSources.has(filename))
            throw new Error(`El capítulo ${filename} no corresponde al acceso de la cuenta ${id}.`);
        const source = path.join(root, 'sources', filename);
        await access(source);
        for (const reference of imageReferences(await readFile(source, 'utf8'))) {
            const match = /^\.\.\/images\/([a-z0-9-]+\.png)$/.exec(reference);
            if (!match)
                throw new Error(`El manual ${id} sólo admite imágenes de su propia carpeta.`);
            const image = match[1];
            if (!selectedImages.has(image))
                throw new Error(
                    `La imagen ${image} no pertenece a las capturas de la cuenta ${id}.`,
                );
            referencedImages.add(image);
        }
        sources.push(
            path.relative(path.resolve(frontRoot, '../back'), source).split(path.sep).join('/'),
        );
    }
    const selectedSources = new Set(manifest.sources);
    if (
        selectedSources.size !== manifest.sources.length ||
        selectedSources.size !== allowedSources.size ||
        [...allowedSources].some((source) => !selectedSources.has(source))
    )
        throw new Error(
            `La selección de capítulos de ${id} está incompleta o repetida; regenere el manual.`,
        );
    if (
        selectedImages.size !== manifest.images.length ||
        selectedImages.size !== allowedImages.size ||
        [...allowedImages].some((image) => !selectedImages.has(image))
    )
        throw new Error(
            `La selección de capturas de ${id} está incompleta o repetida; regenere el manual.`,
        );
    for (const image of manifest.images) {
        if (!/^[a-z0-9-]+\.png$/.test(image)) throw new Error('Imagen de manual inválida.');
        if (isUnavailableExample(image, manifest.captures?.[image], manifest.mode)) {
            if (referencedImages.has(image))
                throw new Error(`El ejemplo ${image} conserva una referencia sin captura.`);
            continue;
        }
        if (!referencedImages.has(image))
            throw new Error(`La captura ${image} falta en el contenido del manual ${id}.`);
        if (manifest.captures?.[image]?.status !== 'complete')
            throw new Error(`La captura ${image} debe volver a verificarse.`);
        const bytes = await readFile(path.join(root, 'images', image)).catch((cause) => {
            if (cause.code === 'ENOENT')
                throw new Error(
                    `Falta la captura ${image} de ${id}; vuelva a generarla con esa cuenta.`,
                );
            throw cause;
        });
        if (manifest.captures[image].sha256 !== createHash('sha256').update(bytes).digest('hex'))
            throw new Error(`La captura ${image} debe volver a verificarse.`);
    }
    return sources;
};
