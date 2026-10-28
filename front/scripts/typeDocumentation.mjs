import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { parseSource, sourceFiles } from './documentation.mjs';

const tick = String.fromCharCode(96);
const compact = (value) => value.replace(/\s+/g, ' ').trim();
const cell = (value) => tick + compact(value).replaceAll('|', '\\|').replaceAll('`', '') + tick;
const label = (value) => {
    const parts = [];
    while (value.length > 28) {
        const dot = value.lastIndexOf('.', 28);
        const cut = dot > 8 ? dot + 1 : 28;
        parts.push(value.slice(0, cut));
        value = value.slice(cut);
    }
    parts.push(value);
    return JSON.stringify(
        parts
            .map((part) =>
                part.replaceAll('"', '&#34;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'),
            )
            .join('<br/>'),
    );
};
const namedType = (node) =>
    ts.isInterfaceDeclaration(node) ||
    ts.isTypeAliasDeclaration(node) ||
    ts.isClassDeclaration(node) ||
    ts.isEnumDeclaration(node);
const key = (file, position) => file + ':' + position;
const diagramMemberLimit = 16;
const diagramTargetLimit = 4;

/** Inspect declared contracts; never infer business relationships from names or IDs. */
export const inspectTypeSource = (file, content) => {
    const source = parseSource(file, content);
    if (source.parseDiagnostics.length) throw new Error('TypeScript inválido: ' + file);
    const contracts = [];
    const imports = new Map();
    const text = (node) => node?.getText(source) ?? '';
    const location = (node) => source.getLineAndCharacterOfPosition(node.getStart(source));
    const context = (node) => {
        for (let parent = node.parent; parent; parent = parent.parent) {
            if (ts.isCallExpression(parent) && parent.typeArguments?.includes(node))
                return text(parent.expression);
            if ((ts.isPropertySignature(parent) || ts.isParameter(parent)) && parent.name)
                return context(parent) + '.' + text(parent.name);
            if (namedType(parent) && parent.name) return text(parent.name);
            if (
                (ts.isVariableDeclaration(parent) || ts.isFunctionDeclaration(parent)) &&
                parent.name
            )
                return text(parent.name);
        }
        return path.basename(file).replace(/\.(ts|vue)$/, '');
    };
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
        } else if (ts.isTypeLiteralNode(node)) {
            const isAliasBody = ts.isTypeAliasDeclaration(node.parent) && node.parent.type === node;
            const isMacro =
                ts.isCallExpression(node.parent) &&
                ['defineProps', 'defineEmits', 'defineSlots'].includes(
                    text(node.parent.expression),
                );
            if (!isAliasBody && !isMacro)
                add(
                    node,
                    context(node) +
                        '@' +
                        (location(node).line + 1) +
                        ':' +
                        (location(node).character + 1),
                    'inline object',
                    text(node),
                    node.members,
                );
        }
        ts.forEachChild(node, visit);
    };
    visit(source);
    return { file, source, imports, contracts };
};

const areaOf = (file) =>
    file.startsWith('src/modules/') ? file.split('/')[2] : file.split('/')[1];
const shortType = (member) => {
    const type = compact(member.type);
    if (type.includes('=>')) return 'callback';
    if (type.includes('{')) return 'object';
    if (type.startsWith('[')) return 'tuple';
    if (type.length > 45) return 'complex';
    return type.replaceAll('<', '~').replaceAll('>', '~').replaceAll(';', '');
};

/** Public objects and object-returning functions also carry inferred Vue state. */
const inferPublicContracts = (frontRoot, files) => {
    const config = ts.readConfigFile(path.join(frontRoot, 'tsconfig.app.json'), ts.sys.readFile);
    const options = config.error
        ? { strict: true }
        : ts.parseJsonConfigFileContent(config.config, ts.sys, frontRoot).options;
    const program = ts.createProgram(
        files.filter((file) => file.endsWith('.ts')),
        { ...options, noEmit: true },
    );
    const checker = program.getTypeChecker();
    const inferred = [];
    for (const filename of files.filter((file) => file.endsWith('.ts'))) {
        const source = program.getSourceFile(filename);
        if (!source) continue;
        const file = path.relative(frontRoot, filename).split(path.sep).join('/');
        const hasObjectReturn = (node) => {
            if (ts.isParenthesizedExpression(node)) return hasObjectReturn(node.expression);
            if (ts.isObjectLiteralExpression(node)) return true;
            if (ts.isReturnStatement(node))
                return !!node.expression && hasObjectReturn(node.expression);
            if (node !== source && ts.isFunctionLike(node)) return false;
            return !!ts.forEachChild(node, (child) => hasObjectReturn(child) || undefined);
        };
        const add = (name, node, type, kind) => {
            const variants = type.isUnion() ? type.types : [type];
            for (const [index, variant] of variants.entries()) {
                const fields = variant.getProperties();
                if (!fields.length) continue;
                const nameOfContract = name + (variants.length > 1 ? '.variant' + (index + 1) : '');
                const body = fields
                    .map((symbol) => {
                        const fieldType = checker.getTypeOfSymbolAtLocation(symbol, node);
                        const formatted = checker.typeToString(
                            fieldType,
                            node,
                            ts.TypeFormatFlags.NoTruncation |
                                ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
                        );
                        return (
                            JSON.stringify(symbol.name) +
                            (symbol.flags & ts.SymbolFlags.Optional ? '?' : '') +
                            ': ' +
                            formatted +
                            ';'
                        );
                    })
                    .join('\n');
                const parsed = inspectTypeSource(
                    file,
                    'type InferredContract = {\n' + body + '\n};',
                );
                const point = source.getLineAndCharacterOfPosition(node.getStart(source));
                for (const [shape, contract] of parsed.contracts.entries()) {
                    contract.id = file + ':inferred:' + nameOfContract + ':' + contract.node.pos;
                    contract.name =
                        contract.name === 'InferredContract'
                            ? nameOfContract
                            : contract.name
                                  .replace('InferredContract', nameOfContract)
                                  .replace(/@\d+:\d+$/, '.shape' + shape)
                                  .replaceAll('"', '');
                    contract.kind =
                        contract.node.parent.kind === ts.SyntaxKind.SourceFile
                            ? kind
                            : 'inferred object';
                    contract.line = point.line + 1;
                    contract.column = point.character + 1;
                }
                parsed.imports = new Map();
                inferred.push(parsed);
            }
        };
        for (const statement of source.statements) {
            if (ts.isTypeAliasDeclaration(statement) && !ts.isTypeLiteralNode(statement.type)) {
                const type = checker.getTypeFromTypeNode(statement.type);
                if (type.flags & ts.TypeFlags.Object)
                    add(statement.name.text + '.expanded', statement, type, 'evaluated alias');
            }
            if (!(ts.getCombinedModifierFlags(statement) & ts.ModifierFlags.Export)) continue;
            const functions = [];
            if (ts.isFunctionDeclaration(statement) && statement.name)
                functions.push([statement.name.text, statement]);
            if (ts.isVariableStatement(statement))
                for (const declaration of statement.declarationList.declarations) {
                    const value = declaration.initializer;
                    if (!value || !ts.isIdentifier(declaration.name)) continue;
                    const initializer = ts.isAsExpression(value) ? value.expression : value;
                    if (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))
                        functions.push([declaration.name.text, initializer]);
                    else if (ts.isObjectLiteralExpression(initializer))
                        add(
                            declaration.name.text,
                            declaration,
                            checker.getTypeAtLocation(declaration.name),
                            'inferred export',
                        );
                }
            for (const [name, fn] of functions) {
                if (!fn.body || !hasObjectReturn(fn.body)) continue;
                const signature = checker.getSignatureFromDeclaration(fn);
                if (signature)
                    add(
                        name + '.return',
                        fn,
                        checker.getAwaitedType(checker.getReturnTypeOfSignature(signature)),
                        'inferred return',
                    );
            }
        }
    }
    return inferred;
};

/** Complete declared attributes and type dependencies, grouped by source and contract. */
export const buildTypeModel = async (frontRoot) => {
    const files = await sourceFiles(path.join(frontRoot, 'src'));
    const units = await Promise.all(
        files.map(async (filename) => {
            const file = path.relative(frontRoot, filename).split(path.sep).join('/');
            return inspectTypeSource(file, await readFile(filename, 'utf8'));
        }),
    );
    const inferred = inferPublicContracts(frontRoot, files);
    for (const unit of inferred)
        unit.imports = units.find((source) => source.file === unit.file)?.imports ?? new Map();
    units.push(...inferred);
    const contracts = units.flatMap((unit) => unit.contracts);
    const byNode = new Map(contracts.map((item) => [item.node, item]));
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
                const inline = byNode.get(node);
                if (inline && inline !== contract) {
                    reference(
                        { id: inline.id, name: inline.name, file: inline.file },
                        role,
                        kind,
                        multiplicity,
                    );
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
            if (contract.kind === 'type') {
                const expanded = contracts.find(
                    (item) =>
                        item.file === contract.file && item.name === contract.name + '.expanded',
                );
                if (expanded)
                    reference(
                        { id: expanded.id, name: expanded.name, file: expanded.file },
                        'evaluated structure',
                    );
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

const diagramParts = (contract) => {
    const parts = [];
    const refersToMember = (edge, member) =>
        edge.role === member.name ||
        edge.role.startsWith(member.name + '.') ||
        edge.role.startsWith(member.name + ' typeof');
    for (let start = 0; start < Math.max(1, contract.members.length); start += diagramMemberLimit) {
        const members = contract.members.slice(start, start + diagramMemberLimit);
        const edges = contract.edges.filter(
            (edge) =>
                members.some((member) => refersToMember(edge, member)) ||
                (start === 0 && !contract.members.some((member) => refersToMember(edge, member))),
        );
        const targets = [...new Set(edges.map((edge) => edge.target.id))];
        for (let offset = 0; offset < Math.max(1, targets.length); offset += diagramTargetLimit) {
            const selected = new Set(targets.slice(offset, offset + diagramTargetLimit));
            const selectedEdges = edges.filter((edge) => selected.has(edge.target.id));
            parts.push({
                members: members.filter(
                    (member) =>
                        selectedEdges.some((edge) => refersToMember(edge, member)) ||
                        (offset === 0 && !edges.some((edge) => refersToMember(edge, member))),
                ),
                edges: selectedEdges,
            });
        }
    }
    return parts;
};

const diagram = (contract, members, edges) => {
    const lines = [
        'classDiagram',
        '    direction LR',
        '    class Subject[' + label(contract.name) + '] {',
        '        <<' + contract.kind.replaceAll(' ', '_') + '>>',
    ];
    for (const item of members) {
        const name = item.name.replaceAll(/['"{};<>]/g, '') + (item.optional ? '?' : '');
        lines.push('        ' + name + (item.operation ? '(...)' : ': ' + shortType(item)));
    }
    lines.push('    }');
    const targets = [
        ...new Map(
            edges
                .filter((edge) => edge.target.id !== contract.id)
                .map((edge) => [edge.target.id, edge.target]),
        ).values(),
    ];
    for (const [index, target] of targets.entries())
        lines.push(
            '    class R' + index + '[' + label(target.name) + '] {',
            '        <<reference>>',
            '    }',
        );
    for (const edge of edges) {
        const target =
            edge.target.id === contract.id
                ? 'Subject'
                : 'R' + targets.findIndex((item) => item.id === edge.target.id);
        const role = edge.role.replaceAll(/[^\w .:@?-]/g, '');
        lines.push(
            edge.kind === 'inheritance'
                ? '    ' + target + ' <|-- Subject : extends'
                : edge.kind === 'implementation'
                  ? '    ' + target + ' <|.. Subject : implements'
                  : edge.kind === 'association'
                    ? '    Subject "1" --> "' + edge.multiplicity + '" ' + target + ' : ' + role
                    : '    Subject ..> ' + target + ' : ' + role,
        );
    }
    return lines.join('\n');
};

/** @param {string} frontRoot */
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
        for (const [number, contract] of contracts.entries()) {
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
            const parts = diagramParts(contract);
            for (const [part, content] of parts.entries()) {
                lines.push(
                    '**Figura:** `DIA-VUE-TS-' +
                        area.toUpperCase() +
                        '-' +
                        (number + 1) +
                        '-' +
                        (part + 1) +
                        '`.' +
                        (parts.length > 1 ? ' Parte ' + (part + 1) + '/' + parts.length + '.' : ''),
                    '',
                    fence + 'mermaid',
                    diagram(contract, content.members, content.edges),
                    fence,
                    '',
                );
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
            '# Referencia completa de contratos TypeScript',
            '',
            'Generado desde `src/` con `npm run docs:generate`. No editar manualmente.',
            '',
            'Se inspeccionan ' +
                model.files +
                ' archivos TS/SFC y se describen ' +
                model.contracts.length +
                ' contratos declarados o inferidos.',
            '',
            '| Ámbito | Contratos | Miembros directos |',
            '| --- | --- | --- |',
            ...summary,
            '',
            '## Alcance y notación',
            '',
            'Incluye interfaces, aliases, clases, enums, props/eventos/slots tipados y objetos inline declarados en tipos. También inspecciona objetos públicos y retornos públicos de objeto mediante el checker de TypeScript.',
            'Cada miembro directo conserva su firma completa. La herencia local se consulta siguiendo extends; las bases externas sólo se nombran en la declaración del contrato.',
            'Los aliases conservan uniones, intersecciones, keyof, Record, Pick, Exclude y ReturnType tal como están declarados.',
            'Las relaciones se obtienen de referencias de tipo y de las cláusulas extends/implements, no de campos cuyo nombre termine en Id.',
            'Asociación: propiedad estructural con multiplicidad. Dependencia discontinua: uso de un tipo, callback, unión o parámetro genérico.',
            'Las figuras y las tablas de relaciones sólo incluyen contratos identificados en src/. Incluyen los modelos del negocio y los contratos propios de componentes, transporte y coordinación, que permiten explicar los patrones aplicados.',
            'Las tecnologías utilizadas son Vue, TypeScript, Axios y VeeValidate. Sus clases externas no se dibujan; sus tipos y utilidades conservan el nombre en las firmas únicamente cuando el contrato lo necesita.',
            'Los destinos sin atributos remiten a su propia ficha local. Los saltos de línea de las etiquetas sólo distribuyen su nombre para facilitar lectura.',
            'La división por ámbito sigue las carpetas de src/. Cada contrato se presenta en una figura mientras no supere ' +
                diagramMemberLimit +
                ' miembros o ' +
                diagramTargetLimit +
                ' destinos distintos por grupo. Los contratos mayores se dividen para mantener legible la exportación; las propiedades se agrupan con sus relaciones. Las partes se numeran únicamente cuando hay varias figuras del mismo contrato.',
            'Los objetos inline declarados muestran contexto, línea y columna. Las formas inferidas usan shapeN dentro del contrato padre; su fuente apunta al export o función original. No son clases instanciadas.',
            'Las formas object/callback/tuple/complex en una figura remiten a la firma completa de su tabla; no se omite ningún miembro.',
            'Las firmas inferidas sin anotación se identifican como inferred/signature; los estados inferidos de funciones se distinguen de las interfaces escritas explícitamente en el código.',
            'Los contratos SFC nombrados por contexto son formas estructurales, no clases de componentes Vue.',
            'La forma evaluated_alias desarrolla campos de aliases como Record, Pick o ReturnType cuando el compilador puede resolverlos. La definición original se conserva junto a esa estructura evaluada. La relación de datos no representa el orden de ejecución. El [modelo curado](../class-and-type-models/index.md) explica los cortes y responsabilidades.',
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
