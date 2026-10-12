import { getSequenceParticipantSources } from './sequenceDiagramUtils.js';

export const getSequenceCodeReferenceFailures = ({ body = '', sequence, sourceContents, routes = [] }) => {
    const participants = getSequenceParticipantSources(body, sequence);
    const configurations = new Map(
        [...body.matchAll(/^\| `([^`]+)` \|[^|]+\|([^\n]+)\|$/gm)]
            .map(([, alias, cell]) => [alias, cell.match(/src\/[\w./-]+\.(?:js|ejs)/g) ?? []])
    );
    const bindings = [...body.matchAll(/^\| `([^`]+)` \| `([^`]+)` \| `([^`]+)` · `([\w$]+)\(\.\.\.\)` \|$/gm)];
    const failures = [];
    for (const [, , receiver, label] of sequence.matchAll(/^\s*(\w+)(?:->>|-\)|--\))\s*(\w+):\s*(.+)$/gm)) {
        const paths = participants.get(receiver) ?? [];
        const method = label.match(/(?:^|\s)([\w$]+(?:\.[\w$]+)*)\s*\(/)?.[1];
        if (paths.length && method) {
            const symbol = method.split('.').at(-1);
            const configured = bindings.some(([, publicName, owner, runtime, factory]) => (
                publicName === symbol && runtime === receiver
                && (configurations.get(owner) ?? []).some(file => new RegExp(`\\b${symbol}\\b`).test(sourceContents.get(file) ?? ''))
                && paths.some(file => new RegExp(`\\b${factory}\\b`).test(sourceContents.get(file) ?? ''))
            ));
            if (!configured && !paths.some(file => new RegExp(`\\b${symbol}\\b`).test(sourceContents.get(file) ?? ''))) {
                failures.push(`${receiver}: ${method} no está referenciado por ${paths.join(', ')}`);
            }
        }

        const requests = [...label.matchAll(/\b(GET|POST|PUT|PATCH|DELETE) (\/api\/[\w:/-]+)/g)];
        for (const [, httpMethod, route] of requests) {
            const registered = routes.filter(item => (
                item.method === httpMethod
                && new RegExp(`^${item.route.replace(/:[\w]+/g, '[^/]+')}$`).test(route)
            ));
            const routeFiles = paths.filter(file => file.startsWith('src/routes/api/'));
            if (!registered.length || routeFiles.length && !registered.some(item => routeFiles.includes(item.file))) {
                failures.push(`${receiver}: ${httpMethod} ${route} no coincide con las rutas API registradas del participante`);
            }
        }
    }
    return failures;
};
