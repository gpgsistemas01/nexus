import { beforeEach, describe, expect, it, vi } from 'vitest';

import { errorMap } from '../../../src/messages/codeMessages.js';
import { PERMISSIONS } from '../../../src/shared/constants/permissions.js';
import { DEPARTMENT_KEYS } from '../../../src/constants/departments.js';
import { ROLE_KEYS } from '../../../src/constants/roles.js';
import { getGrantedPermissions } from '../../../src/constants/permissions.js';

const { getLoggedUser, verifyAccessToken } = vi.hoisted(() => ({
    getLoggedUser: vi.fn(),
    verifyAccessToken: vi.fn()
}));

vi.mock('../../../src/services/admin/userService.js', () => ({ getLoggedUser }));
vi.mock('../../../src/services/jwtService.js', () => ({ verifyAccessToken }));
vi.mock('../../../src/services/authService.js', () => ({
    getNewRefreshToken: vi.fn(),
    loginUser: vi.fn()
}));

const { authorizeUserApi, authorizeUserWeb, verifyApiTokenRequired, verifyCookiesAuthTokenRequired } =
    await import('../../../src/middleware/authMiddleware.js');
const { getCurrentUser } = await import('../../../src/controllers/api/authController.js');

describe('authMiddleware authorization', () => {
    beforeEach(() => vi.clearAllMocks());

    it.each([PERMISSIONS.CLIENTS_PAGE_VIEW, PERMISSIONS.SUPPLIERS_PAGE_VIEW])(
        'reserva la página %s para Sistemas y mantiene las altas contextuales de Almacén', permission => {
            for (const roleKey of [ROLE_KEYS.AUXILIARY, ROLE_KEYS.COORDINATOR, ROLE_KEYS.WAREHOUSE_KEEPER]) {
                const req = { user: { permissions: getGrantedPermissions([{
                    roleKey, departmentKey: DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY
                }]) } };
                const res = { redirect: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() };
                const nextPage = vi.fn();
                authorizeUserWeb(permission)(req, res, nextPage);
                expect(res.redirect).toHaveBeenCalledWith('/error/404');
                expect(nextPage).not.toHaveBeenCalled();
                for (const allowed of [PERMISSIONS.CLIENTS_READ, PERMISSIONS.CLIENTS_CREATE,
                    PERMISSIONS.SUPPLIERS_READ, PERMISSIONS.SUPPLIERS_MANAGE]) {
                    const nextApi = vi.fn();
                    authorizeUserApi(allowed)(req, res, nextApi);
                    expect(nextApi).toHaveBeenCalledOnce();
                }
                expect(res.status).not.toHaveBeenCalled();
            }
            const req = { user: { permissions: getGrantedPermissions([{
                roleKey: ROLE_KEYS.SYSTEM_ADMIN, departmentKey: DEPARTMENT_KEYS.SYSTEMS
            }]) } };
            const res = { redirect: vi.fn() };
            const next = vi.fn();
            authorizeUserWeb(permission)(req, res, next);
            expect(next).toHaveBeenCalledOnce();
            expect(res.redirect).not.toHaveBeenCalled();
        }
    );

    it('loads the user once and reuses it for authorization and the current-user endpoint', async () => {
        const user = { id: 'user-1', permissions: [PERMISSIONS.MATERIALS_READ] };
        verifyAccessToken.mockReturnValue({ id: user.id });
        getLoggedUser.mockResolvedValue(user);
        const req = { cookies: { accessToken: 'valid-token' } };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        const next = vi.fn();

        await verifyApiTokenRequired(req, res, next);
        await authorizeUserApi(PERMISSIONS.MATERIALS_READ)(req, res, next);
        await getCurrentUser(req, res);

        expect(getLoggedUser).toHaveBeenCalledWith(user.id);
        expect(getLoggedUser).toHaveBeenCalledOnce();
        expect(req.userId).toBe(user.id);
        expect(req.user).toBe(user);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ user });
        expect(next).toHaveBeenCalledTimes(2);
    });

    it('rejects an API token when no active logged user is found', async () => {
        verifyAccessToken.mockReturnValue({ id: 'user-1' });
        getLoggedUser.mockResolvedValue(null);
        const req = { cookies: { accessToken: 'valid-token' } };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        const next = vi.fn();

        await verifyApiTokenRequired(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ code: errorMap.message.INVALID_AUTH });
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects a permission absent from req.user without reloading or reevaluating accesses', async () => {
        getLoggedUser.mockResolvedValue({
            id: 'user-1',
            permissions: [],
            accesses: [{
                roleKey: ROLE_KEYS.WAREHOUSE_KEEPER,
                departmentKey: DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY
            }]
        });
        const req = {
            userId: 'user-1',
            user: {
                id: 'user-1',
                permissions: [],
                accesses: [{
                    roleKey: ROLE_KEYS.WAREHOUSE_KEEPER,
                    departmentKey: DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY
                }]
            }
        };
        const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
        const next = vi.fn();

        await authorizeUserApi(PERMISSIONS.MATERIALS_READ)(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ code: errorMap.message.FORBIDDEN });
        expect(getLoggedUser).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('redirects web requests when a token has no active logged user', async () => {
        verifyAccessToken.mockReturnValue({ id: 'user-1' });
        getLoggedUser.mockResolvedValue(null);
        const req = { cookies: { accessToken: 'valid-token' } };
        const res = { redirect: vi.fn() };
        const next = vi.fn();

        await verifyCookiesAuthTokenRequired(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith('/error/404');
        expect(next).not.toHaveBeenCalled();
    });

    it('loads and assigns the user in the web token middleware', async () => {
        const user = { id: 'user-1', permissions: [PERMISSIONS.MATERIALS_READ] };
        verifyAccessToken.mockReturnValue({ id: user.id });
        getLoggedUser.mockResolvedValue(user);
        const req = { cookies: { accessToken: 'valid-token' } };
        const res = {};
        const next = vi.fn();

        await verifyCookiesAuthTokenRequired(req, res, next);

        expect(getLoggedUser).toHaveBeenCalledOnce();
        expect(req.userId).toBe(user.id);
        expect(req.user).toBe(user);
        expect(next).toHaveBeenCalledOnce();
    });
});
