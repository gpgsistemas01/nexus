import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { selectedChapters, filterManualContent, imageNames } from './model.mjs';
import { validProfileId } from './profiles.mjs';
import { DATA_SCOPES, hasDataScope } from '../../../back/src/constants/permissions.js';

export const permissionFingerprint = (permissions) =>
    createHash('sha256')
        .update([...new Set(permissions)].sort().join('\n'))
        .digest('hex');

export const accessFingerprint = (session) =>
    createHash('sha256')
        .update(
            JSON.stringify({
                id: session.id,
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

export const prepareManual = async (frontRoot, profile, session) => {
    if (
        !validProfileId(profile.id) ||
        !Array.isArray(session.permissions) ||
        !session.permissions.every((p) => typeof p === 'string')
    )
        throw new Error('Perfil o permisos de sesión inválidos.');
    const root = path.join(frontRoot, 'build/manuals', profile.id);
    await mkdir(path.join(root, 'images'), { recursive: true });
    const chapters = selectedChapters(session.permissions);
    const files = new Set(['index.md', ...chapters.map(({ file }) => file)]);
    const sources = [];
    const images = new Set();
    for (const [chapterIndex, chapter] of chapters.entries()) {
        const source = await readFile(
            path.join(frontRoot, 'docs/user-manual', chapter.file),
            'utf8',
        );
        let content = filterManualContent(source, session.permissions);
        content = content.replace(/^# [^\r\n]+/, `# ${chapterIndex + 1}. ${chapter.title}`);
        for (const name of imageNames(content)) images.add(name);
        content = content.replace(/\]\(images\//g, '](../images/');
        content = content.replace(
            /(?<!!)\[([^\]]+)\]\(([a-z0-9-]+\.md)(#[^)]*)?\)/g,
            (link, label, filename) => (files.has(filename) ? link : label),
        );
        sources.push({ file: chapter.file, content });
    }
    const scope = hasDataScope(session.accesses ?? [], DATA_SCOPES.GOODS_ISSUES_READ_ALL)
        ? 'En Salidas de Materiales y Consumibles puede consultar documentos de todas las áreas, según los filtros y el estado de cada documento.'
        : 'En Salidas de Materiales y Consumibles la consulta está limitada a las áreas autorizadas para su cuenta. Limpiar los filtros no amplía ese acceso.';
    const title = `Manual de inducción de Nexus — ${profile.label}`;
    const documentDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Mexico_City',
    }).format(new Date());
    const index = `# ${title}\n\n## Datos generales del documento\n\n| Versión documental | Versión del sistema | Estado | Fecha | Responsable |\n| --- | --- | --- | --- | --- |\n| 1.1 | 1.0.0 | En revisión | ${documentDate} | Equipo Nexus |\n\n## Su recorrido de aprendizaje\n\nEste manual corresponde al acceso **${profile.label}**. Empiece por Primera jornada y continúe con la tarea que necesita realizar. Las funciones y capturas se seleccionaron con los permisos efectivos de la sesión al generar esta edición.\n\n${profile.mode === 'demo' ? 'Las capturas usan datos ficticios y los permisos calculados por las políticas actuales del sistema. Esta edición de demostración no certifica la asignación de una cuenta real.' : 'Las capturas muestran la interfaz de la cuenta utilizada en el entorno de capacitación. Los nombres y cantidades de su trabajo pueden ser diferentes.'}\n\n${scope}\n\n| Orden | Lección |\n| --- | --- |\n${chapters.map((chapter, i) => `| ${i + 1} | [${chapter.title}](${chapter.file}) |`).join('\n')}\n\n## Localizar una solución rápidamente\n\nSi una captura presenta un mensaje o no sabe si una operación terminó, abra [Errores y recuperación](15-errors-and-recovery.md). Si todavía está aprendiendo la navegación o el significado de un campo, comience por [Primera jornada](00-induction.md) y [Navegación y controles](02-navigation-and-controls.md).\n\nNo comparta su contraseña para solicitar ayuda. Si cambia su acceso, solicite una edición actualizada del manual.\n`;
    await mkdir(path.join(root, 'sources'), { recursive: true });
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
        images: [...images],
        status: 'pending',
    };
};

export const loadManualPublication = async (frontRoot, id) => {
    if (!validProfileId(id)) throw new Error('Identificador de manual inválido.');
    const root = path.join(frontRoot, 'build/manuals', id);
    const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
    if (
        manifest.id !== id ||
        manifest.status !== 'ready' ||
        !manifest.sources?.length ||
        manifest.sources[0] !== 'index.md'
    )
        throw new Error(`El manual ${id} no está completo; revise las capturas pendientes.`);
    const sources = [];
    for (const filename of manifest.sources) {
        if (!/^[a-z0-9-]+\.md$/.test(filename)) throw new Error('Fuente de manual inválida.');
        const source = path.join(root, 'sources', filename);
        await access(source);
        sources.push(
            path.relative(path.resolve(frontRoot, '../back'), source).split(path.sep).join('/'),
        );
    }
    for (const image of manifest.images) {
        if (!/^[a-z0-9-]+\.png$/.test(image)) throw new Error('Imagen de manual inválida.');
        const bytes = await readFile(path.join(root, 'images', image));
        if (
            manifest.captures?.[image]?.status !== 'complete' ||
            manifest.captures[image].sha256 !== createHash('sha256').update(bytes).digest('hex')
        )
            throw new Error(`La captura ${image} debe volver a verificarse.`);
    }
    return sources;
};
