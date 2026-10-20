export const redirectWithFlash = (res, message, code, type, path = '/inicio-sesion') => {

    let flash = {
        message,
        code,
        type
    }

    res.cookie('flash', flash, { maxAge: 5000, httpOnly: true });
    return res.redirect(path);
}