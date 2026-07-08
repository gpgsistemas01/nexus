export const resolveDatabaseUrl = ({
    nodeEnv = process.env.NODE_ENV,
    databaseUrl = process.env.DATABASE_URL,
    testDatabaseUrl = process.env.DATABASE_TEST_URL,
    directUrl = process.env.DIRECT_URL,
    preferDirectUrl = false
} = {}) => {
    if (nodeEnv === 'test') {
        return testDatabaseUrl;
    }

    if (preferDirectUrl && directUrl) {
        return directUrl;
    }

    return databaseUrl;
};

export const getDatabaseUrl = (options = {}) => {

    const databaseUrl = resolveDatabaseUrl(options);

    if (!databaseUrl) {
        throw new Error(
            `DATABASE_URL no está definida. NODE_ENV=${options.nodeEnv ?? process.env.NODE_ENV}`
        );
    }

    return databaseUrl;
};
