import { createUserDtoForToken } from "../dtos/userDTO.js";
import { loginError, authError } from "../errors/authError.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "./jwtService.js";
import { getLoggedUser, getUserIdByLogin } from "./admin/userService.js";

export const loginUser = async ({ name, password }) => {

    const userId = await getUserIdByLogin(name, password);

    if (!userId) throw new loginError();

    const tokenDto = createUserDtoForToken(userId);
    const newRefreshToken = generateRefreshToken(tokenDto);
    const newAccessToken = generateAccessToken(tokenDto);
    return {
        newAccessToken,
        newRefreshToken
    };
}

export const getNewRefreshToken = async ({ refreshToken }) => {

    if (!refreshToken) throw new authError();

    const tokenInfo = verifyRefreshToken(refreshToken);

    if (!tokenInfo) throw new authError();

    const { id } = tokenInfo;
    const user = await getLoggedUser(id);

    if (!user) throw new authError();

    const tokenDto = createUserDtoForToken(id);
    const newAccessToken = generateAccessToken(tokenDto);
    const newRefreshToken = generateRefreshToken(tokenDto);

    return {
        newAccessToken,
        newRefreshToken
    };
}
