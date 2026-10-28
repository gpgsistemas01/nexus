import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { parse } from 'vue/compiler-sfc';

/** @param {string} filename @param {string} content */
export const parseSource = (filename, content) => {
    let script = content;
    if (filename.endsWith('.vue')) {
        const { descriptor, errors } = parse(content, { filename });
        if (errors.length) throw new Error(`${filename}: ${errors.map(String).join('; ')}`);
        script = content.replace(/[^\r\n]/g, ' ');
        for (const block of [descriptor.script, descriptor.scriptSetup].filter(Boolean))
            script =
                script.slice(0, block.loc.start.offset) +
                block.content +
                script.slice(block.loc.end.offset);
    }
    return ts.createSourceFile(filename, script, ts.ScriptTarget.Latest, true);
};

/** @param {string} filename @param {string} content */
export const inspectSource = (filename, content) => {
    const source = parseSource(filename, content);
    const imports = new Set();
    const exports = new Set();
    const contracts = new Set();
    const visit = (node) => {
        if (ts.isImportDeclaration(node)) {
            const clause = node.importClause;
            const bindings = clause?.namedBindings;
            const typeOnly =
                clause?.isTypeOnly ||
                (!clause?.name &&
                    bindings &&
                    ts.isNamedImports(bindings) &&
                    bindings.elements.every((element) => element.isTypeOnly));
            const suffix = typeOnly ? ' (tipo)' : '';
            imports.add(`${node.moduleSpecifier.text}${suffix}`);
        }
        if (ts.isExportDeclaration(node)) {
            if (node.moduleSpecifier) imports.add(`${node.moduleSpecifier.text} (reexport)`);
            if (node.exportClause && ts.isNamedExports(node.exportClause))
                for (const element of node.exportClause.elements) exports.add(element.name.text);
        }
        if (ts.isExportAssignment(node)) exports.add('default');
        if (ts.isCallExpression(node)) {
            if (
                node.expression.kind === ts.SyntaxKind.ImportKeyword &&
                ts.isStringLiteral(node.arguments[0])
            )
                imports.add(`${node.arguments[0].text} (diferido)`);
            if (
                ts.isIdentifier(node.expression) &&
                ['defineProps', 'defineEmits', 'defineSlots'].includes(node.expression.text)
            ) {
                const type = node.typeArguments?.[0];
                const members =
                    type && ts.isTypeLiteralNode(type)
                        ? type.members
                              .map((member) => member.name?.getText(source))
                              .filter(Boolean)
                              .join(', ')
                        : type?.getText(source);
                if (members) contracts.add(`${node.expression.text}: ${members}`);
            }
        }
        if (node.parent === source && ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) {
            if (ts.isVariableStatement(node)) {
                for (const declaration of node.declarationList.declarations)
                    exports.add(declaration.name.getText(source));
            } else if (node.name) exports.add(node.name.getText(source));
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    const sorted = (items) => [...items].sort((a, b) => a.localeCompare(b, 'en'));
    return { imports: sorted(imports), exports: sorted(exports), contracts: sorted(contracts) };
};

/** @param {string} directory */
export const sourceFiles = async (directory) => {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(
        entries.map((entry) => {
            const filename = path.join(directory, entry.name);
            return entry.isDirectory()
                ? sourceFiles(filename)
                : /\.(ts|vue)$/.test(entry.name)
                  ? [filename]
                  : [];
        }),
    );
    return nested.flat().sort((a, b) => a.localeCompare(b, 'en'));
};

/** @param {string} frontRoot */
export const renderCodeReference = async (frontRoot) => {
    const files = await sourceFiles(path.join(frontRoot, 'src'));
    const sections = new Map();
    const code = (values) =>
        values.length
            ? values
                  .map((value) => `\`${value.replaceAll('|', '\\|').replaceAll('`', '')}\``)
                  .join('<br>')
            : '—';
    for (const filename of files) {
        const relative = path.relative(frontRoot, filename).split(path.sep).join('/');
        const area = relative.startsWith('src/modules/')
            ? relative.split('/').slice(1, 3).join('/')
            : relative.split('/')[1];
        const symbols = inspectSource(relative, await readFile(filename, 'utf8'));
        const rows = sections.get(area) ?? [];
        rows.push(
            `| [${path.basename(relative)}](../../../../${relative}) | **Exports:** ${code(symbols.exports)}<br>**Contratos SFC:** ${code(symbols.contracts)}<br>**Imports:** ${code(symbols.imports)} |`,
        );
        sections.set(area, rows);
    }
    return [
        '# Referencia técnica generada del código Vue',
        '',
        'Este inventario se genera con `npm run docs:generate` desde `front/`.',
        'No editar manualmente. `npm run docs:check` detecta diferencias con las fuentes.',
        '',
        '## Alcance e interpretación',
        '',
        `Se inspeccionan ${files.length} archivos TypeScript y SFC de \`src/\`, con TypeScript y el parser oficial \`vue/compiler-sfc\`.`,
        'Las tablas muestran exports declarados, nombres de props/eventos/slots tipados e imports estáticos o diferidos.',
        'Los contratos referenciados por un tipo conservan su nombre; no se expande el compilador ni se ejecuta la aplicación.',
        'No se infieren responsabilidades, permisos, calidad o cobertura a partir de los nombres.',
        'Las decisiones pertenecen a [arquitectura](code-structure.md), [patrones](design-and-construction-patterns/index.md) y [módulos](frontend-technical-documentation/index.md).',
        'No incluye secretos, dependencias instaladas, archivos compilados ni código privado del servidor.',
        '',
        ...[...sections].flatMap(([area, rows]) => [
            `## ${area}`,
            '',
            '| Archivo | Declaraciones y dependencias |',
            '| --- | --- |',
            ...rows,
            '',
        ]),
    ].join('\n');
};

/** @param {string} frontRoot @param {boolean} checkOnly */
export const generateCodeReference = async (frontRoot, checkOnly) => {
    const output = path.join(frontRoot, 'docs/architecture/views/development/code-reference.md');
    const expected = await renderCodeReference(frontRoot);
    if (checkOnly) {
        const current = await readFile(output, 'utf8').catch(() => '');
        if (current !== expected)
            throw new Error(
                'Referencia Vue desactualizada. Ejecuta npm run docs:generate desde front/.',
            );
    } else await writeFile(output, expected);
};
