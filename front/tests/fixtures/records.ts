import { user } from './inventory.js';
import type { IdentityEntry } from '../../src/modules/identity/identity.js';
import type { DirectoryEntry } from '../../src/modules/directory/directory.js';
export const recordIds = {
  person: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  department: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  role: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  secondDepartment: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  secondRole: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  client: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
};
export const departments = [
  { id: recordIds.department, name: 'ALMACÉN' },
  { id: recordIds.secondDepartment, name: 'VENTAS' },
];
export const roles = [
  { id: recordIds.role, name: 'COORDINADOR' },
  { id: recordIds.secondRole, name: 'OPERADOR' },
];
export const personData = {
  id: recordIds.person,
  version: 4,
  fullName: 'Ana Pérez',
  accesses: [
    { department: departments[0]!, role: roles[0]! },
    { department: departments[1]!, role: roles[1]! },
  ],
};
export const accountData = {
  id: user.id,
  version: 7,
  name: 'ana',
  personId: recordIds.person,
  person: { fullName: 'Ana Pérez' },
  departmentId: recordIds.department,
  departmentName: 'ALMACÉN',
  roleId: recordIds.role,
  roleName: 'COORDINADOR',
  accesses: [],
};
export const clientData = {
  id: recordIds.client,
  version: 3,
  name: 'Cliente Central',
  isActive: true,
};
export const supplierData = {
  id: '22222222-2222-4222-8222-222222222222',
  version: 6,
  tradeName: 'Proveedor Central',
  legalName: 'Proveedor Central SA',
  isActive: true,
};
export const personEntry: IdentityEntry = {
  id: personData.id,
  version: personData.version,
  name: personData.fullName,
  personName: '',
  departmentId: '',
  departmentName: '',
  roleId: '',
  roleName: '',
  accesses: personData.accesses.map((access) => ({
    departmentId: access.department.id,
    departmentName: access.department.name,
    roleId: access.role.id,
    roleName: access.role.name,
  })),
};
export const accountEntry: IdentityEntry = {
  id: accountData.id,
  version: accountData.version,
  name: accountData.name,
  personName: accountData.person.fullName,
  departmentId: accountData.departmentId,
  departmentName: accountData.departmentName,
  roleId: accountData.roleId,
  roleName: accountData.roleName,
  accesses: [],
};
export const clientEntry: DirectoryEntry = { ...clientData, legalName: '', tradeName: '' };
export const supplierEntry: DirectoryEntry = { ...supplierData, name: supplierData.tradeName };
export const recordPermissions = [
  'persons:page-view',
  'persons:read',
  'persons:write',
  'person:reports-read',
  'users:manage',
  'admin:reports-read',
  'departments:read',
  'roles:read',
  'clients:page-view',
  'clients:read',
  'clients:create',
  'clients:update',
  'client:reports-read',
  'suppliers:page-view',
  'suppliers:read',
  'suppliers:manage',
  'suppliers:update',
  'supplier:reports-read',
  'catalogs:manage',
];
