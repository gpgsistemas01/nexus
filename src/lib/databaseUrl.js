export const resolveDatabaseUrl = ({
    nodeEnv = process.env.NODE_ENV,
    databaseUrl = process.env.DATABASE_URL,
    testDatabaseUrl = process.env.DATABASE_TEST_URL
} = {}) => (nodeEnv === 'test' ? testDatabaseUrl : databaseUrl);

export const getDatabaseUrl = (options = {}) => {

    const databaseUrl = resolveDatabaseUrl(options);

    if (!databaseUrl) {
        throw new Error(
            `DATABASE_URL no está definida. NODE_ENV=${options.nodeEnv ?? process.env.NODE_ENV}`
        );
    }

    return databaseUrl;
};
