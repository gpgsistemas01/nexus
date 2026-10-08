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
    for (const [alias, depth] of activations) {
        if (depth > 0) errors.push(`activación sin cerrar: ${alias}`);
    }
    return errors;
};
