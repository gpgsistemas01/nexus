export const assertManualDevelopment = (nodeEnv = process.env.NODE_ENV) => {
    if (nodeEnv && !['development', 'test'].includes(nodeEnv))
        throw new Error(
            'La generación de manuales es sólo para desarrollo; NODE_ENV no puede ser production.',
        );
};

export const parseManualMode = (mode = 'dev') => {
    if (!['dev', 'demo'].includes(mode)) throw new Error('Use --mode dev o --mode demo.');
    return mode;
};

export const parseManualBaseUrl = (value) => {
    let baseUrl;
    try {
        baseUrl = new URL(value);
    } catch {
        throw new Error('baseUrl debe ser un origen HTTP o HTTPS local de desarrollo.');
    }
    if (
        baseUrl.username ||
        baseUrl.password ||
        baseUrl.search ||
        baseUrl.hash ||
        baseUrl.pathname !== '/'
    )
        throw new Error('baseUrl debe ser un origen sin credenciales, ruta ni parámetros.');
    if (
        !['http:', 'https:'].includes(baseUrl.protocol) ||
        !['localhost', '127.0.0.1', '[::1]'].includes(baseUrl.hostname)
    )
        throw new Error(
            'Las capturas son sólo de desarrollo local: use localhost, 127.0.0.1 o [::1].',
        );
    return baseUrl.origin;
};

export const createManualWebServer = ({ mode, baseUrl }) => {
    const url = new URL(parseManualBaseUrl(baseUrl));
    if (url.protocol !== 'http:') return undefined;

    const host = url.hostname === '[::1]' ? '::1' : url.hostname;
    return {
        command: `npm run dev -- --host ${host} --port ${url.port || '80'}`,
        url: url.origin,
        reuseExistingServer: mode === 'dev',
        timeout: 60_000,
    };
};
