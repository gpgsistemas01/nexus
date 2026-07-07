const isProduction = () => process.env.NODE_ENV === 'production';

const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: 'lax'
});

const getClearAuthCookieOptions = () => {
  const { httpOnly, ...clearOptions } = getAuthCookieOptions();
  return clearOptions;
};

export const setAuthCookies = (res, accessToken, refreshToken) => {
  const authCookieOptions = getAuthCookieOptions();

  res.cookie('accessToken', accessToken, {
    ...authCookieOptions,
    maxAge: 60 * 60 * 1000
  });

  res.cookie('refreshToken', refreshToken, {
    ...authCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export const clearAccessCookie = (res) => {
  res.clearCookie('accessToken', getClearAuthCookieOptions());
}

export const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', getClearAuthCookieOptions());
}

export const clearAuthCookies = (res) => {
  clearAccessCookie(res);
  clearRefreshCookie(res);
}
