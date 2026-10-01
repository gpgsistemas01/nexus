# 5. Diagramas dinámicos de implementación

### 5.1 Recorrido real de una petición

Este diagrama responde dónde se ejecuta cada responsabilidad. No todas las consultas crean
un DTO ni todas las operaciones abren una transacción; los nodos discontinuos indican
puntos reutilizados sólo cuando el router o servicio los configura. El recorrido aplica
**Pipeline** en middleware, **DTO** en la frontera y **Transaction Script** con contexto
`tx` en las escrituras coordinadas; las notificaciones son **Publish/Subscribe** no
durable después de una mutación exitosa.

```mermaid
flowchart LR
    browser["Navegador"] --> webRoute["Ruta web"]
    webRoute --> ejs["Página EJS y componentes shared"]
    ejs --> client["Aplicación y plugins del navegador"]
    client --> apiRoute["Ruta API"]

    apiRoute --> auth["Middleware de autenticación y autorización"]
    auth --> validation["Validadores y middleware validate"]
    validation --> controller["Controller"]
    controller -.-> dto["DTO cuando aplica"]
    controller --> service["Servicio de dominio"]
    service -.-> transaction["Transacción Prisma cuando coordina escrituras"]
    service --> repository["getDb / contexto tx"]
    transaction --> repository
    repository --> prisma["Prisma"]
    prisma --> postgres[("PostgreSQL")]
    controller -.->|"mutación exitosa"| socket["Publicación Socket.IO"]
    apiRoute -.-> audit["Middleware de auditoría"]
    service -.-> log["Log estructurado"]
```

La evidencia principal está en `src/routes`, `src/middleware`, `src/controllers`,
`src/dtos`, `src/services`, `src/repository/baseRepository.js` y `src/lib/prisma.js`.

### 5.2 Operaciones que requieren representaciones adicionales

El código confirma varias coordinaciones que no se entienden sólo con el diagrama de capas:

| Operación | Evidencia del código | Artefacto que explica el comportamiento |
| --- | --- | --- |
| Crear/editar usuario, acceso o contraseña | `src/services/admin/userService.js`, cifrado y asignaciones `UserRoleDepartment`. | Secuencias backend de [`CU-IDA-06`](../../processes/backend-code-sequences/identity-access/cu-ida-06.md), [`CU-IDA-07`](../../processes/backend-code-sequences/identity-access/cu-ida-07.md) y [`CU-IDA-08`](../../processes/backend-code-sequences/identity-access/cu-ida-08.md). |
| Eliminar material o relación de proveedor | `materialService.deleteMaterial` y relaciones de uso en `supplierMaterialService.js`. | [Secuencia backend de `CU-ALM-04`](../../processes/backend-code-sequences/catalogs/cu-alm-04.md). |
| Registrar una entrada | `goodsReceiptService.createGoodsReceipt`, referencias y servicios de inventario/costo. | [Secuencia backend de `CU-ENT-02`](../../processes/backend-code-sequences/purchases/cu-ent-02.md). |
| Corregir o cancelar detalle de entrada | `src/services/warehouse/goodsReceipts/detailChanges` y servicios de inventario. | Secuencias backend de [`CU-ENT-04`](../../processes/backend-code-sequences/purchases/cu-ent-04.md) y [`CU-ENT-05`](../../processes/backend-code-sequences/purchases/cu-ent-05.md), complementadas por la [actividad de cancelación](../backend-technical-documentation/02-views-technical-applied.md#actividad-de-cancelación-de-un-detalle-de-entrada). |
| Surtir o devolver detalle de salida | Servicios de salidas de material/merma, reglas de cumplimiento y movimientos. | [Estados normativos](../../../../requirements/domain-and-use-cases/04-states-and-data-changed-by-action.md) y secuencias backend del grupo [SAL](../../processes/backend-code-sequences/issues/index.md). |
| Generar reporte Excel | Controllers de reporte, servicios de consulta y `reportExcelUtils.js`. | Secuencias backend de los casos propietarios, localizadas desde el [índice por grupos](../../processes/backend-code-sequences/index.md). |

No se duplican aquí esas representaciones. Los estados y reglas observables permanecen en
requisitos; la coordinación entre capas se mantiene en las secuencias y actividades de
arquitectura.

### 5.3 Resultado de la revisión de trazabilidad diagrama–código

La revisión del código no justifica crear otra familia de diagramas: contexto,
estructura, interacción, reutilización, casos de uso, actividades, secuencias, estados y
datos ya tienen una vista canónica. Sí requiere conservar los siguientes enlaces y
aclaraciones técnicas para que una etiqueta funcional no se confunda con una ruta, una
función o un estado persistido:

| Diagrama o casos | Entrada HTTP verificable | Coordinación que sustenta el diagrama | Aclaración técnica |
| --- | --- | --- | --- |
| `CU-AUT-01` a `CU-AUT-02` | `src/routes/api/authApiRoute.js` y `src/routes/web/auth/logoutWebRoute.js` | `src/services/authService.js` y utilidades de cookies | Iniciar y cerrar sesión son objetivos visibles; consultar o renovar la sesión son mecanismos técnicos y no casos independientes. |
| `CU-IDA-01` a `CU-IDA-09` | `src/routes/api/admin/personApiRoute.js`, `userApiRoute.js`, `roleApiRoute.js` y `departmentApiRoute.js` | `src/services/admin/person/personService.js` y `src/services/admin/userService.js` | Crear usuario, editar acceso y cambiar contraseña son casos de uso independientes; la transacción y el cifrado pertenecen al servicio, no al actor del diagrama. |
| `CU-ALM-01` a `CU-CAT-26` | Routers de cliente bajo `sales`; proveedor, material, merma y lecturas operativas bajo `warehouse`; administración de catálogos auxiliares bajo `admin` | Servicios homónimos, `src/services/warehouse/materials/supplierMaterialService.js` y el registro seguro `src/services/admin/catalogService.js` | El grupo funcional reúne recursos con el patrón CRUD, pero no implica que todos admitan `DELETE` o cambio de estado. |
| `CU-ENT-01` a `CU-ENT-06` | `src/routes/api/warehouse/goodsReceiptApiRoute.js` | `goodsReceiptService.js` y `goodsReceipts/detailChanges/*Service.js` | Corrección y cancelación son rutas `PATCH` distintas; el recálculo de costo posterior al commit queda fuera de la transacción mostrada. |
| `CU-SAL-01` a `CU-SAL-14` | `goodsIssueApiRoute.js` y `wasteIssueApiRoute.js` | Servicios de `goodsIssues`, `wasteIssues`, sus `detailReturns` y `issueFulfillmentRules.js` | **Surtir no tiene un endpoint `/supply`:** se confirma mediante `PATCH /:id/details`; devolver usa `PATCH /:id/details/:detailId/returns`. La acción funcional y la URL no deben igualarse por nombre. |
| Estados de salidas | Las mismas rutas de detalle y devolución | `src/constants/warehouseStatuses.js`, `issueFulfillmentRules.js` y reglas específicas | Los valores persistidos son `Pendiente`, `Surtido parcial`, `Surtido` y `Cancelado`; crear/editar/surtir/devolver son operaciones, no estados. |
| `CU-IDA-04`, `CU-IDA-09`, `CU-ALM-06`, `CU-ALM-08`, `CU-CAT-04`, `CU-CAT-08`, `CU-ALM-14`, `CU-ALM-16`, `CU-ENT-06`, `CU-SAL-07` y `CU-SAL-14` | Routers de reporte de `admin`, `sales` y `warehouse` | Servicios de reporte y `src/utils/reportExcelUtils.js` | Consultar y exportar reutilizan filtros, pero cada reporte conserva permiso, columnas y transformación propios. |
| Entidades y cardinalidades | No aplica a una ruta individual | `prisma/schema.prisma` | El ER y el diccionario son generados; una relación Prisma no prueba que exista un flujo HTTP completo. |

Para seguir una fila hasta método y URL exactos se usa el
[mapa generado](../code-map.md); para seguirla hasta permiso y estado de
implementación se usa la
[matriz de operaciones](../../../../requirements/requirements-operations-matrix.md). Las pruebas
no se inventan a partir del dibujo: la cobertura existente y sus faltantes se mantienen
en el [plan de pruebas](../../../../testing/test-plan.md). Así, cada enlace tiene una sola fuente
de verdad y una brecha de cobertura permanece visible en vez de presentarse como
evidencia inexistente.
