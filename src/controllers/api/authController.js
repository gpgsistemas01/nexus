import { successCodeMessages } from "../../messages/codeMessages.js";
import { setAuthCookies } from "../../utils/cookiesUtils.js";
import { getNewRefreshToken, loginUser } from "../../services/authService.js";
import { getLoggedUser } from "../../services/admin/userService.js";
import { errorMap } from "../../messages/codeMessages.js";

export const login = async (req, res) => {

    const tokens = await loginUser(req.body);

    setAuthCookies(res, tokens.newAccessToken, tokens.newRefreshToken);

    return res.status(200).json({ code: successCodeMessages.SUCCESS_LOGIN });
}

export const refreshAuthToken = async (req, res) => {

    const { refreshToken } = req.cookies;
    const  tokens = await getNewRefreshToken({ refreshToken });

    setAuthCookies(res, tokens.newAccessToken, tokens.newRefreshToken);

    return res.sendStatus(200);
}

export const getCurrentUser = async (req, res) => {
    const user = await getLoggedUser(req.userId);

    if (!user) return res.status(401).json({ code: errorMap.message.INVALID_AUTH });

    return res.status(200).json({ user });
};
