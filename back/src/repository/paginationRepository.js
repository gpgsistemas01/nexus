import { QUERY_BATCH_SIZES } from '../constants/pagination.js';

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

// El cursor conserva el último id leído. skip: 1 evita repetirlo en el siguiente bloque.
// La consulta debe seleccionar id y ordenar con id como desempate estable.
export const findBatches = async function* ({
    model,
    query,
    batchSize = QUERY_BATCH_SIZES.ROWS,
    fetchPage = query => model.findMany(query)
}) {
    let cursor;
    while (true) {
        const data = await fetchPage({
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
