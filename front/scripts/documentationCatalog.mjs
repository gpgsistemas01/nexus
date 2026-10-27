import { readFile, readdir, realpath, stat } from 'node:fs/promises';
import path from 'node:path';

/**
 * Resolve the documented reading order without following links outside docs.
 * @param {string} directory
 */
export const loadDocumentationCatalog = async (directory) => {
    const root = await realpath(directory);
    const manifest = JSON.parse(await readFile(path.join(root, 'publications.json'), 'utf8'));
    if (!manifest.sections || Array.isArray(manifest.sections))
        throw new Error('publications.json debe declarar sus secciones documentales.');

    const relativeName = (filename) => path.relative(root, filename).split(path.sep).join('/');
    const resolveSource = async (source) => {
        if (
            typeof source !== 'string' ||
            path.isAbsolute(source) ||
            source.includes('\\') ||
            source.split('/').includes('..')
        )
            throw new Error(`Fuente documental no permitida: ${source}.`);
        const resolved = await realpath(path.resolve(root, source));
        if (!resolved.startsWith(`${root}${path.sep}`))
            throw new Error(`La fuente debe pertenecer a docs: ${source}.`);
        return resolved;
    };
    const markdownFiles = async (folder) => {
        const entries = await readdir(folder, { withFileTypes: true });
        entries.sort((left, right) =>
            left.name === 'index.md'
                ? -1
                : right.name === 'index.md'
                  ? 1
                  : left.name.localeCompare(right.name, 'en'),
        );
        const result = [];
        for (const entry of entries) {
            const filename = await resolveSource(relativeName(path.join(folder, entry.name)));
            if (entry.isDirectory()) result.push(...(await markdownFiles(filename)));
            else if (entry.name.endsWith('.md')) result.push(relativeName(filename));
        }
        return result;
    };
    /** @type {Record<string, { title: string; entry: string; includeInComplete: boolean; sources: string[] }>} */
    const sections = {};
    const allSources = new Set(['index.md']);
    const completeSources = new Set(['index.md']);
    await resolveSource('index.md');
    for (const [name, definition] of Object.entries(manifest.sections)) {
        if (
            !/^[a-z]+(?:-[a-z]+)*$/.test(name) ||
            !definition ||
            typeof definition.title !== 'string' ||
            !definition.title.trim() ||
            !Array.isArray(definition.sources) ||
            !definition.sources.length ||
            (definition.includeInComplete !== undefined &&
                typeof definition.includeInComplete !== 'boolean')
        )
            throw new Error(`Sección documental inválida: ${name}.`);
        const entry = relativeName(await resolveSource(definition.entry ?? 'index.md'));
        if (!entry.endsWith('.md') || !(await stat(path.join(root, entry))).isFile())
            throw new Error(`La entrada documental debe ser Markdown: ${entry}.`);
        const includeInComplete = definition.includeInComplete ?? true;
        const sources = [entry];
        allSources.add(entry);
        for (const source of definition.sources) {
            const filename = await resolveSource(source);
            const expanded = (await stat(filename)).isDirectory()
                ? await markdownFiles(filename)
                : source.endsWith('.md')
                  ? [relativeName(filename)]
                  : [];
            if (!expanded.length) throw new Error(`La fuente no contiene Markdown: ${source}.`);
            for (const item of expanded) {
                if (item === entry) continue;
                if (sources.includes(item)) throw new Error(`Fuente repetida en ${name}: ${item}.`);
                sources.push(item);
                allSources.add(item);
            }
        }
        if (includeInComplete) for (const source of sources) completeSources.add(source);
        sections[name] = { title: definition.title, entry, includeInComplete, sources };
    }
    const unlisted = (await markdownFiles(root)).filter((source) => !allSources.has(source));
    if (unlisted.length)
        throw new Error(`Faltan fuentes en publications.json: ${unlisted.join(', ')}.`);
    return { sections, completeSources: [...completeSources] };
};

/** Keep the existing format-only invocation and accept a documented section. */
export const parseDocumentationExportArgs = (args, sectionNames) => {
    const formats = new Set(['docx', 'pdf', 'ambos']);
    if (!args.length) return { section: null, format: 'ambos' };
    if (args.length === 1 && formats.has(args[0])) return { section: null, format: args[0] };
    const [name, format = 'ambos'] = args;
    if (
        args.length > 2 ||
        (name !== 'completo' && !sectionNames.includes(name)) ||
        !formats.has(format)
    )
        throw new Error(
            `Usa docs:export -- [completo|${sectionNames.join('|')}] [docx|pdf|ambos].`,
        );
    return { section: name === 'completo' ? null : name, format };
};
