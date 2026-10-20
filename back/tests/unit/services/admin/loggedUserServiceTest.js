import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findMany, findUnique, verifyPassword } = vi.hoisted(() => ({
    findMany: vi.fn(),
    findUnique: vi.fn(),
    verifyPassword: vi.fn()
}));

vi.mock('../../../../src/repository/baseRepository.js', () => ({
    getDb: () => ({
        user: { findUnique },
        userRoleDepartment: { findMany }
    })
}));
vi.mock('../../../../src/utils/encryptionUtils.js', () => ({
    encryptPassword: vi.fn(),
    verifyPassword
}));
vi.mock('../../../../src/utils/logger.js', () => ({
    createServiceLogger: vi.fn(() => ({})),
    logServiceError: vi.fn()
}));
vi.mock('../../../../src/services/admin/person/personService.js', () => ({
    findPersonById: vi.fn()
}));

const { getLoggedUser, getUserIdByLogin } =
    await import('../../../../src/services/admin/userService.js');

describe('getLoggedUser active access assignments', () => {
    beforeEach(() => vi.clearAllMocks());

    it('queries only active account, person, role, and department assignments', async () => {
        findMany.mockResolvedValue([{
            user: { id: 'user-1', name: 'warehouse-user' },
            role: { id: 'role-1', key: 'warehouse_keeper', name: 'Etiqueta de rol' },
            department: { id: 'department-1', key: 'warehouse_and_supply', name: 'Etiqueta de área' }
        }]);

        const user = await getLoggedUser('user-1');

        expect(findMany).toHaveBeenCalledWith({
            where: {
                userId: 'user-1',
                user: {
                    isActive: true,
                    OR: [
                        { personId: null },
                        { person: { is: { isActive: true } } }
                    ]
                },
                role: { is: { isActive: true } },
                department: { is: { isActive: true } }
            },
            select: {
                user: { select: { id: true, name: true } },
                role: { select: { id: true, key: true, name: true } },
                department: { select: { id: true, key: true, name: true } }
            }
        });
        expect(user.accesses).toEqual([{
            roleId: 'role-1',
            roleKey: 'warehouse_keeper',
            role: 'Etiqueta de rol',
            departmentId: 'department-1',
            departmentKey: 'warehouse_and_supply',
            department: 'Etiqueta de área'
        }]);
        expect(user.permissions).toContain('materials:write');
        expect(user.scope).toEqual({
            canReadAll: false,
            departmentIds: ['department-1']
        });
        expect(user.organization).toEqual({
            isCoordinator: false,
            isWarehouse: true,
            isSystem: false,
            isSales: false
        });
    });

    it('grants authorization from catalog keys without depending on editable labels', async () => {
        findMany.mockResolvedValue([{
            user: { id: 'user-1', name: 'warehouse-user' },
            role: { id: 'role-1', key: 'warehouse_keeper', name: 'Renamed role' },
            department: { id: 'department-1', key: 'warehouse_and_supply', name: 'Renamed department' }
        }]);

        const user = await getLoggedUser('user-1');

        expect(user.permissions).toContain('materials:write');
        expect(user.organization.isWarehouse).toBe(true);
    });

    it('returns no logged user when every assignment has an inactive role or department', async () => {
        findMany.mockResolvedValue([]);

        await expect(getLoggedUser('user-1')).resolves.toBeNull();
        expect(findMany).toHaveBeenCalledOnce();
    });

    it('requires an active role and department assignment before accepting login', async () => {
        findUnique.mockResolvedValue({
            id: 'user-1',
            password: 'hashed-password',
            isActive: true,
            personId: null,
            person: null,
            accesses: [{ userId: 'user-1' }]
        });
        verifyPassword.mockResolvedValue(true);

        await expect(getUserIdByLogin('warehouse-user', 'password'))
            .resolves.toBe('user-1');
        expect(findUnique).toHaveBeenCalledWith(expect.objectContaining({
            select: expect.objectContaining({
                accesses: {
                    where: {
                        role: { is: { isActive: true } },
                        department: { is: { isActive: true } }
                    },
                    select: { userId: true },
                    take: 1
                }
            })
        }));
    });

    it('rejects login when the user has no assignments with an active role and department', async () => {
        findUnique.mockResolvedValue({
            id: 'user-1',
            password: 'hashed-password',
            isActive: true,
            personId: null,
            person: null,
            accesses: []
        });

        await expect(getUserIdByLogin('warehouse-user', 'password')).resolves.toBeNull();
        expect(verifyPassword).not.toHaveBeenCalled();
    });
});
