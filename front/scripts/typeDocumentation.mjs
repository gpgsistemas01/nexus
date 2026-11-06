import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { parseSource, sourceFiles } from './documentation.mjs';

const tick = String.fromCharCode(96);
const compact = (value) => value.replace(/\s+/g, ' ').trim();
const cell = (value) => tick + compact(value).replaceAll('|', '\\|').replaceAll('`', '') + tick;
const namedType = (node) =>
    ts.isInterfaceDeclaration(node) ||
    ts.isTypeAliasDeclaration(node) ||
    ts.isClassDeclaration(node) ||
    ts.isEnumDeclaration(node);
const key = (file, position) => file + ':' + position;

/** Inspect declared contracts; never infer business relationships from names or IDs. */
export const inspectTypeSource = (file, content) => {
    const source = parseSource(file, content);
    if (source.parseDiagnostics.length) throw new Error('TypeScript inválido: ' + file);
    const contracts = [];
    const imports = new Map();
    const text = (node) => node?.getText(source) ?? '';
    const location = (node) => source.getLineAndCharacterOfPosition(node.getStart(source));
    const member = (node) => ({
        node,
        name: node.name
            ? ts.isStringLiteral(node.name)
                ? node.name.text
                : text(node.name)
            : ts.isConstructorDeclaration(node)
              ? 'constructor'
              : 'signature',
        type: text(node.type) || (node.initializer ? 'inferred' : 'signature'),
        signature: node.body
            ? text(node)
                  .slice(0, node.body.getStart(source) - node.getStart(source))
                  .trim()
            : text(node),
        optional: !!node.questionToken,
        operation:
            ts.isMethodSignature(node) ||
            ts.isMethodDeclaration(node) ||
            ts.isConstructorDeclaration(node),
    });
    const add = (node, name, kind, definition, members = []) => {
        const point = location(node);
        const properties = members.map(member);
        if (ts.isClassDeclaration(node)) {
            for (const constructor of node.members.filter(ts.isConstructorDeclaration))
                for (const parameter of constructor.parameters)
                    if (
                        ts.getCombinedModifierFlags(parameter) &
                        (ts.ModifierFlags.Public |
                            ts.ModifierFlags.Private |
                            ts.ModifierFlags.Protected |
                            ts.ModifierFlags.Readonly)
                    )
                        properties.push(member(parameter));
        }
        contracts.push({
            id: key(file, node.pos),
            file,
            node,
            name,
            kind,
            definition,
            line: point.line + 1,
            column: point.character + 1,
            members: properties,
            parameters: node.typeParameters?.map(text).join(', ') ?? '',
            bases: node.heritageClauses?.map(text).join(' ') ?? '',
        });
    };
    const visit = (node) => {
        if (ts.isImportDeclaration(node)) {
            const clause = node.importClause;
            if (clause?.name)
                imports.set(clause.name.text, { from: node.moduleSpecifier.text, name: 'default' });
            if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings))
                for (const item of clause.namedBindings.elements)
                    imports.set(item.name.text, {
                        from: node.moduleSpecifier.text,
                        name: item.propertyName?.text ?? item.name.text,
                    });
        }
        if (namedType(node) && node.name) {
            const alias = ts.isTypeAliasDeclaration(node);
            const kind = ts.isInterfaceDeclaration(node)
                ? 'interface'
                : alias
                  ? 'type'
                  : ts.isEnumDeclaration(node)
                    ? 'enum'
                    : 'class';
            const body =
                alias && ts.isTypeLiteralNode(node.type) ? node.type.members : node.members;
            add(node, text(node.name), kind, alias ? text(node.type) : '', body ?? []);
        }
        if (
            ts.isCallExpression(node) &&
            ['defineProps', 'defineEmits', 'defineSlots'].includes(text(node.expression)) &&
            node.typeArguments?.[0]
        ) {
            const type = node.typeArguments[0];
            add(
                type,
                path.basename(file, '.vue') + '.' + text(node.expression),
                'SFC contract',
                text(type),
                ts.isTypeLiteralNode(type) ? type.members : [],
            );
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return { file, source, imports, contracts };
};

const areaOf = (file) =>
    file.startsWith('src/modules/') ? file.split('/')[2] : file.split('/')[1];
export const buildTypeModel = async (frontRoot) => {
    const files = await sourceFiles(path.join(frontRoot, 'src'));
    const units = await Promise.all(
        files.map(async (filename) => {
            const file = path.relative(frontRoot, filename).split(path.sep).join('/');
            return inspectTypeSource(file, await readFile(filename, 'utf8'));
        }),
    );
    const contracts = units.flatMap((unit) => unit.contracts);
    const byName = new Map(
        contracts
            .filter((item) => namedType(item.node))
            .map((item) => [item.file + ':' + item.name, item]),
    );
    const relativeType = (unit, specifier, name) => {
        const base = path.posix
            .normalize(path.posix.join(path.posix.dirname(unit.file), specifier))
            .replace(/\.js$/, '.ts');
        for (const file of [base, base + '.ts', path.posix.join(base, 'index.ts')]) {
            const target = byName.get(file + ':' + name);
            if (target) return { id: target.id, name: target.name, file: target.file };
        }
    };
    const resolve = (unit, name) => {
        const local = byName.get(unit.file + ':' + name);
        if (local) return { id: local.id, name: local.name, file: local.file };
        const imported = unit.imports.get(name);
        if (imported?.from.startsWith('.')) {
            const resolved = relativeType(unit, imported.from, imported.name);
            if (resolved) return resolved;
        }
        return { id: 'reference:' + name, name, file: null };
    };
    for (const unit of units)
        for (const contract of unit.contracts) {
            const edges = [];
            const reference = (target, role, kind = 'dependency', multiplicity = '') => {
                edges.push({ target, role, kind, multiplicity });
            };
            const scan = (node, role, kind = 'dependency', multiplicity = '') => {
                if (!node) return;
                if (ts.isArrayTypeNode(node)) {
                    scan(
                        node.elementType,
                        role,
                        kind,
                        kind === 'association' ? '0..*' : multiplicity,
                    );
                    return;
                }
                if (ts.isParenthesizedTypeNode(node) || ts.isTypeOperatorNode(node)) {
                    scan(node.type, role, kind, multiplicity);
                    return;
                }
                if (ts.isUnionTypeNode(node)) {
                    for (const option of node.types)
                        scan(option, role, kind, kind === 'association' ? '0..1' : multiplicity);
                    return;
                }
                if (
                    ts.isTypeReferenceNode(node) &&
                    ['Array', 'ReadonlyArray'].includes(node.typeName.getText(unit.source))
                ) {
                    for (const argument of node.typeArguments ?? [])
                        scan(argument, role, kind, kind === 'association' ? '0..*' : multiplicity);
                    return;
                }
                if (ts.isTypeReferenceNode(node)) {
                    const target = resolve(unit, node.typeName.getText(unit.source));
                    const object = contracts.find((item) => item.id === target.id);
                    reference(
                        target,
                        role,
                        object && ['interface', 'class'].includes(object.kind)
                            ? kind
                            : 'dependency',
                        multiplicity,
                    );
                }
                if (ts.isTypeQueryNode(node))
                    reference(resolve(unit, node.exprName.getText(unit.source)), role + ' typeof');
                if (
                    ts.isImportTypeNode(node) &&
                    ts.isLiteralTypeNode(node.argument) &&
                    ts.isStringLiteral(node.argument.literal)
                ) {
                    const module = node.argument.literal.text;
                    const name = node.qualifier?.getText(unit.source) ?? module;
                    const target = module.startsWith('.')
                        ? relativeType(unit, module, name)
                        : undefined;
                    reference(
                        target ?? {
                            id: 'import:' + module + ':' + name,
                            name: module + '.' + name,
                            file: null,
                        },
                        role,
                        target &&
                            !node.isTypeOf &&
                            contracts.some(
                                (item) =>
                                    item.id === target.id &&
                                    ['interface', 'class'].includes(item.kind),
                            )
                            ? kind
                            : 'dependency',
                        multiplicity,
                    );
                }
                ts.forEachChild(node, (child) => scan(child, role));
            };
            for (const base of contract.node.heritageClauses ?? [])
                for (const type of base.types) {
                    reference(
                        resolve(unit, type.expression.getText(unit.source)),
                        base.token === ts.SyntaxKind.ExtendsKeyword ? 'extends' : 'implements',
                        base.token === ts.SyntaxKind.ExtendsKeyword
                            ? 'inheritance'
                            : 'implementation',
                    );
                    for (const argument of type.typeArguments ?? [])
                        scan(argument, 'type argument');
                }
            for (const field of contract.members) {
                const array =
                    ts.isArrayTypeNode(field.node.type ?? {}) ||
                    /^(?:readonly )?(?:Array|ReadonlyArray)</.test(field.type);
                const type =
                    array && ts.isArrayTypeNode(field.node.type)
                        ? field.node.type.elementType
                        : field.node.type;
                scan(
                    type,
                    field.name,
                    !field.operation && !field.type.includes('=>') && !field.type.startsWith('[')
                        ? 'association'
                        : 'dependency',
                    array
                        ? '0..*'
                        : field.optional || /\bnull\b|\bundefined\b/.test(field.type)
                          ? '0..1'
                          : '1',
                );
                for (const parameter of field.node.parameters ?? [])
                    scan(parameter.type, field.name + '.' + parameter.name.getText(unit.source));
            }
            for (const parameter of contract.node.typeParameters ?? []) {
                scan(parameter.constraint, 'constraint ' + parameter.name.getText(unit.source));
                scan(parameter.default, 'default ' + parameter.name.getText(unit.source));
            }
            if (
                !contract.members.length ||
                (ts.isTypeAliasDeclaration(contract.node) &&
                    !ts.isTypeLiteralNode(contract.node.type))
            )
                scan(
                    ts.isTypeAliasDeclaration(contract.node) ? contract.node.type : contract.node,
                    'type',
                );
            contract.edges = [
                ...new Map(edges.map((edge) => [JSON.stringify(edge), edge])).values(),
            ];
        }
    const localContracts = new Set(contracts.map((contract) => contract.id));
    for (const contract of contracts)
        contract.edges = contract.edges.filter((edge) => localContracts.has(edge.target.id));
    return { files: files.length, contracts };
};

export const renderTypeReference = async (frontRoot) => {
    const model = await buildTypeModel(frontRoot);
    const directory = 'docs/architecture/views/logical/type-reference';
    const groups = new Map();
    for (const contract of model.contracts) {
        const area = areaOf(contract.file);
        if (!groups.has(area)) groups.set(area, []);
        groups.get(area).push(contract);
    }
    const result = new Map();
    const fence = tick.repeat(3);
    const summary = [];
    for (const [area, contracts] of groups) {
        const lines = [
            '# Contratos TypeScript: ' + area,
            '',
            'Generado con `npm run docs:generate`. No editar manualmente.',
            '',
            '[Alcance y notación](index.md#alcance-y-notación).',
            '',
        ];
        for (const contract of contracts) {
            const source = path.posix.relative(directory, contract.file);
            lines.push(
                '## ' + contract.name,
                '',
                '**Fuente:** [' +
                    contract.file +
                    '](' +
                    source +
                    ') · línea ' +
                    contract.line +
                    ', columna ' +
                    contract.column +
                    '. **Declaración:** ' +
                    contract.kind +
                    '.',
                '',
            );
            if (contract.parameters)
                lines.push('**Parámetros:** ' + cell(contract.parameters) + '.', '');
            if (contract.bases)
                lines.push('**Extensión/implementación:** ' + cell(contract.bases) + '.', '');
            if (contract.definition && !contract.members.length)
                lines.push(
                    '**Definición completa:**',
                    '',
                    fence + 'typescript',
                    contract.definition,
                    fence,
                    '',
                );
            if (contract.members.length) {
                lines.push('| Miembro | Firma completa |', '| --- | --- |');
                for (const item of contract.members)
                    lines.push('| ' + cell(item.name) + ' | ' + cell(item.signature) + ' |');
                lines.push('');
            }
            if (contract.edges.length) {
                lines.push(
                    '| Relación | Destino | Origen de la referencia |',
                    '| --- | --- | --- |',
                );
                for (const edge of contract.edges) {
                    const target = edge.target.file
                        ? '[' +
                          edge.target.name +
                          '](' +
                          path.posix.relative(directory, edge.target.file) +
                          ')'
                        : cell(edge.target.name);
                    lines.push('| ' + edge.kind + ' | ' + target + ' | ' + cell(edge.role) + ' |');
                }
                lines.push('');
            }
        }
        result.set(area + '.md', lines.join('\n'));
        summary.push(
            '| [' +
                area +
                '](' +
                area +
                '.md) | ' +
                contracts.length +
                ' | ' +
                contracts.reduce((n, c) => n + c.members.length, 0) +
                ' |',
        );
    }
    result.set(
        'index.md',
        [
            '# Referencia de contratos TypeScript',
            '',
            'Generado desde `src/` con `npm run docs:generate`. No editar manualmente.',
            '',
            'Se inspeccionan ' +
                model.files +
                ' archivos TS/SFC y se describen ' +
                model.contracts.length +
                ' contratos declarados.',
            '',
            '| Ámbito | Contratos | Miembros directos |',
            '| --- | --- | --- |',
            ...summary,
            '',
            '## Alcance y notación',
            '',
            'Incluye interfaces, aliases, clases, enums y contratos tipados de props, eventos y slots declarados en `src/`.',
            'Cada contrato conserva su nombre, fuente y firmas. Los objetos anónimos y callbacks permanecen en la declaración que los contiene.',
            'Las uniones, intersecciones y utilidades como Pick, Record o ReturnType se presentan tal como están escritas, sin expandirlas en estructuras inferidas.',
            'Las tablas relacionan sólo contratos propios mencionados en las propiedades, parámetros, aliases y cláusulas extends/implements. Los tipos externos conservan su nombre dentro de las firmas.',
            'La organización por ámbito sigue las carpetas de `src/`. Los retornos sin anotación se consultan en el código y en su referencia de exports.',
            'Los [modelos estructurales](../class-and-type-models/index.md) presentan los diagramas seleccionados por responsabilidad; esta referencia reúne las declaraciones para consulta.',
            '',
        ].join('\n'),
    );
    return result;
};

export const generateTypeReference = async (frontRoot, checkOnly) => {
    const directory = path.join(frontRoot, 'docs/architecture/views/logical/type-reference');
    const documents = await renderTypeReference(frontRoot);
    const existing = await readdir(directory).catch(() => []);
    const stale = existing.filter((file) => file.endsWith('.md') && !documents.has(file));
    if (stale.length && checkOnly)
        throw new Error('Referencias de tipos obsoletas. Ejecuta npm run docs:generate.');
    for (const file of stale) await rm(path.join(directory, file));
    if (!checkOnly) await mkdir(directory, { recursive: true });
    for (const [file, content] of documents) {
        const target = path.join(directory, file);
        if (checkOnly) {
            if ((await readFile(target, 'utf8').catch(() => '')) !== content)
                throw new Error(
                    'Contratos TypeScript desactualizados. Ejecuta npm run docs:generate.',
                );
        } else await writeFile(target, content);
    }
};
