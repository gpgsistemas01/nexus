import type { RecordQuery } from '../../shared/list.js';
import { PERMISSIONS } from '@nexus/permissions';

export interface IdentityQuery extends RecordQuery {
    department: string;
    role: string;
}

export type IdentityResource = 'persons' | 'users';
export interface PersonAccess {
    departmentId: string;
    roleId: string;
    departmentName: string;
    roleName: string;
}
export interface IdentityEntry {
    id: string;
    version: number;
    name: string;
    personName: string;
    departmentId: string;
    roleId: string;
    departmentName: string;
    roleName: string;
    accesses: PersonAccess[];
}
export interface PersonValues {
    fullName: string;
    accesses: PersonAccess[];
}
export interface UserValues {
    name: string;
    password: string;
    departmentId: string;
    roleId: string;
}
export type UserField = keyof UserValues;
export type PersonTarget = { action: 'create' } | { action: 'edit'; row: IdentityEntry };
export type IdentityTarget = PersonTarget | { action: 'password'; row: IdentityEntry };

export const IDENTITY_CONFIG = {
    persons: {
        title: 'Personas',
        createLabel: 'Nueva persona',
        read: PERMISSIONS.PERSONS_READ,
        write: PERMISSIONS.PERSONS_WRITE,
        report: PERMISSIONS.PERSON_REPORTS_READ,
    },
    users: {
        title: 'Usuarios',
        createLabel: 'Nuevo usuario',
        read: PERMISSIONS.USERS_MANAGE,
        write: PERMISSIONS.USERS_MANAGE,
        report: PERMISSIONS.ADMIN_REPORTS_READ,
    },
} as const;

export const personPayload = (target: PersonTarget, values: PersonValues) => ({
    fullName: values.fullName.trim(),
    accesses: values.accesses.map(({ departmentId, roleId }) => ({ departmentId, roleId })),
    ...(target.action !== 'create' ? { expectedVersion: target.row.version } : {}),
});

export const userPayload = (target: IdentityTarget, values: UserValues) =>
    target.action === 'password'
        ? { password: values.password, expectedVersion: target.row.version }
        : {
              name: values.name.trim(),
              departmentId: values.departmentId,
              roleId: values.roleId,
              ...(target.action === 'create'
                  ? { password: values.password }
                  : { expectedVersion: target.row.version }),
          };
