# Diagramas de casos aplicados al código backend

Cada bloque representa un solo caso de uso con los elementos concretos documentados en
la [matriz técnica de backend](backend-technical-documentation.md#aplicación-de-todos-los-casos-al-código-backend).
Cada secuencia muestra el endpoint, controller y métodos de servicio o efecto que
participan en el caso. Sus notas hacen visibles los métodos compartidos de los patrones
y las variables que cruzan la frontera (`req.params`, `req.body`/DTO, parámetros de
consulta y `tx`); las variables locales puramente mecánicas permanecen en el código para
no convertir el diagrama en una transcripción ilegible. Se conserva una vista por caso
incluso cuando la estructura se repite, porque cambian módulos, símbolos, rutas,
variables o efectos.
El orden sigue los identificadores del catálogo para facilitar la revisión técnica; no
convierte `REP` en un dominio backend independiente de los módulos que proporcionan las
consultas y exportaciones.

## Índice rápido de patrones por caso

Cada caso conserva una línea **Patrones** con códigos de este índice y enlaza el
[catálogo canónico](design-and-construction-patterns.md#resumen-de-patrones-confirmados).
La referencia identifica las soluciones aplicadas y la nota del bloque Mermaid nombra
su implementación en el recorrido concreto, sin repetir la explicación completa del
catálogo.

| Código | Patrón aplicado | Elementos que permiten reconocerlo |
| --- | --- | --- |
| `BE-P01` | Capas, pipeline y DTO funcional | Ruta/middleware → controller/DTO → servicio → Prisma; el DTO sólo aparece cuando hay entrada. |
| `BE-P02` | Factory de catálogo | `createDataTableListController` parametriza consulta, columnas y orden. |
| `BE-P03` | Transaction Script y `tx` explícito | El servicio propietario abre `$transaction` y propaga `tx` a las escrituras relacionadas. |
| `BE-P04` | Composición de servicios | El servicio del caso coordina reglas, referencias, inventario o cumplimiento reutilizados. |
| `BE-P05` | Publicación posterior al commit | El controller llama `emitInventoryUpdated` después del resultado del servicio. |
| `BE-P06` | Query Service | Controller de listado + consulta contextual de sólo lectura. |
| `BE-P07` | Composición de reporte | Consulta de dominio + `sendExcelReport`, sin modificar inventario. |
| `BE-P08` | Sesión web | Autenticación, JWT/cookies, cierre o redirección en la frontera web. |

### Cobertura de casos backend

La comparación con el catálogo y la matriz técnica confirma que cada identificador
aparece una vez, conserva su referencia de patrones y contiene un bloque Mermaid.

| Grupo | Rango cubierto | Diagramas | Estado |
| --- | --- | ---: | --- |
| Autenticación | `CU-AUT-01..02` | 2 | Completo |
| Identidad y acceso | `CU-IDA-01..09` | 9 | Completo |
| Catálogos | `CU-CAT-01..20` | 20 | Completo |
| Entradas | `CU-ENT-01..05` | 5 | Completo |
| Salidas | `CU-SAL-01..12` | 12 | Completo |
| Consultas y reportes | `CU-REP-01..15` | 15 | Completo |
| **Total** | `CU-AUT-01..CU-REP-15` | **63** | **63 de 63** |

## `CU-AUT-01`

**Identificador:** `DIA-BE-CU-AUT-01`. **Fuente:** fila `CU-AUT-01` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P08`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as POST /api/auth/login
    participant Controller as authController.login
    participant Domain as authService.loginUser / userService.getUserIdByLogin
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P08 authController + JWT/cookies
    Note over Controller,Domain: Variables de frontera: req.body/DTO

    Client->>Route: POST /api/auth/login
    Route->>Controller: invocar authController.login
    Controller->>Domain: authService.loginUser, userService.getUserIdByLogin, JWT y cookies
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-AUT-02`

**Identificador:** `DIA-BE-CU-AUT-02`. **Fuente:** fila `CU-AUT-02` de la matriz de aplicación al código backend.

**Patrones:** `BE-P08`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /cerrar-sesion
    participant Controller as controllers/web/authController.logout
    participant Domain as cookies / redirect
    Note over Route,Domain: BE-P08 authController + JWT/cookies
    Note over Controller,Domain: Variables de frontera: sin variables adicionales

    Client->>Route: GET /cerrar-sesion
    Route->>Controller: invocar controllers/web/authController.logout
    Controller->>Domain: Elimina cookies de autenticación y redirige a login, no persiste dominio
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-IDA-01`

**Identificador:** `DIA-BE-CU-IDA-01`. **Fuente:** fila `CU-IDA-01` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/admin/persons
    participant Controller as getAllPersons
    participant Domain as personService.findAllPersons
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/admin/persons
    Route->>Controller: invocar getAllPersons
    Controller->>Domain: personService.findAllPersons consulta Person y asignaciones
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-IDA-02`

**Identificador:** `DIA-BE-CU-IDA-02`. **Fuente:** fila `CU-IDA-02` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as POST /api/admin/persons
    participant Controller as registerPerson
    participant Domain as personService.createPerson
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso
    Note over Controller,Domain: Variables de frontera: req.body/DTO, tx

    Client->>Route: POST /api/admin/persons
    Route->>Controller: invocar registerPerson
    Controller->>Domain: personService.createPerson valida y crea persona/asignaciones
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-IDA-03`

**Identificador:** `DIA-BE-CU-IDA-03`. **Fuente:** fila `CU-IDA-03` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PUT /api/admin/persons/:id
    participant Controller as editPerson
    participant Domain as personService.updatePerson
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO, tx

    Client->>Route: PUT /api/admin/persons/:id
    Route->>Controller: invocar editPerson
    Controller->>Domain: personService.updatePerson actualiza persona/asignaciones
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-IDA-04`

**Identificador:** `DIA-BE-CU-IDA-04`. **Fuente:** fila `CU-IDA-04` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/admin/users
    participant Controller as getAllUsers
    participant Domain as userService.findAllUsers
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/admin/users
    Route->>Controller: invocar getAllUsers
    Controller->>Domain: userService.findAllUsers consulta cuentas y accesos
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-IDA-05`

**Identificador:** `DIA-BE-CU-IDA-05`. **Fuente:** fila `CU-IDA-05` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as POST /api/admin/users
    participant Controller as registerUser
    participant Domain as userService.createUser
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso
    Note over Controller,Domain: Variables de frontera: req.body/DTO, tx

    Client->>Route: POST /api/admin/users
    Route->>Controller: invocar registerUser
    Controller->>Domain: userService.createUser crea cuenta, contraseña cifrada y acceso
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-IDA-06`

**Identificador:** `DIA-BE-CU-IDA-06`. **Fuente:** fila `CU-IDA-06` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PATCH /api/admin/users/:id
    participant Controller as editUser
    participant Domain as userService.updateUser
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO, tx

    Client->>Route: PATCH /api/admin/users/:id
    Route->>Controller: invocar editUser
    Controller->>Domain: userService.updateUser actualiza cuenta y asignación autorizada
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-IDA-07`

**Identificador:** `DIA-BE-CU-IDA-07`. **Fuente:** fila `CU-IDA-07` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PATCH /api/admin/users/:id/password
    participant Controller as editUserPassword
    participant Domain as userService.updateUserPassword
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO

    Client->>Route: PATCH /api/admin/users/:id/password
    Route->>Controller: invocar editUserPassword
    Controller->>Domain: userService.updateUserPassword cifra y sustituye la contraseña
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-IDA-08`

**Identificador:** `DIA-BE-CU-IDA-08`. **Fuente:** fila `CU-IDA-08` de la matriz de aplicación al código backend.

**Patrones:** `BE-P02`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/admin/roles
    participant Controller as roleController.getAllRoles
    participant Domain as roleService.findAllRoles
    Note over Route,Domain: BE-P02 createDataTableListController
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/admin/roles
    Route->>Controller: invocar roleController.getAllRoles
    Controller->>Domain: roleService.findAllRoles lee Role, no existe mutación publicada
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-IDA-09`

**Identificador:** `DIA-BE-CU-IDA-09`. **Fuente:** fila `CU-IDA-09` de la matriz de aplicación al código backend.

**Patrones:** `BE-P02`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/admin/departments
    participant Controller as departmentController.getAllDepartments
    participant Domain as departmentService.findAllDepartments
    Note over Route,Domain: BE-P02 createDataTableListController
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/admin/departments
    Route->>Controller: invocar departmentController.getAllDepartments
    Controller->>Domain: departmentService.findAllDepartments lee Department
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-CAT-01`

**Identificador:** `DIA-BE-CU-CAT-01`. **Fuente:** fila `CU-CAT-01` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/warehouse/materials
    participant Controller as getAllMaterials
    participant Domain as materialService.findAllMaterials
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/materials
    Route->>Controller: invocar getAllMaterials
    Controller->>Domain: materialService.findAllMaterials consulta material, proveedor y existencia
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-CAT-02`

**Identificador:** `DIA-BE-CU-CAT-02`. **Fuente:** fila `CU-CAT-02` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as POST /api/warehouse/materials
    participant Controller as registerMaterial
    participant Domain as materialService.createMaterial
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso
    Note over Controller,Domain: Variables de frontera: req.body/DTO, tx

    Client->>Route: POST /api/warehouse/materials
    Route->>Controller: invocar registerMaterial
    Controller->>Domain: materialService.createMaterial crea identidad y relación de proveedor
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-CAT-03`

**Identificador:** `DIA-BE-CU-CAT-03`. **Fuente:** fila `CU-CAT-03` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PATCH /api/warehouse/materials/:id
    participant Controller as editMaterial
    participant Domain as materialService.updateMaterial
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO, tx

    Client->>Route: PATCH /api/warehouse/materials/:id
    Route->>Controller: invocar editMaterial
    Controller->>Domain: materialService.updateMaterial sincroniza datos y relación
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-CAT-04`

**Identificador:** `DIA-BE-CU-CAT-04`. **Fuente:** fila `CU-CAT-04` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as DELETE /api/warehouse/materials/:id
    participant Controller as removeMaterial
    participant Domain as materialService.deleteMaterial
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO, tx

    Client->>Route: DELETE /api/warehouse/materials/:id
    Route->>Controller: invocar removeMaterial
    Controller->>Domain: materialService.deleteMaterial protege referencias antes de eliminar relación
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-CAT-05`

**Identificador:** `DIA-BE-CU-CAT-05`. **Fuente:** fila `CU-CAT-05` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PATCH /api/warehouse/materials/:id/stock
    participant Controller as editMaterialStock
    participant Domain as materialService.updateMaterialStock
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso<br/>BE-P05 emitInventoryUpdated después del commit
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO, tx

    Client->>Route: PATCH /api/warehouse/materials/:id/stock
    Route->>Controller: invocar editMaterialStock
    Controller->>Domain: materialService.updateMaterialStock usa adjustmentService y movimiento
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-CAT-06`

**Identificador:** `DIA-BE-CU-CAT-06`. **Fuente:** fila `CU-CAT-06` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/warehouse/suppliers
    participant Controller as getAllSuppliers
    participant Domain as supplierService.findAllSuppliers
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/suppliers
    Route->>Controller: invocar getAllSuppliers
    Controller->>Domain: supplierService.findAllSuppliers consulta proveedores
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-CAT-07`

**Identificador:** `DIA-BE-CU-CAT-07`. **Fuente:** fila `CU-CAT-07` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as POST /api/warehouse/suppliers
    participant Controller as registerSupplier
    participant Domain as supplierService.createSupplier
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio
    Note over Controller,Domain: Variables de frontera: req.body/DTO

    Client->>Route: POST /api/warehouse/suppliers
    Route->>Controller: invocar registerSupplier
    Controller->>Domain: supplierService.createSupplier persiste el proveedor
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-CAT-08`

**Identificador:** `DIA-BE-CU-CAT-08`. **Fuente:** fila `CU-CAT-08` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PUT /api/warehouse/suppliers/:id
    participant Controller as editSupplier
    participant Domain as supplierService.updateSupplier
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO

    Client->>Route: PUT /api/warehouse/suppliers/:id
    Route->>Controller: invocar editSupplier
    Controller->>Domain: supplierService.updateSupplier actualiza datos del proveedor
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-CAT-09`

**Identificador:** `DIA-BE-CU-CAT-09`. **Fuente:** fila `CU-CAT-09` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PUT /api/warehouse/suppliers/:id
    participant Controller as editSupplier
    participant Domain as supplierService.updateSupplier
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO

    Client->>Route: PUT /api/warehouse/suppliers/:id
    Route->>Controller: invocar editSupplier
    Controller->>Domain: supplierService.updateSupplier aplica el estado incluido en el DTO, no hay endpoint separado
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-CAT-10`

**Identificador:** `DIA-BE-CU-CAT-10`. **Fuente:** fila `CU-CAT-10` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/sales/clients
    participant Controller as getAllClients
    participant Domain as clientService.findAllClients
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/sales/clients
    Route->>Controller: invocar getAllClients
    Controller->>Domain: clientService.findAllClients consulta Client
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-CAT-11`

**Identificador:** `DIA-BE-CU-CAT-11`. **Fuente:** fila `CU-CAT-11` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as POST /api/sales/clients
    participant Controller as registerClient
    participant Domain as clientService.createClient
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio
    Note over Controller,Domain: Variables de frontera: req.body/DTO

    Client->>Route: POST /api/sales/clients
    Route->>Controller: invocar registerClient
    Controller->>Domain: clientService.createClient persiste Client
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-CAT-12`

**Identificador:** `DIA-BE-CU-CAT-12`. **Fuente:** fila `CU-CAT-12` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PUT /api/sales/clients/:id
    participant Controller as editClient
    participant Domain as clientService.updateClient
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO

    Client->>Route: PUT /api/sales/clients/:id
    Route->>Controller: invocar editClient
    Controller->>Domain: clientService.updateClient actualiza Client
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-CAT-13`

**Identificador:** `DIA-BE-CU-CAT-13`. **Fuente:** fila `CU-CAT-13` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/warehouse/wastes
    participant Controller as getAllWastes
    participant Domain as wasteService.findAllWastes
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/wastes
    Route->>Controller: invocar getAllWastes
    Controller->>Domain: wasteService.findAllWastes consulta merma e inventario
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-CAT-14`

**Identificador:** `DIA-BE-CU-CAT-14`. **Fuente:** fila `CU-CAT-14` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/warehouse/wastes/material-templates y POST /api/warehouse/wastes
    participant Controller as getWasteMaterialTemplates/registerWaste
    participant Domain as findWasteMaterialTemplates / createWasteWithInitialStockAdjustment
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso<br/>BE-P05 emitInventoryUpdated después del commit
    Note over Controller,Domain: Variables de frontera: req.body/DTO, req.query/params, tx

    Client->>Route: GET /api/warehouse/wastes/material-templates y POST /api/warehouse/wastes
    Route->>Controller: invocar getWasteMaterialTemplates/registerWaste
    Controller->>Domain: findWasteMaterialTemplates alimenta la selección y createWasteWithInitialStockAdjustment crea merma, ajuste y movimiento inicial
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-CAT-15`

**Identificador:** `DIA-BE-CU-CAT-15`. **Fuente:** fila `CU-CAT-15` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PATCH /api/warehouse/wastes/:id
    participant Controller as editWaste
    participant Domain as wasteService.updateWaste
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO

    Client->>Route: PATCH /api/warehouse/wastes/:id
    Route->>Controller: invocar editWaste
    Controller->>Domain: wasteService.updateWaste actualiza datos sin tratar stock como edición
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-CAT-16`

**Identificador:** `DIA-BE-CU-CAT-16`. **Fuente:** fila `CU-CAT-16` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PATCH /api/warehouse/wastes/:id/stock
    participant Controller as editWasteStock
    participant Domain as wasteService.updateWasteStock / registerWasteStockAdjustment
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso<br/>BE-P05 emitInventoryUpdated después del commit
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO, tx

    Client->>Route: PATCH /api/warehouse/wastes/:id/stock
    Route->>Controller: invocar editWasteStock
    Controller->>Domain: wasteService.updateWasteStock y registerWasteStockAdjustment aplican ajuste/movimiento
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-CAT-17`

**Identificador:** `DIA-BE-CU-CAT-17`. **Fuente:** fila `CU-CAT-17` de la matriz de aplicación al código backend.

**Patrones:** `BE-P02`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/warehouse/presentations
    participant Controller as getAllPresentations
    participant Domain as presentationService.findAllPresentations
    Note over Route,Domain: BE-P02 createDataTableListController
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/presentations
    Route->>Controller: invocar getAllPresentations
    Controller->>Domain: presentationService.findAllPresentations sirve el catálogo de sólo lectura
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-CAT-18`

**Identificador:** `DIA-BE-CU-CAT-18`. **Fuente:** fila `CU-CAT-18` de la matriz de aplicación al código backend.

**Patrones:** `BE-P02`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/warehouse/unit-measures
    participant Controller as getAllUnitMeasures
    participant Domain as unitMeasureService.findAllUnitMeasures
    Note over Route,Domain: BE-P02 createDataTableListController
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/unit-measures
    Route->>Controller: invocar getAllUnitMeasures
    Controller->>Domain: unitMeasureService.findAllUnitMeasures sirve el catálogo de sólo lectura
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-CAT-19`

**Identificador:** `DIA-BE-CU-CAT-19`. **Fuente:** fila `CU-CAT-19` de la matriz de aplicación al código backend.

**Patrones:** `BE-P02`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/warehouse/reasons
    participant Controller as getAllReasons
    participant Domain as reasonService.findAllReasons
    Note over Route,Domain: BE-P02 createDataTableListController
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/reasons
    Route->>Controller: invocar getAllReasons
    Controller->>Domain: reasonService.findAllReasons sirve motivos, helpers resuelven motivos internos
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-CAT-20`

**Identificador:** `DIA-BE-CU-CAT-20`. **Fuente:** fila `CU-CAT-20` de la matriz de aplicación al código backend.

**Patrones:** `BE-P02`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/warehouse/fulfillment-statuses
    participant Controller as getAllFulfillmentStatuses
    participant Domain as fulfillmentStatusService.findAllFulfillmentStatuses
    Note over Route,Domain: BE-P02 createDataTableListController
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/fulfillment-statuses
    Route->>Controller: invocar getAllFulfillmentStatuses
    Controller->>Domain: fulfillmentStatusService.findAllFulfillmentStatuses sirve estados de sólo lectura
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-ENT-01`

**Identificador:** `DIA-BE-CU-ENT-01`. **Fuente:** fila `CU-ENT-01` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/warehouse/goods-receipts
    participant Controller as getAllGoodsReceipts
    participant Domain as goodsReceiptService.findAllGoodsReceipts
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/goods-receipts
    Route->>Controller: invocar getAllGoodsReceipts
    Controller->>Domain: goodsReceiptService.findAllGoodsReceipts consulta entradas y totales
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-ENT-02`

**Identificador:** `DIA-BE-CU-ENT-02`. **Fuente:** fila `CU-ENT-02` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as POST /api/warehouse/goods-receipts
    participant Controller as registerGoodsReceipt
    participant Domain as goodsReceiptService.createGoodsReceipt
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso<br/>BE-P05 emitInventoryUpdated después del commit
    Note over Controller,Domain: Variables de frontera: req.body/DTO, tx

    Client->>Route: POST /api/warehouse/goods-receipts
    Route->>Controller: invocar registerGoodsReceipt
    Controller->>Domain: goodsReceiptService.createGoodsReceipt crea documento, detalles, existencias y movimiento en transacción
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-ENT-03`

**Identificador:** `DIA-BE-CU-ENT-03`. **Fuente:** fila `CU-ENT-03` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PATCH /api/warehouse/goods-receipts/:id
    participant Controller as editGoodsReceiptHeader
    participant Domain as goodsReceiptService.updateGoodsReceipt
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso<br/>BE-P05 emitInventoryUpdated después del commit
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO, tx

    Client->>Route: PATCH /api/warehouse/goods-receipts/:id
    Route->>Controller: invocar editGoodsReceiptHeader
    Controller->>Domain: goodsReceiptService.updateGoodsReceipt conserva detalles persistidos y actualiza encabezado permitido
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-ENT-04`

**Identificador:** `DIA-BE-CU-ENT-04`. **Fuente:** fila `CU-ENT-04` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PATCH /api/warehouse/goods-receipts/:id/details/:detailId/corrections
    participant Controller as correctGoodsReceiptDetail
    participant Domain as correctGoodsReceiptDetailLine
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso<br/>BE-P05 emitInventoryUpdated después del commit
    Note over Controller,Domain: Variables de frontera: req.params.id, req.params.detailId, req.body/DTO, tx

    Client->>Route: PATCH /api/warehouse/goods-receipts/:id/details/:detailId/corrections
    Route->>Controller: invocar correctGoodsReceiptDetail
    Controller->>Domain: correctGoodsReceiptDetailLine registra diferencia, movimiento, stock e historial atómicamente
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-ENT-05`

**Identificador:** `DIA-BE-CU-ENT-05`. **Fuente:** fila `CU-ENT-05` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PATCH /api/warehouse/goods-receipts/:id/details/:detailId/cancel
    participant Controller as cancelGoodsReceiptDetail
    participant Domain as cancelGoodsReceiptDetailLine
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso<br/>BE-P05 emitInventoryUpdated después del commit
    Note over Controller,Domain: Variables de frontera: req.params.id, req.params.detailId, req.body/DTO, tx

    Client->>Route: PATCH /api/warehouse/goods-receipts/:id/details/:detailId/cancel
    Route->>Controller: invocar cancelGoodsReceiptDetail
    Controller->>Domain: cancelGoodsReceiptDetailLine revierte stock/movimiento y conserva historial
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-SAL-01`

**Identificador:** `DIA-BE-CU-SAL-01`. **Fuente:** fila `CU-SAL-01` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/warehouse/goods-issues
    participant Controller as getAllGoodsIssues
    participant Domain as goodsIssueService.findAllGoodsIssues
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/goods-issues
    Route->>Controller: invocar getAllGoodsIssues
    Controller->>Domain: goodsIssueService.findAllGoodsIssues consulta documentos y estados
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-SAL-02`

**Identificador:** `DIA-BE-CU-SAL-02`. **Fuente:** fila `CU-SAL-02` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as POST /api/warehouse/goods-issues
    participant Controller as registerGoodsIssue
    participant Domain as goodsIssueService.createGoodsIssue
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso
    Note over Controller,Domain: Variables de frontera: req.body/DTO, tx

    Client->>Route: POST /api/warehouse/goods-issues
    Route->>Controller: invocar registerGoodsIssue
    Controller->>Domain: goodsIssueService.createGoodsIssue crea encabezado y detalles solicitados
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-SAL-03`

**Identificador:** `DIA-BE-CU-SAL-03`. **Fuente:** fila `CU-SAL-03` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PATCH /api/warehouse/goods-issues/:id/header
    participant Controller as editGoodsIssueHeader
    participant Domain as goodsIssueService.updateGoodsIssueHeader
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P04 composición de servicios del caso
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO

    Client->>Route: PATCH /api/warehouse/goods-issues/:id/header
    Route->>Controller: invocar editGoodsIssueHeader
    Controller->>Domain: goodsIssueService.updateGoodsIssueHeader aplica reglas del encabezado
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-SAL-04`

**Identificador:** `DIA-BE-CU-SAL-04`. **Fuente:** fila `CU-SAL-04` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PATCH /api/warehouse/goods-issues/:id/details
    participant Controller as editGoodsIssueDetails
    participant Domain as goodsIssueService.updateGoodsIssueDetails
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso<br/>BE-P05 emitInventoryUpdated después del commit
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO, tx

    Client->>Route: PATCH /api/warehouse/goods-issues/:id/details
    Route->>Controller: invocar editGoodsIssueDetails
    Controller->>Domain: goodsIssueService.updateGoodsIssueDetails modifica cantidades todavía editables
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-SAL-05`

**Identificador:** `DIA-BE-CU-SAL-05`. **Fuente:** fila `CU-SAL-05` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PATCH /api/warehouse/goods-issues/:id/details
    participant Controller as editGoodsIssueDetails
    participant Domain as updateGoodsIssueDetails / applyInventoryMovement
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso<br/>BE-P05 emitInventoryUpdated después del commit
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO, tx

    Client->>Route: PATCH /api/warehouse/goods-issues/:id/details
    Route->>Controller: invocar editGoodsIssueDetails
    Controller->>Domain: updateGoodsIssueDetails llama applyInventoryMovement(ISSUE) y recalcula cumplimiento con tx
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-SAL-06`

**Identificador:** `DIA-BE-CU-SAL-06`. **Fuente:** fila `CU-SAL-06` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PATCH /api/warehouse/goods-issues/:id/details/:detailId/returns
    participant Controller as registerGoodsIssueDetailReturn
    participant Domain as returnGoodsIssueDetail
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso<br/>BE-P05 emitInventoryUpdated después del commit
    Note over Controller,Domain: Variables de frontera: req.params.id, req.params.detailId, req.body/DTO, tx

    Client->>Route: PATCH /api/warehouse/goods-issues/:id/details/:detailId/returns
    Route->>Controller: invocar registerGoodsIssueDetailReturn
    Controller->>Domain: returnGoodsIssueDetail crea GoodsIssueReturn, movimiento ENTRY y estados en transacción
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-SAL-07`

**Identificador:** `DIA-BE-CU-SAL-07`. **Fuente:** fila `CU-SAL-07` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/warehouse/waste-issues
    participant Controller as getAllWasteIssues
    participant Domain as wasteIssueService.findAllWasteIssues
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/waste-issues
    Route->>Controller: invocar getAllWasteIssues
    Controller->>Domain: wasteIssueService.findAllWasteIssues consulta salidas de merma
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-SAL-08`

**Identificador:** `DIA-BE-CU-SAL-08`. **Fuente:** fila `CU-SAL-08` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as POST /api/warehouse/waste-issues
    participant Controller as registerWasteIssue
    participant Domain as wasteIssueService.createWasteIssue
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso
    Note over Controller,Domain: Variables de frontera: req.body/DTO, tx

    Client->>Route: POST /api/warehouse/waste-issues
    Route->>Controller: invocar registerWasteIssue
    Controller->>Domain: wasteIssueService.createWasteIssue crea encabezado y detalles de merma
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-SAL-09`

**Identificador:** `DIA-BE-CU-SAL-09`. **Fuente:** fila `CU-SAL-09` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PATCH /api/warehouse/waste-issues/:id/header
    participant Controller as editWasteIssueHeader
    participant Domain as wasteIssueService.updateWasteIssueHeader
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P04 composición de servicios del caso
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO

    Client->>Route: PATCH /api/warehouse/waste-issues/:id/header
    Route->>Controller: invocar editWasteIssueHeader
    Controller->>Domain: wasteIssueService.updateWasteIssueHeader aplica reglas del encabezado
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-SAL-10`

**Identificador:** `DIA-BE-CU-SAL-10`. **Fuente:** fila `CU-SAL-10` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PATCH /api/warehouse/waste-issues/:id/details
    participant Controller as editWasteIssueDetails
    participant Domain as wasteIssueService.updateWasteIssueDetails
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso<br/>BE-P05 emitInventoryUpdated después del commit
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO, tx

    Client->>Route: PATCH /api/warehouse/waste-issues/:id/details
    Route->>Controller: invocar editWasteIssueDetails
    Controller->>Domain: wasteIssueService.updateWasteIssueDetails modifica cantidades editables
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-SAL-11`

**Identificador:** `DIA-BE-CU-SAL-11`. **Fuente:** fila `CU-SAL-11` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PATCH /api/warehouse/waste-issues/:id/details
    participant Controller as editWasteIssueDetails
    participant Domain as updateWasteIssueDetails / applyWasteIssueMovement
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso<br/>BE-P05 emitInventoryUpdated después del commit
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO, tx

    Client->>Route: PATCH /api/warehouse/waste-issues/:id/details
    Route->>Controller: invocar editWasteIssueDetails
    Controller->>Domain: updateWasteIssueDetails llama applyWasteIssueMovement y recalcula cumplimiento con tx
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-SAL-12`

**Identificador:** `DIA-BE-CU-SAL-12`. **Fuente:** fila `CU-SAL-12` de la matriz de aplicación al código backend.

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as PATCH /api/warehouse/waste-issues/:id/details/:detailId/returns
    participant Controller as registerWasteIssueDetailReturn
    participant Domain as returnWasteIssueDetail
    Note over Route,Domain: BE-P01 router/middleware → controller/DTO → servicio<br/>BE-P03 $transaction + getDb(tx)<br/>BE-P04 composición de servicios del caso<br/>BE-P05 emitInventoryUpdated después del commit
    Note over Controller,Domain: Variables de frontera: req.params.id, req.params.detailId, req.body/DTO, tx

    Client->>Route: PATCH /api/warehouse/waste-issues/:id/details/:detailId/returns
    Route->>Controller: invocar registerWasteIssueDetailReturn
    Controller->>Domain: returnWasteIssueDetail crea WasteIssueReturn, movimiento inverso y estados en transacción
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-REP-01`

**Identificador:** `DIA-BE-CU-REP-01`. **Fuente:** fila `CU-REP-01` de la matriz de aplicación al código backend.

**Patrones:** `BE-P06`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/warehouse/materials
    participant Controller as getAllMaterials
    participant Domain as findAllMaterials
    Note over Route,Domain: BE-P06 controller de listado + query contextual
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/materials
    Route->>Controller: invocar getAllMaterials
    Controller->>Domain: Reutiliza findAllMaterials con filtros, sólo lectura
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-REP-02`

**Identificador:** `DIA-BE-CU-REP-02`. **Fuente:** fila `CU-REP-02` de la matriz de aplicación al código backend.

**Patrones:** `BE-P06`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/admin/movements/materials
    participant Controller as getAllMaterialMovements
    participant Domain as movementQueryService.findAllMaterialMovements
    Note over Route,Domain: BE-P06 controller de listado + query contextual
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/admin/movements/materials
    Route->>Controller: invocar getAllMaterialMovements
    Controller->>Domain: movementQueryService.findAllMaterialMovements, sólo lectura
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-REP-03`

**Identificador:** `DIA-BE-CU-REP-03`. **Fuente:** fila `CU-REP-03` de la matriz de aplicación al código backend.

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/warehouse/reports/inventory/excel
    participant Controller as exportWarehouseReportExcel
    participant Domain as reportService.findWarehouseReportRows / sendExcelReport
    Note over Route,Domain: BE-P07 query de dominio + sendExcelReport
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/reports/inventory/excel
    Route->>Controller: invocar exportWarehouseReportExcel
    Controller->>Domain: reportService.findWarehouseReportRows y sendExcelReport
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-REP-04`

**Identificador:** `DIA-BE-CU-REP-04`. **Fuente:** fila `CU-REP-04` de la matriz de aplicación al código backend.

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/warehouse/reports/goods-issues/excel
    participant Controller as exportGoodsIssueReportExcel
    participant Domain as reportService.findGoodsIssueReportRows / sendExcelReport
    Note over Route,Domain: BE-P07 query de dominio + sendExcelReport
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/reports/goods-issues/excel
    Route->>Controller: invocar exportGoodsIssueReportExcel
    Controller->>Domain: reportService.findGoodsIssueReportRows y sendExcelReport
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-REP-05`

**Identificador:** `DIA-BE-CU-REP-05`. **Fuente:** fila `CU-REP-05` de la matriz de aplicación al código backend.

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/admin/reports/movements/materials/excel
    participant Controller as exportMovementReport
    participant Domain as inventory/reportService.findMovementReportRows
    Note over Route,Domain: BE-P07 query de dominio + sendExcelReport
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/admin/reports/movements/materials/excel
    Route->>Controller: invocar exportMovementReport
    Controller->>Domain: inventory/reportService.findMovementReportRows y respuesta Excel
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-REP-06`

**Identificador:** `DIA-BE-CU-REP-06`. **Fuente:** fila `CU-REP-06` de la matriz de aplicación al código backend.

**Patrones:** `BE-P06`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/warehouse/wastes
    participant Controller as getAllWastes
    participant Domain as wasteService.findAllWastes
    Note over Route,Domain: BE-P06 controller de listado + query contextual
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/wastes
    Route->>Controller: invocar getAllWastes
    Controller->>Domain: Reutiliza wasteService.findAllWastes con filtros, sólo lectura
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-REP-07`

**Identificador:** `DIA-BE-CU-REP-07`. **Fuente:** fila `CU-REP-07` de la matriz de aplicación al código backend.

**Patrones:** `BE-P06`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/admin/movements/wastes
    participant Controller as getAllWasteMovements
    participant Domain as movementQueryService.findAllWasteMovements
    Note over Route,Domain: BE-P06 controller de listado + query contextual
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/admin/movements/wastes
    Route->>Controller: invocar getAllWasteMovements
    Controller->>Domain: movementQueryService.findAllWasteMovements, sólo lectura
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-REP-08`

**Identificador:** `DIA-BE-CU-REP-08`. **Fuente:** fila `CU-REP-08` de la matriz de aplicación al código backend.

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/warehouse/reports/waste-issues/excel
    participant Controller as exportWasteIssueReportExcel
    participant Domain as reportService.findWasteIssueReportRows / sendExcelReport
    Note over Route,Domain: BE-P07 query de dominio + sendExcelReport
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/reports/waste-issues/excel
    Route->>Controller: invocar exportWasteIssueReportExcel
    Controller->>Domain: reportService.findWasteIssueReportRows y sendExcelReport
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-REP-09`

**Identificador:** `DIA-BE-CU-REP-09`. **Fuente:** fila `CU-REP-09` de la matriz de aplicación al código backend.

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/warehouse/reports/wastes/excel
    participant Controller as exportWasteReportExcel
    participant Domain as reportService.findWasteReportRows / sendExcelReport
    Note over Route,Domain: BE-P07 query de dominio + sendExcelReport
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/reports/wastes/excel
    Route->>Controller: invocar exportWasteReportExcel
    Controller->>Domain: reportService.findWasteReportRows y sendExcelReport
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-REP-10`

**Identificador:** `DIA-BE-CU-REP-10`. **Fuente:** fila `CU-REP-10` de la matriz de aplicación al código backend.

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/admin/reports/movements/wastes/excel
    participant Controller as exportWasteMovementReport
    participant Domain as inventory/reportService.findMovementReportRows
    Note over Route,Domain: BE-P07 query de dominio + sendExcelReport
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/admin/reports/movements/wastes/excel
    Route->>Controller: invocar exportWasteMovementReport
    Controller->>Domain: inventory/reportService.findMovementReportRows en contexto merma y respuesta Excel
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-REP-11`

**Identificador:** `DIA-BE-CU-REP-11`. **Fuente:** fila `CU-REP-11` de la matriz de aplicación al código backend.

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/warehouse/reports/goods-receipts/excel
    participant Controller as exportGoodsReceiptReportExcel
    participant Domain as reportService.findGoodsReceiptReportRows / sendExcelReport
    Note over Route,Domain: BE-P07 query de dominio + sendExcelReport
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/reports/goods-receipts/excel
    Route->>Controller: invocar exportGoodsReceiptReportExcel
    Controller->>Domain: reportService.findGoodsReceiptReportRows y sendExcelReport
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-REP-12`

**Identificador:** `DIA-BE-CU-REP-12`. **Fuente:** fila `CU-REP-12` de la matriz de aplicación al código backend.

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/warehouse/reports/suppliers/excel
    participant Controller as exportSupplierReportExcel
    participant Domain as reportService.findSupplierReportRows / sendExcelReport
    Note over Route,Domain: BE-P07 query de dominio + sendExcelReport
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/reports/suppliers/excel
    Route->>Controller: invocar exportSupplierReportExcel
    Controller->>Domain: reportService.findSupplierReportRows y sendExcelReport
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-REP-13`

**Identificador:** `DIA-BE-CU-REP-13`. **Fuente:** fila `CU-REP-13` de la matriz de aplicación al código backend.

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/sales/reports/clients/excel
    participant Controller as exportClientReport
    participant Domain as clientService.findAllClients / sendExcelReport
    Note over Route,Domain: BE-P07 query de dominio + sendExcelReport
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/sales/reports/clients/excel
    Route->>Controller: invocar exportClientReport
    Controller->>Domain: clientService.findAllClients prepara filas y el controller llama sendExcelReport
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-REP-14`

**Identificador:** `DIA-BE-CU-REP-14`. **Fuente:** fila `CU-REP-14` de la matriz de aplicación al código backend.

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/admin/reports/persons/excel
    participant Controller as exportPersonReport
    participant Domain as personService.findAllPersons / sendExcelReport
    Note over Route,Domain: BE-P07 query de dominio + sendExcelReport
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/admin/reports/persons/excel
    Route->>Controller: invocar exportPersonReport
    Controller->>Domain: personService.findAllPersons prepara filas y el controller llama sendExcelReport
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```

## `CU-REP-15`

**Identificador:** `DIA-BE-CU-REP-15`. **Fuente:** fila `CU-REP-15` de la matriz de aplicación al código backend.

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as GET /api/admin/reports/users/excel
    participant Controller as exportUserReport
    participant Domain as userService.findAllUsers / sendExcelReport
    Note over Route,Domain: BE-P07 query de dominio + sendExcelReport
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/admin/reports/users/excel
    Route->>Controller: invocar exportUserReport
    Controller->>Domain: userService.findAllUsers prepara filas y el controller llama sendExcelReport
    Domain-->>Controller: devolver resultado o error del caso
    Controller-->>Client: emitir respuesta observable
```
