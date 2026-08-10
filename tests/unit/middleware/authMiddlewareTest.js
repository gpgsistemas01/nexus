import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getLoggedUser } = vi.hoisted(() => ({
    getLoggedUser: vi.fn()
}));

vi.mock('../../../src/services/admin/userService.js', () => ({ getLoggedUser }));
vi.mock('../../../src/services/jwtService.js', () => ({ verifyAccessToken: vi.fn() }));

const { authorizeUserApi } = await import('../../../src/middleware/authMiddleware.js');
const { PERMISSIONS } = await import('../../../src/constants/permissions.js');

const createResponse = () => ({
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis()
});

describe('authorizeUserApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('no concede acceso GET global por tener el rol Director', async () => {
        getLoggedUser.mockResolvedValue({
            accesses: [{ role: 'Director', department: 'DIRECCIÓN' }]
        });
        const req = { method: 'GET', userId: 'user-id' };
        const res = createResponse();
        const next = vi.fn();

        await authorizeUserApi(PERMISSIONS.MOVEMENTS_READ)(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('concede lectura al Director cuando el recurso lo declara explícitamente', async () => {
        const user = {
            accesses: [{ role: 'Director', department: 'DIRECCIÓN' }]
        };
        getLoggedUser.mockResolvedValue(user);
        const req = { method: 'GET', userId: 'user-id' };
        const res = createResponse();
        const next = vi.fn();

        await authorizeUserApi(PERMISSIONS.PERSONS_READ)(req, res, next);

        expect(req.user).toBe(user);
        expect(next).toHaveBeenCalledOnce();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('tampoco concede acceso HEAD global por pertenecer a Dirección', async () => {
        getLoggedUser.mockResolvedValue({
            accesses: [{ role: 'Contador', department: 'DIRECCIÓN' }]
        });
        const req = { method: 'HEAD', userId: 'user-id' };
        const res = createResponse();
        const next = vi.fn();

        await authorizeUserApi(PERMISSIONS.MOVEMENTS_READ)(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});
