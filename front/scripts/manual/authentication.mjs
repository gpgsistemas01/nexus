import { successCodeMessages } from '../../../back/src/shared/constants/apiSuccessCodes.js';

const statusHint = (status) => {
    if (status === 400) return 'Revise el formato del usuario y la contraseña de esa cuenta.';
    if (status === 401) return 'Usuario o contraseña incorrectos, o cuenta inactiva.';
    if (status === 403) return 'La API rechazó el acceso de la cuenta.';
    if (status === 404 || status === 405 || (status >= 300 && status < 400))
        return 'Revise baseUrl y el proxy /api de Vue; la ruta de login no respondió como API.';
    if (status === 429)
        return 'Se alcanzó el límite de intentos. Espere antes de volver a ejecutar.';
    if ([502, 503, 504].includes(status))
        return 'La API o el proxy no están disponibles. Compruebe Vue, back y sus puertos.';
    return 'Revise el log de la API en ese momento, incluida su conexión con la base de datos.';
};

const connectionHint = (cause) => {
    const message = cause instanceof Error ? cause.message : '';
    const code = ['ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND', 'ETIMEDOUT'].find((value) =>
        message.includes(value),
    );
    if (code) return `${code}. Compruebe baseUrl, Vue, el proxy y la API.`;
    return 'No se recibió una respuesta HTTP. Compruebe baseUrl y los servicios locales.';
};

export const authenticateManualAccount = async (request, accountId, credentials) => {
    let response;
    try {
        response = await request.post('/api/auth/login', {
            data: credentials,
            maxRedirects: 0,
            timeout: 15_000,
        });
    } catch (cause) {
        // eslint-disable-next-line preserve-caught-error -- La causa original puede incluir credenciales y cookies.
        throw new Error(`No se pudo autenticar ${accountId}: ${connectionHint(cause)}`);
    }

    if (!response.ok())
        throw new Error(
            `No se pudo autenticar ${accountId}: HTTP ${response.status()}. ${statusHint(response.status())}`,
        );

    let body;
    try {
        body = await response.json();
    } catch {
        body = null;
    }
    if (body?.code !== successCodeMessages.SUCCESS_LOGIN)
        throw new Error(
            `No se pudo autenticar ${accountId}: respuesta de login no válida. Revise baseUrl y el proxy /api de Vue.`,
        );
};
