const TEST_ENV = 'test';

const isTestEnvironment = (nodeEnv) => nodeEnv === TEST_ENV;

const getEnvironmentOptions = () => ({
    nodeEnv: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL,
    databaseTestUrl: process.env.DATABASE_TEST_URL,
    databaseUrlDirect: process.env.DATABASE_URL_DIRECT,
    directUrl: process.env.DIRECT_URL
});

const hasExplicitOptions = (options) => options && Object.keys(options).length > 0;

export const resolveDatabaseUrl = (options) => {

    const {
        nodeEnv,
        databaseUrl,
        databaseTestUrl,
        databaseUrlDirect,
        directUrl
    } = hasExplicitOptions(options) ? options : getEnvironmentOptions();

    if (isTestEnvironment(nodeEnv)) {
        return databaseTestUrl;
    }

    return databaseUrl || databaseUrlDirect || directUrl;
};

export const getDatabaseUrl = (options = {}) => {

    const databaseUrl = resolveDatabaseUrl(options);

    if (!databaseUrl) {
        const envName = isTestEnvironment(options.nodeEnv ?? process.env.NODE_ENV)
            ? 'DATABASE_TEST_URL'
            : 'DATABASE_URL';

        throw new Error(`${ envName } is required to connect to the database.`);
    }

    return databaseUrl;
};
