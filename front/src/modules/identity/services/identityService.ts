import { apiClient } from '../../../shared/http/apiClient.js';
import { ApiError } from '../../../shared/http/apiError.js';
import { isRecord } from '../../../shared/utils/isRecord.js';
import { requestPage } from '../../../shared/http/pageRequest.js';
import { recordParams } from '../../../shared/http/recordParams.js';
import { readRecord, readText, confirmMutation } from '../../../shared/http/recordContract.js';
import { requestExcel } from '../../../shared/http/requestExcel.js';
import type {
    IdentityEntry,
    IdentityResource,
    IdentityTarget,
    PersonAccess,
    IdentityQuery,
} from '../identity.js';

const readAccesses = (value: unknown): PersonAccess[] => {
    if (!Array.isArray(value))
        throw new ApiError('No se recibieron las responsabilidades de la persona.');

    return value.map((access) => {
        if (!isRecord(access) || !isRecord(access.department) || !isRecord(access.role)) {
            throw new ApiError('Se recibió una responsabilidad incompleta. Actualiza el listado.');
        }

        return {
            departmentId: readText(access.department, 'id'),
            departmentName: readText(access.department, 'name'),
            roleId: readText(access.role, 'id'),
            roleName: readText(access.role, 'name'),
        };
    });
};

const optionalText = (value: unknown) => (typeof value === 'string' ? value : '');

const normalizeEntry = (resource: IdentityResource, value: unknown): IdentityEntry => {
    const row = readRecord(value);
    return {
        id: row.id,
        version: row.version,
        name: readText(row, resource === 'persons' ? 'fullName' : 'name'),
        personName: isRecord(row.person) ? readText(row.person, 'fullName') : '',
        departmentId: optionalText(row.departmentId),
        roleId: optionalText(row.roleId),
        departmentName: optionalText(row.departmentName),
        roleName: optionalText(row.roleName),
        accesses: resource === 'persons' ? readAccesses(row.accesses) : [],
    };
};

const paramsFor = (resource: IdentityResource, query: IdentityQuery) => {
    const params = recordParams(query);

    if (resource === 'persons') {
        params.set('includeAccesses', 'true');
        params.set('department', query.department);
        params.set('role', query.role);
        params.set('strictDepartmentFilter', String(!!query.department));
    }

    return params;
};

export const identityService = {
    async list(resource: IdentityResource, query: IdentityQuery, signal?: AbortSignal) {
        const result = await requestPage(
            `/api/admin/${resource}?${paramsFor(resource, query)}`,
            signal,
        );
        return { ...result, data: result.data.map((value) => normalizeEntry(resource, value)) };
    },
    async save(
        resource: IdentityResource,
        target: IdentityTarget,
        payload: Record<string, unknown>,
        signal: AbortSignal,
    ) {
        const suffix =
            target.action === 'create'
                ? ''
                : `/${encodeURIComponent(target.row.id)}${target.action === 'password' ? '/password' : ''}`;
        const result = await apiClient.request(`/api/admin/${resource}${suffix}`, {
            method: target.action === 'create' ? 'POST' : resource === 'persons' ? 'PUT' : 'PATCH',
            data: payload,
            signal,
        });
        const expected =
            target.action === 'password'
                ? 'UPDATED_USER_PASSWORD'
                : `${target.action === 'create' ? 'CREATED' : 'UPDATED'}_${resource === 'persons' ? 'PERSON' : 'USER'}`;
        confirmMutation(result, expected);
    },
    async export(resource: IdentityResource, query: IdentityQuery, signal: AbortSignal) {
        if (resource === 'persons' && query.role) {
            throw new Error(
                'Limpia el filtro de rol para exportar las responsabilidades por área.',
            );
        }

        return requestExcel(
            `/api/admin/reports/${resource}/excel?${paramsFor(resource, query)}`,
            signal,
        );
    },
};
