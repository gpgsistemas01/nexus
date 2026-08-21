export const createReportApplication = request => async (...args) => {
    const response = await request(...args);

    return response.data;
};
