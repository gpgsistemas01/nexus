import jwt from 'jsonwebtoken';
import { logInvalidToken } from '../utils/logger.js';

const JWT_SECRET_ACCESS = process.env.JWT_SECRET_ACCESS;
const JWT_SECRET_REFRESH = process.env.JWT_SECRET_REFRESH;

export const generateAccessToken = (payload) => {

    return jwt.sign(payload, JWT_SECRET_ACCESS, { expiresIn: '1h' });
}

export const generateRefreshToken = (payload) => {

    const token = jwt.sign(payload, JWT_SECRET_REFRESH, { expiresIn: '7d' });

    return token;
}

export const verifyToken = (token, secretAccess) => {

    try {

        return jwt.verify(token, secretAccess);

    } catch (err) {
        logInvalidToken(err);

        return null;
    }
}

export const verifyRefreshToken = (token) => verifyToken(token, JWT_SECRET_REFRESH);

export const verifyAccessToken = (token) => verifyToken(token, JWT_SECRET_ACCESS);
