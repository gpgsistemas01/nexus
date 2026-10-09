const FRAGMENTS = new Set(['alt', 'opt', 'loop', 'par', 'critical', 'break', 'rect', 'box']);
const BRANCHES = { else: 'alt', and: 'par', option: 'critical' };

export const getSequenceStructureErrors = (source) => {
    const errors = [];
    const participants = new Set();
    const fragments = [];
    const activations = new Map();
    const lines = source.split('\n');
    const updateActivation = (alias, change) => {
        if (!participants.has(alias)) errors.push(`activación de participante no declarado: ${alias}`);
        const depth = (activations.get(alias) ?? 0) + change;
        if (depth < 0) errors.push(`deactivate sin activate: ${alias}`);
        activations.set(alias, depth);
    };

    for (const line of lines) {
        const declaration = line.match(/^\s*(?:actor|participant)\s+([^\s@]+)/);
        if (!declaration) continue;
        const alias = declaration[1];
        if (participants.has(alias)) errors.push(`participante duplicado: ${alias}`);
        participants.add(alias);
    }

    for (const line of lines) {
        const text = line.trim();
        const keyword = text.split(/\s/)[0];
        if (FRAGMENTS.has(keyword)) fragments.push(keyword);
        else if (text === 'end') {
            if (!fragments.pop()) errors.push('end sin fragmento abierto');
        } else if (BRANCHES[keyword] && fragments.at(-1) !== BRANCHES[keyword]) {
            errors.push(`${keyword} fuera de ${BRANCHES[keyword]}`);
        }

        const message = text.match(/^(\w+)(?:--?>>|--?x|--?\))([+-]?)(\w+):/);
        if (message) {
            for (const alias of [message[1], message[3]]) {
                if (!participants.has(alias)) errors.push(`mensaje con participante no declarado: ${alias}`);
            }
            if (message[2] === '+') updateActivation(message[3], 1);
            if (message[2] === '-') updateActivation(message[1], -1);
        }
        const activation = text.match(/^(activate|deactivate)\s+(\w+)$/);
        if (activation) {
            const [, operation, alias] = activation;
            updateActivation(alias, operation === 'activate' ? 1 : -1);
        }
    }

    for (const fragment of fragments) errors.push(`fragmento sin cerrar: ${fragment}`);
    for (const [, fragment] of source.matchAll(/^\s*(alt|opt|loop|par|critical|break|rect|box)\b[^\n]*\n(?:[ \t]*(?:%%[^\n]*)?\n)*[ \t]*end\b/gm)) {
        errors.push(`fragmento vacío: ${fragment}`);
    }
    for (const [alias, depth] of activations) {
        if (depth > 0) errors.push(`activación sin cerrar: ${alias}`);
    }
    return errors;
};

// Short diagram labels retain source evidence in the adjacent participant table.
export const getSequenceParticipantSources = (body, sequence) => {
    const sources = new Map();
    const sourcePattern = /src\/[\w./-]+\.(?:js|ejs)/g;
    for (const match of sequence.matchAll(/^\s*participant\s+([^\s@]+)(?:@\{[^}]+\})?\s+as\s+(.+)$/gm)) {
        sources.set(match[1], [...new Set([
            ...(sources.get(match[1]) ?? []),
            ...(match[2].match(sourcePattern) ?? [])
        ])]);
    }
    const table = body.match(/## Participantes y trazabilidad\r?\n([\s\S]*?)(?=^## |(?![\s\S]))/m)?.[1] ?? '';
    for (const match of table.matchAll(/^\| `([^`]+)` \|[^|]+\|([^\n]+)\|$/gm)) {
        if (!sources.has(match[1])) continue;
        sources.set(match[1], [...new Set([
            ...sources.get(match[1]),
            ...(match[2].match(sourcePattern) ?? [])
        ])]);
    }
    return sources;
};

// Validate one diagram at a time: complementary levels can reuse a source file.
export const getSequenceLifelineErrors = (body, sequence, externalLabels = new Set()) => {
    const errors = [];
    const sources = getSequenceParticipantSources(body, sequence);
    const owners = new Map();
    for (const [, alias, label] of sequence.matchAll(/^\s*participant\s+([^\s@]+)(?:@\{[^}]+\})?\s+as\s+(.+)$/gm)) {
        const paths = sources.get(alias) ?? [];
        if (!paths.length && externalLabels.has(label)) continue;
        if (paths.length !== 1) {
            errors.push(`línea de vida ${alias} debe corresponder a un único archivo (encontrados: ${paths.length})`);
            continue;
        }
        const previous = owners.get(paths[0]);
        if (previous && previous !== alias) {
            errors.push(`archivo repetido en líneas de vida ${previous} y ${alias}: ${paths[0]}`);
        }
        owners.set(paths[0], alias);
    }
    return errors;
};
