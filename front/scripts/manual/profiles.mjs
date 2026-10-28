import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { getGrantedPermissions } from '../../../back/src/constants/permissions.js';
import { DEPARTMENT_KEYS } from '../../../back/src/constants/departments.js';
import { ROLE_KEYS } from '../../../back/src/constants/roles.js';

export const DEMO_PROFILES = [
    {
        id: 'sistemas-admin',
        label: 'Administración del sistema',
        roleKey: ROLE_KEYS.SYSTEM_ADMIN,
        departmentKey: DEPARTMENT_KEYS.SYSTEMS,
    },
    {
        id: 'almacen-auxiliar',
        label: 'Almacén · Auxiliar',
        roleKey: ROLE_KEYS.AUXILIARY,
        departmentKey: DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY,
    },
    {
        id: 'almacen-coordinador',
        label: 'Almacén · Coordinador',
        roleKey: ROLE_KEYS.COORDINATOR,
        departmentKey: DEPARTMENT_KEYS.WAREHOUSE_AND_SUPPLY,
    },
    ...[
        ['impresion', 'Impresión', DEPARTMENT_KEYS.PRINTING],
        ['taller-herreria', 'Taller/Herrería', DEPARTMENT_KEYS.WORKSHOP_3D],
        ['router', 'Router', DEPARTMENT_KEYS.ROUTER],
        ['pt', 'PT', DEPARTMENT_KEYS.PT_TRAFFIC],
        ['instalaciones', 'Instalaciones', DEPARTMENT_KEYS.INSTALLATIONS],
        ['acabados', 'Acabados', DEPARTMENT_KEYS.FINISHING],
    ].flatMap(([id, label, departmentKey]) => {
        const operationalRole =
            departmentKey === DEPARTMENT_KEYS.INSTALLATIONS
                ? { id: 'instalador', label: 'Instalador', key: ROLE_KEYS.INSTALLER }
                : { id: 'operador', label: 'Operador', key: ROLE_KEYS.OPERATOR };
        return [
            {
                id: `${id}-coordinador`,
                label: `${label} · Coordinador`,
                roleKey: ROLE_KEYS.COORDINATOR,
                departmentKey,
            },
            {
                id: `${id}-${operationalRole.id}`,
                label: `${label} · ${operationalRole.label}`,
                roleKey: operationalRole.key,
                departmentKey,
            },
        ];
    }),
];

export const validProfileId = (id) =>
    typeof id === 'string' && /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(id);

const departmentLabels = {
    systems: 'SISTEMAS',
    warehouse_and_supply: 'ALMACÉN Y PROVEDURÍA',
    printing: 'IMPRESIÓN',
    workshop_3d: 'TALLER 3D',
    router: 'ROUTER',
    pt_traffic: 'PT/TRÁFICO',
    installations: 'INSTALACIONES',
    finishing: 'ACABADOS',
};

const roleLabels = {
    system_admin: 'Administrador del sistema',
    coordinator: 'Coordinador',
    auxiliary: 'Auxiliar',
    operator: 'Operador',
    installer: 'Instalador',
};

export const demoSession = (profile) => {
    const accesses = [
        {
            roleKey: profile.roleKey,
            role: roleLabels[profile.roleKey],
            departmentKey: profile.departmentKey,
            departmentId: 'manual-department',
            department: departmentLabels[profile.departmentKey],
        },
    ];
    return {
        id: '88888888-8888-4888-8888-888888888888',
        name: profile.id,
        permissions: getGrantedPermissions(accesses),
        accesses,
    };
};

export const readAccounts = async (filename) => {
    let value;
    try {
        value = JSON.parse(await readFile(filename, 'utf8'));
    } catch {
        throw new Error(
            'No se pudo leer la configuración JSON de cuentas. Revise el archivo local.',
        );
    }
    const ids = new Set();
    if (!Array.isArray(value.accounts) || !value.accounts.length)
        throw new Error('La configuración debe declarar accounts.');
    let baseUrl;
    try {
        baseUrl = new URL(value.baseUrl);
    } catch {
        throw new Error('baseUrl debe ser un origen HTTP local o HTTPS válido.');
    }
    if (
        baseUrl.username ||
        baseUrl.password ||
        baseUrl.search ||
        baseUrl.hash ||
        baseUrl.pathname !== '/'
    )
        throw new Error('baseUrl debe ser un origen sin credenciales, ruta ni parámetros.');
    if (
        baseUrl.protocol !== 'https:' &&
        !(
            baseUrl.protocol === 'http:' &&
            ['localhost', '127.0.0.1', '[::1]'].includes(baseUrl.hostname)
        )
    )
        throw new Error('Use HTTPS o HTTP en localhost para la captura de cuentas.');
    for (const account of value.accounts) {
        if (
            !validProfileId(account.id) ||
            ids.has(account.id) ||
            typeof account.label !== 'string' ||
            !account.label.trim() ||
            [...account.label].some((character) => '\r\n<>|[]`*_'.includes(character))
        )
            throw new Error('Cada cuenta necesita un id único seguro y una etiqueta de una línea.');
        ids.add(account.id);
        for (const key of ['usernameEnv', 'passwordEnv'])
            if (!/^DOCS_FRONT_[A-Z0-9_]+$/.test(account[key] ?? ''))
                throw new Error(`Declare referencias DOCS_FRONT_* para ${account.id}.`);
        if (
            account.expectedAccess &&
            (!/^[a-z_]+$/.test(account.expectedAccess.roleKey ?? '') ||
                !/^[a-z0-9_]+$/.test(account.expectedAccess.departmentKey ?? ''))
        )
            throw new Error('expectedAccess debe identificar un rol y área por sus claves.');
        if ('password' in account || 'username' in account || 'storageState' in account)
            throw new Error(
                'La configuración sólo admite referencias a credenciales, no sus valores.',
            );
    }
    return { baseUrl: baseUrl.origin, accounts: value.accounts };
};

export const verifyConfiguredAccess = (account, session) => {
    if (
        account.expectedAccess &&
        !(session.accesses ?? []).some(
            (access) =>
                access.roleKey === account.expectedAccess.roleKey &&
                access.departmentKey === account.expectedAccess.departmentKey,
        )
    )
        throw new Error(
            `La cuenta no coincide con el área y rol declarados para ${account.id}. Revise la configuración local.`,
        );
};

export const readCredentials = async (account, envFile, environment = process.env) => {
    let local = {};
    if (envFile) {
        try {
            local = parseEnv(await readFile(envFile, 'utf8'));
        } catch (error) {
            if (error.code !== 'ENOENT')
                // eslint-disable-next-line preserve-caught-error -- El error original puede incluir valores del archivo de credenciales.
                throw new Error('No se pudo leer el archivo local de credenciales.');
        }
    }
    const name = environment[account.usernameEnv] ?? local[account.usernameEnv];
    const password = environment[account.passwordEnv] ?? local[account.passwordEnv];
    if (!name?.trim() || !password)
        throw new Error(
            `Faltan ${account.usernameEnv} y/o ${account.passwordEnv} para ${account.id}.`,
        );
    return { name: name.trim(), password };
};
