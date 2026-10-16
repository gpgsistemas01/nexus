import { verifyAccessToken } from "../services/jwtService.js";
import { errorMap } from "../messages/codeMessages.js";
import { clearAccessCookie } from "../utils/cookiesUtils.js";
import { getLoggedUser } from "../services/admin/userService.js";

const loadAuthenticatedUser = async (req, userId) => {
    const user = await getLoggedUser(userId);

    if (user) {
        req.userId = user.id;
        req.user = user;
    }

    return user;
};

export const getAuthTokenInfo = (req, res) => {

    const { accessToken } = req.cookies;

    if (!accessToken) {

        clearAccessCookie(res);
        return null;
    }

    const tokenInfo = verifyAccessToken(accessToken);

    if (!tokenInfo) {

        clearAccessCookie(res);
        return null;
    }

    return tokenInfo;
}

export const verifyCookiesAuthTokenRequired = async (req, res, next) => {

    const tokenInfo = getAuthTokenInfo(req, res);

    if (!tokenInfo) {

        res.cookie('returnTo', req.originalUrl, { httpOnly: true });

        return res.redirect('/revocar-sesion');
    }

    const user = await loadAuthenticatedUser(req, tokenInfo.id);

    if (!user) return res.redirect('/error/404');

    next();
}

export const verifyApiTokenRequired = async (req, res, next) => {

    const tokenInfo = getAuthTokenInfo(req, res);

    if (!tokenInfo) return res.status(401).json({ code: errorMap.message.INVALID_AUTH });

    const user = await loadAuthenticatedUser(req, tokenInfo.id);

    if (!user) return res.status(401).json({ code: errorMap.message.INVALID_AUTH });

    next();
}

const createAuthorizeMiddleware = (
    forbiddenHandler,
    invalidAuthHandler = forbiddenHandler
) => (permission) => (req, res, next) => {

    const user = req.user;

    if (!user) return invalidAuthHandler(req, res);

    if (!user.permissions.includes(permission)) return forbiddenHandler(req, res);

    next();
};

export const authorizeUserApi = createAuthorizeMiddleware(
    (req, res) => res.status(403).json({ code: errorMap.message.FORBIDDEN }),
    (req, res) => res.status(401).json({ code: errorMap.message.INVALID_AUTH })
);

export const authorizeUserWeb = createAuthorizeMiddleware((req, res) =>
    res.redirect('/error/404')
);
