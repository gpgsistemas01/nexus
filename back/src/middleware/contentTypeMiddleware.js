import { errorMap } from "../messages/codeMessages.js";

const checkContentType = (req, res, next, contentTypeRequired) => {

    if (req.method === 'GET' || !req.body || !Object.keys(req.body).length) return next();

    const contentType = req.headers['content-type'];

    if (!contentType || !contentType.includes(contentTypeRequired)) {

        return res.status(415).json({
            code: errorMap.message.INVALID_CONTENT_TYPE,
            contentType: contentTypeRequired
        });
    }

    next();
}

export const checkTypeContentFile = (req, res, next) => checkContentType(req, res, next, 'multipart/form-data');

export const checkTypeContentJson = (req, res, next) => checkContentType(req, res, next, 'application/json');

export const checkContentTypePlainText = (req, res, next) => checkContentType(req, res, next, 'text/plain');