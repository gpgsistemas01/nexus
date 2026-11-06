export const buildClientReportData = async function* (rows) {
    yield ['Nombre'];
    for await (const row of rows) yield [row.name];
};
