import { verifyAccessToken } from "../services/jwtService.js";
import { errorMap } from "../messages/codeMessages.js";
import { clearAccessCookie } from "../utils/cookiesUtils.js";
import { getLoggedUser } from "../services/admin/userService.js";
import { hasSystemWideReadAccess } from "../utils/authorizationUtils.js";
import { getAuthorizationPolicy } from "../constants/permissions.js";

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

export const verifyCookiesAuthTokenRequired = (req, res, next) => {

    const tokenInfo = getAuthTokenInfo(req, res);

    if (!tokenInfo) {

        res.cookie('returnTo', req.originalUrl, { httpOnly: true });

        return res.redirect('/revocar-sesion');
    }

    req.userId = tokenInfo.id;

    next();
}

export const verifyApiTokenRequired = (req, res, next) => {

    const tokenInfo = getAuthTokenInfo(req, res);

    if (!tokenInfo) return res.status(401).json({ code: errorMap.message.INVALID_AUTH });

    req.userId = tokenInfo.id;
    next();
}

const createAuthorizeMiddleware = (
    forbiddenHandler,
    invalidAuthHandler = forbiddenHandler
) => (permission) => async (req, res, next) => {

    const user = await getLoggedUser(req.userId);

    if (!user) return invalidAuthHandler(req, res);

    const policy = getAuthorizationPolicy(permission);

    const hasReadAccessToAll = ['GET', 'HEAD'].includes(req.method)
        && hasSystemWideReadAccess(user);
    const hasAccess = hasReadAccessToAll || user.accesses.some(access =>
        policy.departments.includes(access.department) &&
        policy.roles.includes(access.role)
    );

    if (!hasAccess) return forbiddenHandler(req, res);

    req.user = user;
    next();
};

export const authorizeUserApi = createAuthorizeMiddleware(
    (req, res) => res.status(403).json({ code: errorMap.message.FORBIDDEN }),
    (req, res) => res.status(401).json({ code: errorMap.message.INVALID_AUTH })
);

export const authorizeUserWeb = createAuthorizeMiddleware((req, res) =>
    res.redirect('/error/404')
);
