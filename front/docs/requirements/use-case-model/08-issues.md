# Salidas: modelo de casos de uso

Las líneas actor–caso indican participación; las líneas desde Consulta relacionan
las operaciones disponibles. No conceden permisos. El Administrador hereda las
asociaciones de Personal de almacén; las funciones exclusivas tienen actor propio.

Las altas auxiliares son opcionales: `«extend»` apunta del alta a la captura principal.
Requieren el permiso de alta y devuelven el registro seleccionado sin guardar el documento principal.

Las asociaciones representan participación autorizada: las áreas operativas consultan,
registran y editan sus solicitudes; Personal de almacén también surte, devuelve y genera
reportes. El Administrador del sistema hereda las funciones de almacén. Una consulta no
concede por sí misma acceso a las demás operaciones.

Crear cliente se relaciona mediante `«extend»` con Crear salida y Editar encabezado.
La salida puede completarse con un cliente existente; el alta auxiliar es opcional.
Surtir y Devolver conservan su actor específico y se inician según estado y permiso;
no son inclusiones obligatorias de Consulta ni de Crear salida.

El punto de extensión es la selección de Cliente del paso 3 al crear una salida
o editar su encabezado. Con permisos de lectura/alta de Directorio y cliente
editable, se escribe un nombre sin coincidencia y se elige **Registrar cliente**.
`CU-CAT-06` devuelve el cliente activo y retoma la captura; cancelar conserva la
selección anterior. El alta auxiliar no guarda la salida. Las áreas operativas,
el surtimiento y la devolución no permiten esta extensión.

## Salidas de materiales

**Identificador:** `DIA-VUE-CU-020`. **Pregunta:** ¿Qué actor puede realizar cada objetivo?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor operational("Usuario de área operativa")
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

    systemBoundary issuePackage1["Nexus · Salidas de materiales"]
        ucMaterialIssueQuery("CU-SAL-01 Consultar")
        ucMaterialIssueCreate("CU-SAL-02 Crear")
        ucMaterialIssueHeader("CU-SAL-03 Editar encabezado")
        ucMaterialIssueDetails("CU-SAL-04 Editar detalles")
        ucMaterialSupply("CU-SAL-05 Surtir")
        ucMaterialReturn("CU-SAL-06 Devolver")
        ucMaterialIssueReport("CU-SAL-07 Generar reporte")
        clientExtension("CU-CAT-06 Crear cliente")
    end

    operational -- ucMaterialIssueQuery
    warehouse -- ucMaterialIssueQuery
    ucMaterialIssueQuery -- ucMaterialIssueDetails
    ucMaterialIssueQuery -- ucMaterialIssueHeader
    ucMaterialIssueQuery -- ucMaterialIssueCreate
    warehouse -- ucMaterialSupply
    warehouse -- ucMaterialReturn
    warehouse -- ucMaterialIssueReport
    warehouse -- clientExtension
    clientExtension ..>:extend ucMaterialIssueCreate
    clientExtension ..>:extend ucMaterialIssueHeader
```

## Salidas de mermas

**Identificador:** `DIA-VUE-CU-021`. **Pregunta:** ¿Qué actor puede realizar cada objetivo?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor operational("Usuario de área operativa")
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

    systemBoundary issuePackage2["Nexus · Salidas de mermas"]
        ucWasteIssueQuery("CU-SAL-08 Consultar")
        ucWasteIssueCreate("CU-SAL-09 Crear")
        ucWasteIssueHeader("CU-SAL-10 Editar encabezado")
        ucWasteIssueDetails("CU-SAL-11 Editar detalles")
        ucWasteSupply("CU-SAL-12 Surtir")
        ucWasteReturn("CU-SAL-13 Devolver")
        ucWasteIssueReport("CU-SAL-14 Generar reporte")
        clientExtension("CU-CAT-06 Crear cliente")
    end

    operational -- ucWasteIssueQuery
    warehouse -- ucWasteIssueQuery
    ucWasteIssueQuery -- ucWasteIssueDetails
    ucWasteIssueQuery -- ucWasteIssueHeader
    ucWasteIssueQuery -- ucWasteIssueCreate
    warehouse -- ucWasteSupply
    warehouse -- ucWasteReturn
    warehouse -- ucWasteIssueReport
    warehouse -- clientExtension
    clientExtension ..>:extend ucWasteIssueCreate
    clientExtension ..>:extend ucWasteIssueHeader
```

## Salidas de consumibles

**Identificador:** `DIA-VUE-CU-022`. **Pregunta:** ¿Qué actor puede realizar cada objetivo?

**Fuente:** fichas CU del catálogo local y permisos públicos del recurso.

```mermaid
usecase-beta
%%{init: {"layout": "dagre"}}%%
direction LR
    actor operational("Usuario de área operativa")
    actor warehouse("Personal de almacén")
    actor admin("Administrador del sistema")
    admin --|> warehouse

    systemBoundary issuePackage3["Nexus · Salidas de consumibles"]
        ucConsumableIssueQuery("CU-SAL-15 Consultar")
        ucConsumableIssueCreate("CU-SAL-16 Crear")
        ucConsumableIssueHeader("CU-SAL-17 Editar encabezado")
        ucConsumableIssueDetails("CU-SAL-18 Editar detalles")
        ucConsumableSupply("CU-SAL-19 Surtir")
        ucConsumableReturn("CU-SAL-20 Devolver")
        ucConsumableIssueReport("CU-SAL-21 Generar reporte")
        clientExtension("CU-CAT-06 Crear cliente")
    end

    operational -- ucConsumableIssueQuery
    warehouse -- ucConsumableIssueQuery
    ucConsumableIssueQuery -- ucConsumableIssueDetails
    ucConsumableIssueQuery -- ucConsumableIssueHeader
    ucConsumableIssueQuery -- ucConsumableIssueCreate
    warehouse -- ucConsumableSupply
    warehouse -- ucConsumableReturn
    warehouse -- ucConsumableIssueReport
    warehouse -- clientExtension
    clientExtension ..>:extend ucConsumableIssueCreate
    clientExtension ..>:extend ucConsumableIssueHeader
```
