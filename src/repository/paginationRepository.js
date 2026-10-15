// Recibe el modelo del cliente elegido por el servicio; no crea otro cliente ni transacción.
export const findPage = async ({ model, query, totalWhere, hasFilters = true, includeCounts = true }) => {
    const dataQuery = model.findMany(query);
    if (!includeCounts) return { data: await dataQuery };

    // Convertir PrismaPromise en Promise permite compartir un único conteo entre ambos resultados.
    const totalQuery = Promise.resolve(totalWhere === undefined ? model.count() : model.count({ where: totalWhere }));
    const [data, recordsTotal, recordsFiltered] = await Promise.all([
        dataQuery,
        totalQuery,
        hasFilters ? model.count({ where: query.where }) : totalQuery
    ]);

    return { data, recordsTotal, recordsFiltered };
};

// La consulta debe seleccionar id y ordenar con id como desempate estable.
export const findBatches = async function* ({ model, query, batchSize = 5000 }) {
    let cursor;
    while (true) {
        const data = await model.findMany({
            ...query,
            take: batchSize,
            ...(cursor && { cursor: { id: cursor }, skip: 1 })
        });
        if (!data.length) return;

        yield data;
        if (data.length < batchSize) return;
        cursor = data.at(-1).id;
    }
};
