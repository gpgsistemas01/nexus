export const createReportApplication = request => async function exportReport(...args) {
    const response = await request(...args);

    return response.data;
};
