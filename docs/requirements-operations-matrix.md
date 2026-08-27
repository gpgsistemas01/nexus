# Matriz de operaciones por módulo y contexto

## Propósito y lectura

Esta matriz responde una sola pregunta: **¿qué operaciones funcionales están
registradas en cada contexto y qué permiso API protege cada una?** Usa términos del
[glosario del negocio](business-glossary.md), pero no sustituye el inventario de rutas ni
la política de roles/departamentos.

Códigos usados únicamente para las operaciones CRUD base:

- `L`: listar o consultar;
- `C`: crear;
- `U`: actualizar;
- `D`: eliminar físicamente.

Las acciones que no son CRUD —suministrar, devolver, corregir, cancelar, ajustar o
exportar— se escriben por su nombre para no esconder reglas diferentes detrás de `U`.
Cada operación implementada muestra su permiso después de `→`. Cuando varias comparten
permiso se agrupan. Los valores de permiso son los declarados en
`src/constants/permissions.js`.

## Matriz vigente

| Área / contexto | Operaciones y permiso API | Estado |
| --- | --- | --- |
| Administración / personas | `L → persons:read`; `C, U → persons:write`; exportar `→ person:reports-read` | Implementado |
| Administración / usuarios | `L, C, U, cambiar contraseña/accesos → users:manage`; exportar `→ admin:reports-read` | Implementado |
| Administración / roles | `L → roles:read` | Implementado sólo lectura |
| Administración / departamentos | `L → departments:read` | Implementado sólo lectura |
| Ventas / clientes | `L → clients:read`; `C → clients:create`; `U → clients:update`; exportar `→ client:reports-read` | Implementado |
| Ventas / proyectos | Sin rutas API CRUD ni permiso registrado | Modelado |
| Almacén / materiales | `L → materials:read`; costo en la consulta `→ inventory:costs-read`; `C, U, D → materials:write`; ajustar existencia `→ materials:adjust-stock`; exportar inventario `→ warehouse:reports-read` | Implementado |
| Almacén / merma | `L → wastes:read`; costo en la consulta `→ inventory:costs-read`; `C, U → wastes:write`; ajustar existencia `→ wastes:adjust-stock`; exportar `→ warehouse:reports-read` | Implementado |
| Almacén / proveedores | `L, C → suppliers:manage`; `U → suppliers:update`; exportar `→ supplier:reports-read` | Implementado |
| Almacén / presentación | `L → presentations:read` | Implementado sólo lectura |
| Almacén / unidad de medida | `L → unit:measures-read` | Implementado sólo lectura |
| Almacén / motivo de ajuste | `L → reasons:read` | Implementado sólo lectura |
| Almacén / estado de cumplimiento | `L → fulfillment:statuses-read` | Implementado sólo lectura |
| Compras / entradas | `L, C, U encabezado, corregir detalle, cancelar detalle → goods:receipts-manage`; exportar `→ warehouse:reports-read` | Implementado |
| Salidas / material | `L, C, U documento/encabezado → goods:issues-manage`; actualizar detalles y devolver `→ goods:issue-details-manage`; exportar `→ warehouse:reports-read` | Implementado |
| Salidas / merma | `L, C, U documento/encabezado → waste:issues-manage`; suministrar detalles y devolver `→ waste:issues-supply`; exportar `→ warehouse:reports-read` | Implementado |
| Inventario / movimientos | `L material y merma → movements:read`; exportar `→ admin:reports-read` | Implementado sólo consulta |
| Inventario / ajustes de material y merma | Sin rutas API completas; existen modelos y servicios parciales para crear, aprobar/aplicar y cancelar | Parcial |
| Abastecimiento / requisiciones | Módulo retirado del código y del esquema vigente; requiere un nuevo alcance antes de reimplementarse | Fuera del alcance actual |

La autenticación es transversal y no se fuerza dentro del CRUD de un módulo: iniciar
sesión, consultar la sesión y renovar credenciales tienen rutas API; cerrar sesión se
realiza mediante el flujo web. Todas las filas implementadas requieren además una sesión
válida.

## Límites de interpretación

1. La tabla describe capacidades del producto, no personas autorizadas. La política de
   roles y departamentos se consulta en
   [usuarios y permisos](database-users-and-permissions-analysis.md).
2. Los permisos de visualización de página son distintos de los permisos API y se
   comprueban en las rutas web; no se mezclan aquí con operaciones sobre datos.
3. «Modelado» o «Parcial» no significa permitido. Un modelo, permiso declarado o
   servicio aislado no equivale a un flujo disponible.
4. Una operación especializada conserva su permiso, transición, efecto de inventario y
   pruebas propios. No se resume como actualización genérica.
5. Los contextos equivalentes reutilizan fábricas, componentes y coordinación común,
   pero mantienen separadas sus reglas, existencias y movimientos.

## Fuentes y mantenimiento

- **Disponibilidad:** rutas registradas bajo `src/routes/api` y estado de los requisitos.
- **Permisos:** `src/constants/permissions.js`; esta matriz conserva el valor público del
  permiso y no duplica sus listas de roles/departamentos.
- **Método y URL exactos:** [mapa generado](generated/code-map.md).
- **Criterio funcional:** [especificación de requisitos](requirements-specification.md).
- **Cobertura:** matriz CRUD del [plan de pruebas](test-plan.md).

Al agregar o retirar una operación se actualizan ruta, permiso, requisito y prueba;
después se modifica una sola fila de esta matriz y se ejecuta
`npm run docs:architecture`. Una fila pasa a **Implementado** únicamente cuando existe
flujo HTTP registrado, autorización y validación aplicables, y persistencia comprobable.
Para una operación nueva o modificada, la aceptación exige además la integración CRUD
del plan de pruebas; los faltantes heredados permanecen visibles como deuda en ese plan.
Si sólo existe una regla aislada, permanece **Parcial**; si sólo existe el modelo o
intención, permanece **Modelado**.
