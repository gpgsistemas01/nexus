const routeCall = /\brouter\.(get|post|put|patch|delete)\(\s*/g;
const literalPath = /^(['"`])([^'"`]*?)\1/;

const readPath = value => {
    const match = value.match(literalPath);
    if (!match || match[2].includes('${')) {
        throw new Error('El inventario requiere rutas literales; la declaración encontrada no puede resolverse estáticamente.');
    }
    return { route: match[2], length: match[0].length };
};

export const getExpressRouteDeclarations = source => {
    const routes = [];
    for (const match of source.matchAll(routeCall)) {
        let remaining = source.slice(match.index + match[0].length);
        const method = match[1].toUpperCase();
        if (!remaining.startsWith('[')) {
            routes.push({ method, route: readPath(remaining).route });
            continue;
        }

        remaining = remaining.slice(1).trimStart();
        let count = 0;
        while (!remaining.startsWith(']')) {
            const { route, length } = readPath(remaining);
            routes.push({ method, route });
            count++;
            remaining = remaining.slice(length).trimStart();
            if (remaining.startsWith(',')) remaining = remaining.slice(1).trimStart();
            else if (!remaining.startsWith(']')) throw new Error('Arreglo de rutas inválido en el inventario Express.');
        }
        if (!count) throw new Error('El inventario Express no admite arreglos de rutas vacíos.');
    }
    return routes;
};
