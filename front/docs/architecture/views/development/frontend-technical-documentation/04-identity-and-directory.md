# 4. Personas, usuarios, clientes y proveedores

## Propósito y fuentes

Referencia de responsabilidades y contratos del dominio `identity / directory`. El [corte de componentes](../../logical/components/04-identity-directory.md) muestra sus colaboradores; las secuencias siguientes explican el proceso y sus decisiones. Los objetivos están en el [catálogo de casos](../../../../requirements/use-cases/index.md).

## Responsabilidades

| Propietario | Responsabilidad |
| --- | --- |
| `IdentityPage` | Consulta y operaciones separadas de persona/cuenta. |
| `usePersonEditor` | Nombre, responsabilidades de área/rol y edición versionada. |
| `useUserEditor` | Alta/edición/cambio de clave con esquema y payload específicos. |
| `DirectoryPage` / `useDirectoryEditor` | Captura comercial por recurso, permisos y conflictos. |
| `identityService` / `directoryService` | Transporte, listas, normalización y códigos por operación. |
| Formularios y tablas | Presentación tipada; organización y HTTP fuera del componente visual. |

## Datos y operaciones

| Recurso/operación | Datos/contrato |
| --- | --- |
| Persona | Nombre y al menos una responsabilidad; una asignación por área. GET/POST `/api/admin/persons`, PUT por ID. |
| Usuario | Nombre, contraseña en alta y asignación de área/rol; vínculo de persona en consulta. GET/POST `/api/admin/users`, PATCH por ID. |
| Contraseña | PATCH `/api/admin/users/:id/password`; sólo password y versión, sin consultas organizacionales. |
| Cliente | Nombre/Activo; GET/POST `/api/sales/clients`, PUT por ID. |
| Proveedor | Razón social/nombre comercial/Activo; GET/POST `/api/warehouse/suppliers`, PUT por ID. Sin teléfono. |
| Persona en listado | `includeAccesses=true`, filtros department/role y filtro estricto al elegir área. |
| Reportes | Búsqueda/orden sin paginación; Personas no admite rol en Excel y exige limpiar ese filtro. |
| Edición | Versión original; cuenta omite password/personId y conserva vinculación existente. |

## Diagramas del proceso

| Pregunta | Secuencia aplicada |
| --- | --- |
| Responsabilidades de persona | [Responsabilidades de persona](../../processes/04-identity/01-person-responsibilities.md) |
| Cuenta y contraseña | [Cuenta y contraseña](../../processes/04-identity/02-user-account.md) |
| Ciclo de guardado y conflicto | [Ciclo de guardado y conflicto](../../processes/03-catalogs-and-directory/02-directory-save.md) |
| Reportes | [Reportes](../../processes/08-movements-and-reports/02-reports.md) |

## Evidencia

identityTest.ts, directoryTest.ts, records.spec.ts y sistema real de cliente/reportes. La [matriz por CU](../../../../testing/04-use-case-coverage.md) precisa condiciones y límites; la API simulada no acredita stock, autorización o transacciones reales.
