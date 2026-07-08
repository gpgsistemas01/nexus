export const resolveServiceDatabaseUrl = ({
    nodeEnv = process.env.NODE_ENV,
    databaseUrl = process.env.DATABASE_URL,
    testDatabaseUrl = process.env.DATABASE_TEST_URL
} = {}) => (nodeEnv === 'test' ? testDatabaseUrl : databaseUrl);

export const resolveMigrationDatabaseUrl = ({
    nodeEnv = process.env.NODE_ENV,
    directUrl = process.env.DIRECT_URL,
    testDirectUrl = process.env.DIRECT_TEST_URL
} = {}) => (nodeEnv === 'test' ? testDirectUrl : directUrl);

export const resolveDatabaseUrl = resolveServiceDatabaseUrl;

const getResolvedUrl = (resolver, options, variableName) => {
    const databaseUrl = resolver(options);

    if (!databaseUrl) {
        throw new Error(
            `${variableName} no está definida. NODE_ENV=${options.nodeEnv ?? process.env.NODE_ENV}`
        );
    }

    return databaseUrl;
};

export const getDatabaseUrl = (options = {}) => getResolvedUrl(
    resolveServiceDatabaseUrl,
    options,
    (options.nodeEnv ?? process.env.NODE_ENV) === 'test' ? 'DATABASE_TEST_URL' : 'DATABASE_URL'
);

export const getMigrationDatabaseUrl = (options = {}) => getResolvedUrl(
    resolveMigrationDatabaseUrl,
    options,
    (options.nodeEnv ?? process.env.NODE_ENV) === 'test' ? 'DIRECT_TEST_URL' : 'DIRECT_URL'
);
