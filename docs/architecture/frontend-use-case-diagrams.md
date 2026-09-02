# Diagramas de casos aplicados al código frontend

Cada bloque representa un solo caso de uso con los elementos concretos documentados en
la [matriz técnica de frontend](frontend-technical-documentation.md#aplicación-de-todos-los-casos-al-código-frontend).
La flecha significa **Interacción o composición → Aplicación, request y resultado**; no
representa una regla compartida ni permite sustituir participantes de otro caso. Se
conserva una vista por caso incluso cuando la estructura se repite, porque cambian
módulos, símbolos, rutas o efectos.
El orden sigue los identificadores del catálogo para facilitar la revisión técnica; no
convierte `REP` en una sección independiente del manual ni altera el recorrido del
módulo desde el que se exporta.

## Vista canónica de reutilización frontend

**Identificador:** `DIA-FE-REU-001`. Las flechas discontinuas significan configuración o consumo; las continuas muestran la especialización que conserva módulos, requests y reglas por caso.

```mermaid
flowchart TB
    patterns["DIA-PAT-CON-001<br/>Factories y composición"] -.-> crud
    patterns -.-> list
    patterns -.-> issue
    patterns -.-> report
    perspectives["DIA-FE-PER-CMP/SEQ/EST-001<br/>Composición · orden · modos"] -.-> resourceApps
    perspectives -.-> concrete
    crud["createCrudApplication"] -.-> resourceApps["Aplicaciones CRUD configuradas por recurso"]
    list["createApplicationList"] -.-> catalogs["Catálogos de sólo lectura"]
    issue["createIssueApplication"] -.-> issueApps["Salidas de material y merma"]
    returnUi["issueReturnUI"] -.-> issueApps
    report["createReportApplication"] -.-> reportApps["Exportaciones por dominio"]
    forms["useForm / UI / DataTable compartidos"] -.-> resourceApps
    request["apiRequest"] -.-> resourceApps
    navigation["Layout y navegación compartidos"] -.-> concrete
    resourceApps --> concrete["Página, request y endpoint del CU específico"]
    catalogs --> concrete
    issueApps --> concrete
    reportApps --> concrete
```

Esta vista parte de `DIA-PAT-CON-001` y enlaza las perspectivas
`DIA-FE-PER-CMP-001`, `DIA-FE-PER-SEQ-001` y `DIA-FE-PER-EST-001`; los diagramas
`DIA-FE-CU-*` la referencian e
indican cuál de sus piezas usa el caso. La cadena demuestra reutilización existente; el
recorrido continuo conserva la especialización concreta y permite evaluar una
refactorización sin afirmar que dos casos son idénticos.

### Índice rápido de patrones por caso

Cada caso conserva una línea **Patrones** con códigos de este índice. La tabla concentra
la explicación y evita repetirla 63 veces; la línea local permite identificar de
inmediato qué construcción configura el caso. Los patrones se apoyan en el
[catálogo canónico](design-and-construction-patterns.md#resumen-de-patrones-confirmados).

| Código | Patrón aplicado | Elementos que permiten reconocerlo |
| --- | --- | --- |
| `FE-P01` | Capas del navegador | Página/UI → aplicación → servicio HTTP → endpoint. |
| `FE-P02` | Factory CRUD | `createCrudApplication` configurada con requests y claves del recurso. |
| `FE-P03` | Factory/adaptador de catálogo | `createApplicationList` + request y transformación de opciones. |
| `FE-P04` | Mutación por composición | Operación adicional incorporada al CRUD sin herencia. |
| `FE-P05` | Composición de salidas | `createIssueApplication` configurada para material o merma. |
| `FE-P06` | UI de devolución compartida | `issueReturnUI` parametrizada por el contexto de la salida. |
| `FE-P07` | Consulta tabular | DataTable + filtros + aplicación de lectura contextual. |
| `FE-P08` | Factory de reporte | `createReportApplication` + `buildExcelButton` y request de descarga. |
| `FE-P09` | Navegación compuesta | Formulario o layout común coordina navegación/sesión sin duplicar el endpoint. |

### Cobertura de casos frontend

La comparación con el catálogo de casos y la matriz técnica confirma que no faltan
vistas frontend. Cada identificador del rango aparece una vez y contiene un bloque
Mermaid; cuando no existe una pantalla independiente, la vista señala el componente
consumidor real en lugar de inventar una interfaz.

| Grupo | Rango cubierto | Diagramas | Estado |
| --- | --- | ---: | --- |
| Autenticación | `CU-AUT-01..02` | 2 | Completo |
| Identidad y acceso | `CU-IDA-01..09` | 9 | Completo |
| Catálogos | `CU-CAT-01..20` | 20 | Completo |
| Entradas | `CU-ENT-01..05` | 5 | Completo |
| Salidas | `CU-SAL-01..12` | 12 | Completo |
| Consultas y reportes | `CU-REP-01..15` | 15 | Completo |
| **Total** | `CU-AUT-01..CU-REP-15` | **63** | **63 de 63** |

## Perspectivas complementarias del frontend

La vista por caso responde **qué interacción y transporte lo aplican**. Estas
perspectivas canónicas explican composición, orden asíncrono y estado visual; cada
`DIA-FE-CU-*` las alcanza mediante `DIA-FE-REU-001` sin perder sus módulos concretos.

### Componentes y dependencias del navegador

**Identificador:** `DIA-FE-PER-CMP-001`. **Perspectiva:** estructura estática de las
piezas que una página compone.

```mermaid
classDiagram
    class EjsPage {
        <<component>>
        +renderizarParciales()
    }
    class PageModule {
        <<component>>
        +inicializarPagina()
    }
    class FormOrModal {
        <<component>>
        +capturarInteraccion()
    }
    class Application {
        <<component>>
        +coordinarCaso()
    }
    class HttpService {
        <<component>>
        +apiRequest()
    }
    class SharedUi {
        <<component>>
        +forms()
        +datatable()
        +select2()
    }
    EjsPage --> PageModule
    EjsPage --> SharedUi
    PageModule --> FormOrModal
    FormOrModal --> SharedUi
    FormOrModal --> Application
    Application --> HttpService
```

### Secuencia de interacción y request

**Identificador:** `DIA-FE-PER-SEQ-001`. **Perspectiva:** orden de interacción desde la
página hasta el endpoint; cada caso sustituye los participantes por sus símbolos reales.

```mermaid
sequenceDiagram
    actor User as Actor del CU
    participant Page as Página / DataTable
    participant UI as Formulario, modal o diálogo
    participant App as Aplicación del recurso
    participant Service as Servicio HTTP
    participant API as Endpoint específico

    User->>Page: selecciona acción
    Page->>UI: abre o prepara contexto
    User->>UI: captura, filtra o confirma
    UI->>UI: valida interacción
    UI->>App: operación con datos del caso
    App->>Service: request configurado
    Service->>API: método, URL y payload
    API-->>Service: respuesta normalizada
    Service-->>App: resultado
    App-->>UI: refrescar, cerrar o descargar
```

### Estados de formularios y modales

**Identificador:** `DIA-FE-PER-EST-001`. **Perspectiva:** modos implementados por
`FORM_MODES`; no representa estados persistentes de entradas o salidas.

```mermaid
stateDiagram-v2
    [*] --> Cerrado
    Cerrado --> Create: openModal(CREATE)
    Cerrado --> Edit: openModal(EDIT)
    Cerrado --> EditPassword: openModal(EDIT_PASSWORD)
    Cerrado --> EditStock: openModal(EDIT_STOCK)
    Cerrado --> EditHeader: openModal(EDIT_HEADER)
    Cerrado --> EditDetail: openModal(EDIT_DETAIL)
    Cerrado --> Return: openModal(RETURN)
    Cerrado --> View: openModal(VIEW)
    Create --> Enviando: submit
    Edit --> Enviando: submit
    EditPassword --> Enviando: submit
    EditStock --> Enviando: submit
    EditHeader --> Enviando: submit
    EditDetail --> Enviando: submit
    Return --> Enviando: submit
    Enviando --> Cerrado: respuesta exitosa
    Enviando --> Create: error de alta
    Enviando --> Edit: error de edición
    Enviando --> EditPassword: error de contraseña
    Enviando --> EditStock: error de ajuste
    Enviando --> EditHeader: error de encabezado
    Enviando --> EditDetail: error de detalle
    Enviando --> Return: error de devolución
    View --> Cerrado: cerrar
```

## `CU-AUT-01`

**Identificador:** `DIA-FE-CU-AUT-01`. **Fuente:** fila `CU-AUT-01` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `apiRequest y composición de navegación`.

**Patrones:** `FE-P01`, `FE-P09`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>apiRequest y composición de navegación"] -.-> source
    source["loginPage.ejs → loginForm.js"] --> target["login → loginRequest; envía POST /api/auth/login y navega al inicio"]
```

## `CU-AUT-02`

**Identificador:** `DIA-FE-CU-AUT-02`. **Fuente:** fila `CU-AUT-02` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `composición de navegación compartida`.

**Patrones:** `FE-P09`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>composición de navegación compartida"] -.-> source
    source["Opción Cerrar sesión de la navegación compartida"] --> target["Navega a /cerrar-sesion; el cierre es web y no usa una mutación de authService.js"]
```

## `CU-IDA-01`

**Identificador:** `DIA-FE-CU-IDA-01`. **Fuente:** fila `CU-IDA-01` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["personsPage.ejs y personsPage.js cargan la tabla"] --> target["getAllPersons → getAllPersonsRequest; consulta GET /api/admin/persons"]
```

## `CU-IDA-02`

**Identificador:** `DIA-FE-CU-IDA-02`. **Fuente:** fila `CU-IDA-02` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["personModal.js abre personForm.js en modo alta"] --> target["registerPerson → registerPersonRequest; envía POST /api/admin/persons"]
```

## `CU-IDA-03`

**Identificador:** `DIA-FE-CU-IDA-03`. **Fuente:** fila `CU-IDA-03` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["personModal.js precarga la persona seleccionada"] --> target["updatePerson → updatePersonRequest; envía PUT /api/admin/persons/:id"]
```

## `CU-IDA-04`

**Identificador:** `DIA-FE-CU-IDA-04`. **Fuente:** fila `CU-IDA-04` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["usersPage.ejs y usersPage.js cargan la tabla"] --> target["getAllUsers → getAllUsersRequest; consulta GET /api/admin/users"]
```

## `CU-IDA-05`

**Identificador:** `DIA-FE-CU-IDA-05`. **Fuente:** fila `CU-IDA-05` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["userModal.js abre userForm.js para una cuenta nueva"] --> target["registerUser → registerUserRequest; envía POST /api/admin/users"]
```

## `CU-IDA-06`

**Identificador:** `DIA-FE-CU-IDA-06`. **Fuente:** fila `CU-IDA-06` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["userModal.js abre la cuenta y acceso existentes"] --> target["editUser → editUserRequest; envía PATCH /api/admin/users/:id"]
```

## `CU-IDA-07`

**Identificador:** `DIA-FE-CU-IDA-07`. **Fuente:** fila `CU-IDA-07` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["userForm.js selecciona el modo de contraseña"] --> target["editUserPassword → editUserPasswordRequest; envía PATCH /api/admin/users/:id/password"]
```

## `CU-IDA-08`

**Identificador:** `DIA-FE-CU-IDA-08`. **Fuente:** fila `CU-IDA-08` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createApplicationList y catálogos compartidos`.

**Patrones:** `FE-P03`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createApplicationList y catálogos compartidos"] -.-> source
    source["Select de rol dentro de formularios de personas y usuarios"] --> target["getAllRoles → getAllRolesRequest; consume GET /api/admin/roles"]
```

## `CU-IDA-09`

**Identificador:** `DIA-FE-CU-IDA-09`. **Fuente:** fila `CU-IDA-09` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createApplicationList y catálogos compartidos`.

**Patrones:** `FE-P03`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createApplicationList y catálogos compartidos"] -.-> source
    source["Select de departamento dentro de formularios de personas y usuarios"] --> target["getAllDepartments → getAllDepartmentsRequest; consume GET /api/admin/departments"]
```

## `CU-CAT-01`

**Identificador:** `DIA-FE-CU-CAT-01`. **Fuente:** fila `CU-CAT-01` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["materialsPage.ejs y materialsPage.js cargan inventario"] --> target["getAllMaterials → getAllMaterialsRequest; consulta GET /api/warehouse/materials"]
```

## `CU-CAT-02`

**Identificador:** `DIA-FE-CU-CAT-02`. **Fuente:** fila `CU-CAT-02` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["materialModal.js abre materialForm.js en modo alta"] --> target["registerMaterial → registerMaterialRequest; envía POST /api/warehouse/materials"]
```

## `CU-CAT-03`

**Identificador:** `DIA-FE-CU-CAT-03`. **Fuente:** fila `CU-CAT-03` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["materialModal.js precarga material y relación con proveedor"] --> target["editMaterial → editMaterialRequest; envía PATCH /api/warehouse/materials/:id"]
```

## `CU-CAT-04`

**Identificador:** `DIA-FE-CU-CAT-04`. **Fuente:** fila `CU-CAT-04` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["Acción de retiro en materialDatatable.js"] --> target["deleteMaterial → deleteMaterialRequest; envía DELETE /api/warehouse/materials/:id"]
```

## `CU-CAT-05`

**Identificador:** `DIA-FE-CU-CAT-05`. **Fuente:** fila `CU-CAT-05` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["materialForm.js usa el modo de ajuste de existencia"] --> target["editMaterialStock → editMaterialStockRequest; envía PATCH /api/warehouse/materials/:id/stock"]
```

## `CU-CAT-06`

**Identificador:** `DIA-FE-CU-CAT-06`. **Fuente:** fila `CU-CAT-06` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["suppliersPage.ejs y suppliersPage.js cargan proveedores"] --> target["getAllSuppliers → getAllSuppliersRequest; consulta GET /api/warehouse/suppliers"]
```

## `CU-CAT-07`

**Identificador:** `DIA-FE-CU-CAT-07`. **Fuente:** fila `CU-CAT-07` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["supplierModal.js abre supplierForm.js en alta"] --> target["registerSupplier → registerSupplierRequest; envía POST /api/warehouse/suppliers"]
```

## `CU-CAT-08`

**Identificador:** `DIA-FE-CU-CAT-08`. **Fuente:** fila `CU-CAT-08` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["supplierModal.js precarga el proveedor"] --> target["editSupplier → editSupplierRequest; envía PUT /api/warehouse/suppliers/:id"]
```

## `CU-CAT-09`

**Identificador:** `DIA-FE-CU-CAT-09`. **Fuente:** fila `CU-CAT-09` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["El estado se edita en supplierForm.js; no hay pantalla separada"] --> target["editSupplier conserva el contexto y usa PUT /api/warehouse/suppliers/:id"]
```

## `CU-CAT-10`

**Identificador:** `DIA-FE-CU-CAT-10`. **Fuente:** fila `CU-CAT-10` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["clientsPage.ejs y clientsPage.js cargan clientes"] --> target["getAllClients → getAllClientsRequest; consulta GET /api/sales/clients"]
```

## `CU-CAT-11`

**Identificador:** `DIA-FE-CU-CAT-11`. **Fuente:** fila `CU-CAT-11` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["clientModal.js abre clientForm.js en alta"] --> target["registerClient → createClientRequest; envía POST /api/sales/clients"]
```

## `CU-CAT-12`

**Identificador:** `DIA-FE-CU-CAT-12`. **Fuente:** fila `CU-CAT-12` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["clientModal.js precarga el cliente"] --> target["editClient → editClientRequest; envía PUT /api/sales/clients/:id"]
```

## `CU-CAT-13`

**Identificador:** `DIA-FE-CU-CAT-13`. **Fuente:** fila `CU-CAT-13` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["wastesPage.ejs y wastesPage.js cargan mermas"] --> target["getAllWastes → getAllWastesRequest; consulta GET /api/warehouse/wastes"]
```

## `CU-CAT-14`

**Identificador:** `DIA-FE-CU-CAT-14`. **Fuente:** fila `CU-CAT-14` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["wasteModal.js y wasteForm.js seleccionan una plantilla de material"] --> target["getWasteMaterialTemplates prepara datos y registerWaste envía POST /api/warehouse/wastes"]
```

## `CU-CAT-15`

**Identificador:** `DIA-FE-CU-CAT-15`. **Fuente:** fila `CU-CAT-15` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["wasteModal.js precarga la merma"] --> target["editWaste → editWasteRequest; envía PATCH /api/warehouse/wastes/:id"]
```

## `CU-CAT-16`

**Identificador:** `DIA-FE-CU-CAT-16`. **Fuente:** fila `CU-CAT-16` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication y UI/formularios compartidos`.

**Patrones:** `FE-P02`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication y UI/formularios compartidos"] -.-> source
    source["wasteForm.js usa el modo de ajuste"] --> target["editWasteStock → editWasteStockRequest; envía PATCH /api/warehouse/wastes/:id/stock"]
```

## `CU-CAT-17`

**Identificador:** `DIA-FE-CU-CAT-17`. **Fuente:** fila `CU-CAT-17` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createApplicationList y catálogos compartidos`.

**Patrones:** `FE-P03`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createApplicationList y catálogos compartidos"] -.-> source
    source["Select de presentación en materialFields.js y wasteFields.js"] --> target["getAllPresentations → getAllPresentationsRequest; consume GET /api/warehouse/presentations"]
```

## `CU-CAT-18`

**Identificador:** `DIA-FE-CU-CAT-18`. **Fuente:** fila `CU-CAT-18` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createApplicationList y catálogos compartidos`.

**Patrones:** `FE-P03`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createApplicationList y catálogos compartidos"] -.-> source
    source["Select de unidad en formularios de material y merma"] --> target["getAllUnitMeasures → getAllUnitMeasuresRequest; consume GET /api/warehouse/unit-measures"]
```

## `CU-CAT-19`

**Identificador:** `DIA-FE-CU-CAT-19`. **Fuente:** fila `CU-CAT-19` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createApplicationList y catálogos compartidos`.

**Patrones:** `FE-P03`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createApplicationList y catálogos compartidos"] -.-> source
    source["Select de motivo en los modos de ajuste"] --> target["getAllReasons → getAllReasonsRequest; consume GET /api/warehouse/reasons"]
```

## `CU-CAT-20`

**Identificador:** `DIA-FE-CU-CAT-20`. **Fuente:** fila `CU-CAT-20` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createApplicationList y catálogos compartidos`.

**Patrones:** `FE-P03`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createApplicationList y catálogos compartidos"] -.-> source
    source["Estado visible en tablas y formularios de salidas"] --> target["getAllFulfillmentStatuses → request homólogo; consume GET /api/warehouse/fulfillment-statuses"]
```

## `CU-ENT-01`

**Identificador:** `DIA-FE-CU-ENT-01`. **Fuente:** fila `CU-ENT-01` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication con mutaciones adicionales`.

**Patrones:** `FE-P02`, `FE-P04`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication con mutaciones adicionales"] -.-> source
    source["goodsReceiptsPage.ejs y su DataTable cargan compras"] --> target["getAllGoodsReceipts → request homólogo; consulta GET /api/warehouse/goods-receipts"]
```

## `CU-ENT-02`

**Identificador:** `DIA-FE-CU-ENT-02`. **Fuente:** fila `CU-ENT-02` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication con mutaciones adicionales`.

**Patrones:** `FE-P02`, `FE-P04`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication con mutaciones adicionales"] -.-> source
    source["goodsReceiptModal.js captura encabezado y detalles"] --> target["registerGoodsReceipt → registerGoodsReceiptRequest; envía POST /api/warehouse/goods-receipts"]
```

## `CU-ENT-03`

**Identificador:** `DIA-FE-CU-ENT-03`. **Fuente:** fila `CU-ENT-03` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication con mutaciones adicionales`.

**Patrones:** `FE-P02`, `FE-P04`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication con mutaciones adicionales"] -.-> source
    source["goodsReceiptModal.js abre una compra existente"] --> target["editGoodsReceiptHeader → request homólogo; envía PATCH /api/warehouse/goods-receipts/:id"]
```

## `CU-ENT-04`

**Identificador:** `DIA-FE-CU-ENT-04`. **Fuente:** fila `CU-ENT-04` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication con mutaciones adicionales`.

**Patrones:** `FE-P02`, `FE-P04`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication con mutaciones adicionales"] -.-> source
    source["correctionModal.js y correctionForm.js aíslan la corrección"] --> target["correctGoodsReceiptDetail → request homólogo; envía PATCH /api/warehouse/goods-receipts/:id/details/:detailId/corrections"]
```

## `CU-ENT-05`

**Identificador:** `DIA-FE-CU-ENT-05`. **Fuente:** fila `CU-ENT-05` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createCrudApplication con mutaciones adicionales`.

**Patrones:** `FE-P02`, `FE-P04`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createCrudApplication con mutaciones adicionales"] -.-> source
    source["Acción Cancelar del detalle en el modal de compra"] --> target["cancelGoodsReceiptDetail → request homólogo; envía PATCH /api/warehouse/goods-receipts/:id/details/:detailId/cancel"]
```

## `CU-SAL-01`

**Identificador:** `DIA-FE-CU-SAL-01`. **Fuente:** fila `CU-SAL-01` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createIssueApplication; issueReturnUI en devoluciones`.

**Patrones:** `FE-P05`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createIssueApplication; issueReturnUI en devoluciones"] -.-> source
    source["goodsIssuesPage.ejs y su DataTable cargan salidas"] --> target["getAllGoodsIssues → request homólogo; consulta GET /api/warehouse/goods-issues"]
```

## `CU-SAL-02`

**Identificador:** `DIA-FE-CU-SAL-02`. **Fuente:** fila `CU-SAL-02` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createIssueApplication; issueReturnUI en devoluciones`.

**Patrones:** `FE-P05`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createIssueApplication; issueReturnUI en devoluciones"] -.-> source
    source["goodsIssueModal.js captura documento y materiales"] --> target["registerGoodsIssue → request homólogo; envía POST /api/warehouse/goods-issues"]
```

## `CU-SAL-03`

**Identificador:** `DIA-FE-CU-SAL-03`. **Fuente:** fila `CU-SAL-03` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createIssueApplication; issueReturnUI en devoluciones`.

**Patrones:** `FE-P05`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createIssueApplication; issueReturnUI en devoluciones"] -.-> source
    source["Modo encabezado de goodsIssueModal.js"] --> target["editGoodsIssueHeader → request homólogo; envía PATCH /api/warehouse/goods-issues/:id/header"]
```

## `CU-SAL-04`

**Identificador:** `DIA-FE-CU-SAL-04`. **Fuente:** fila `CU-SAL-04` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createIssueApplication; issueReturnUI en devoluciones`.

**Patrones:** `FE-P05`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createIssueApplication; issueReturnUI en devoluciones"] -.-> source
    source["Modo detalles de goodsIssueModal.js"] --> target["editGoodsIssueDetails → request homólogo; envía PATCH /api/warehouse/goods-issues/:id/details"]
```

## `CU-SAL-05`

**Identificador:** `DIA-FE-CU-SAL-05`. **Fuente:** fila `CU-SAL-05` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createIssueApplication; issueReturnUI en devoluciones`.

**Patrones:** `FE-P05`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createIssueApplication; issueReturnUI en devoluciones"] -.-> source
    source["Acción Surtir dentro de los detalles de salida"] --> target["editGoodsIssueDetails envía cantidades a PATCH /api/warehouse/goods-issues/:id/details y refresca el documento"]
```

## `CU-SAL-06`

**Identificador:** `DIA-FE-CU-SAL-06`. **Fuente:** fila `CU-SAL-06` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createIssueApplication; issueReturnUI en devoluciones`.

**Patrones:** `FE-P05`, `FE-P06`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createIssueApplication; issueReturnUI en devoluciones"] -.-> source
    source["returns/goodsIssueReturn.js configura issueReturnUI"] --> target["returnGoodsIssueDetail → request homólogo; envía PATCH /api/warehouse/goods-issues/:id/details/:detailId/returns"]
```

## `CU-SAL-07`

**Identificador:** `DIA-FE-CU-SAL-07`. **Fuente:** fila `CU-SAL-07` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createIssueApplication; issueReturnUI en devoluciones`.

**Patrones:** `FE-P05`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createIssueApplication; issueReturnUI en devoluciones"] -.-> source
    source["wasteIssuesPage.ejs y su DataTable cargan salidas de merma"] --> target["getAllWasteIssues → request homólogo; consulta GET /api/warehouse/waste-issues"]
```

## `CU-SAL-08`

**Identificador:** `DIA-FE-CU-SAL-08`. **Fuente:** fila `CU-SAL-08` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createIssueApplication; issueReturnUI en devoluciones`.

**Patrones:** `FE-P05`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createIssueApplication; issueReturnUI en devoluciones"] -.-> source
    source["wasteIssueModal.js captura documento y mermas"] --> target["registerWasteIssue → request homólogo; envía POST /api/warehouse/waste-issues"]
```

## `CU-SAL-09`

**Identificador:** `DIA-FE-CU-SAL-09`. **Fuente:** fila `CU-SAL-09` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createIssueApplication; issueReturnUI en devoluciones`.

**Patrones:** `FE-P05`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createIssueApplication; issueReturnUI en devoluciones"] -.-> source
    source["Modo encabezado de wasteIssueModal.js"] --> target["editWasteIssueHeader → request homólogo; envía PATCH /api/warehouse/waste-issues/:id/header"]
```

## `CU-SAL-10`

**Identificador:** `DIA-FE-CU-SAL-10`. **Fuente:** fila `CU-SAL-10` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createIssueApplication; issueReturnUI en devoluciones`.

**Patrones:** `FE-P05`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createIssueApplication; issueReturnUI en devoluciones"] -.-> source
    source["Modo detalles de wasteIssueModal.js"] --> target["editWasteIssueDetails → request homólogo; envía PATCH /api/warehouse/waste-issues/:id/details"]
```

## `CU-SAL-11`

**Identificador:** `DIA-FE-CU-SAL-11`. **Fuente:** fila `CU-SAL-11` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createIssueApplication; issueReturnUI en devoluciones`.

**Patrones:** `FE-P05`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createIssueApplication; issueReturnUI en devoluciones"] -.-> source
    source["Acción Surtir dentro de los detalles de merma"] --> target["editWasteIssueDetails envía cantidades a PATCH /api/warehouse/waste-issues/:id/details y refresca el documento"]
```

## `CU-SAL-12`

**Identificador:** `DIA-FE-CU-SAL-12`. **Fuente:** fila `CU-SAL-12` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createIssueApplication; issueReturnUI en devoluciones`.

**Patrones:** `FE-P05`, `FE-P06`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createIssueApplication; issueReturnUI en devoluciones"] -.-> source
    source["returns/wasteIssueReturn.js configura issueReturnUI"] --> target["returnWasteIssueDetail → request homólogo; envía PATCH /api/warehouse/waste-issues/:id/details/:detailId/returns"]
```

## `CU-REP-01`

**Identificador:** `DIA-FE-CU-REP-01`. **Fuente:** fila `CU-REP-01` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `DataTable, filtros y aplicación de consulta compartidos`.

**Patrones:** `FE-P07`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>DataTable, filtros y aplicación de consulta compartidos"] -.-> source
    source["La consulta es el listado de materialsPage.js; no hay página de reporte"] --> target["Reutiliza getAllMaterialsRequest y sus filtros, sin mutación"]
```

## `CU-REP-02`

**Identificador:** `DIA-FE-CU-REP-02`. **Fuente:** fila `CU-REP-02` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `DataTable, filtros y aplicación de consulta compartidos`.

**Patrones:** `FE-P07`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>DataTable, filtros y aplicación de consulta compartidos"] -.-> source
    source["movementsPage.js selecciona el contexto material"] --> target["getAllMovements({ context: 'materials' }) consulta /api/admin/movements/materials"]
```

## `CU-REP-03`

**Identificador:** `DIA-FE-CU-REP-03`. **Fuente:** fila `CU-REP-03` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createReportApplication y buildExcelButton`.

**Patrones:** `FE-P08`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createReportApplication y buildExcelButton"] -.-> source
    source["Botón Excel de materialDatatable.js"] --> target["exportWarehouseReport → exportWarehouseReportRequest; descarga /api/warehouse/reports/inventory/excel"]
```

## `CU-REP-04`

**Identificador:** `DIA-FE-CU-REP-04`. **Fuente:** fila `CU-REP-04` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createReportApplication y buildExcelButton`.

**Patrones:** `FE-P08`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createReportApplication y buildExcelButton"] -.-> source
    source["Botón Excel del listado de salidas de material"] --> target["exportGoodsIssueReport → request homólogo; descarga /api/warehouse/reports/goods-issues/excel"]
```

## `CU-REP-05`

**Identificador:** `DIA-FE-CU-REP-05`. **Fuente:** fila `CU-REP-05` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createReportApplication y buildExcelButton`.

**Patrones:** `FE-P08`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createReportApplication y buildExcelButton"] -.-> source
    source["Botón Excel de movimientos en contexto material"] --> target["exportMovementReport → request con materials; descarga /api/admin/reports/movements/materials/excel"]
```

## `CU-REP-06`

**Identificador:** `DIA-FE-CU-REP-06`. **Fuente:** fila `CU-REP-06` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `DataTable, filtros y aplicación de consulta compartidos`.

**Patrones:** `FE-P07`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>DataTable, filtros y aplicación de consulta compartidos"] -.-> source
    source["La consulta es el listado de wastesPage.js; no hay página de reporte"] --> target["Reutiliza getAllWastesRequest y sus filtros, sin mutación"]
```

## `CU-REP-07`

**Identificador:** `DIA-FE-CU-REP-07`. **Fuente:** fila `CU-REP-07` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `DataTable, filtros y aplicación de consulta compartidos`.

**Patrones:** `FE-P07`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>DataTable, filtros y aplicación de consulta compartidos"] -.-> source
    source["movementsPage.js selecciona el contexto merma"] --> target["getAllMovements({ context: 'wastes' }) consulta /api/admin/movements/wastes"]
```

## `CU-REP-08`

**Identificador:** `DIA-FE-CU-REP-08`. **Fuente:** fila `CU-REP-08` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createReportApplication y buildExcelButton`.

**Patrones:** `FE-P08`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createReportApplication y buildExcelButton"] -.-> source
    source["Botón Excel del listado de salidas de merma"] --> target["exportWasteIssueReport → request homólogo; descarga /api/warehouse/reports/waste-issues/excel"]
```

## `CU-REP-09`

**Identificador:** `DIA-FE-CU-REP-09`. **Fuente:** fila `CU-REP-09` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createReportApplication y buildExcelButton`.

**Patrones:** `FE-P08`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createReportApplication y buildExcelButton"] -.-> source
    source["Botón Excel de wasteDatatable.js"] --> target["exportWasteReport → request homólogo; descarga /api/warehouse/reports/wastes/excel"]
```

## `CU-REP-10`

**Identificador:** `DIA-FE-CU-REP-10`. **Fuente:** fila `CU-REP-10` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createReportApplication y buildExcelButton`.

**Patrones:** `FE-P08`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createReportApplication y buildExcelButton"] -.-> source
    source["Botón Excel de movimientos en contexto merma"] --> target["exportMovementReport → request con wastes; descarga /api/admin/reports/movements/wastes/excel"]
```

## `CU-REP-11`

**Identificador:** `DIA-FE-CU-REP-11`. **Fuente:** fila `CU-REP-11` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createReportApplication y buildExcelButton`.

**Patrones:** `FE-P08`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createReportApplication y buildExcelButton"] -.-> source
    source["Botón Excel de goodsReceiptDatatable.js"] --> target["exportGoodsReceiptReport → request homólogo; descarga /api/warehouse/reports/goods-receipts/excel"]
```

## `CU-REP-12`

**Identificador:** `DIA-FE-CU-REP-12`. **Fuente:** fila `CU-REP-12` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createReportApplication y buildExcelButton`.

**Patrones:** `FE-P08`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createReportApplication y buildExcelButton"] -.-> source
    source["Botón Excel de supplierDatatable.js"] --> target["exportSupplierReport → request homólogo; descarga /api/warehouse/reports/suppliers/excel"]
```

## `CU-REP-13`

**Identificador:** `DIA-FE-CU-REP-13`. **Fuente:** fila `CU-REP-13` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createReportApplication y buildExcelButton`.

**Patrones:** `FE-P08`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createReportApplication y buildExcelButton"] -.-> source
    source["Botón Excel de clientDatatable.js"] --> target["exportClientReport → request homólogo; descarga /api/sales/reports/clients/excel"]
```

## `CU-REP-14`

**Identificador:** `DIA-FE-CU-REP-14`. **Fuente:** fila `CU-REP-14` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createReportApplication y buildExcelButton`.

**Patrones:** `FE-P08`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createReportApplication y buildExcelButton"] -.-> source
    source["Botón Excel de personDatatable.js"] --> target["exportPersonReport → request homólogo; descarga /api/admin/reports/persons/excel"]
```

## `CU-REP-15`

**Identificador:** `DIA-FE-CU-REP-15`. **Fuente:** fila `CU-REP-15` de la matriz de aplicación al código frontend. **Reutilización:** `DIA-FE-REU-001` · `createReportApplication y buildExcelButton`.

**Patrones:** `FE-P08`.

```mermaid
flowchart LR
    reuse["DIA-FE-REU-001<br/>createReportApplication y buildExcelButton"] -.-> source
    source["Botón Excel de userDatatable.js"] --> target["exportUserReport → request homólogo; descarga /api/admin/reports/users/excel"]
```
