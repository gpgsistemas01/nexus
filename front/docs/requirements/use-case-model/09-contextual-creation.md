# Altas desde selectores: modelo de casos de uso

Estas figuras muestran altas auxiliares de Inventario, Compras y Salidas. Comparten ID,
actor, condición, punto y retorno con sus fichas. El Administrador del sistema hereda la participación
de Almacén; las áreas operativas no obtienen permisos de Directorio por solicitar salidas.

Las líneas directas asocian Almacén con las altas; las flechas `«extend»` muestran cuándo
se insertan, sin transmitir permisos. Los diagramas por módulo muestran asociaciones
directas entre actores y objetivos para distinguir las operaciones autorizadas.

**Fuente:** `InventoryWorkspace`, `PurchaseEditorPage`, `IssueWorkspace`,
`IssueEditorPage` y las fichas de las capturas y altas auxiliares.
**Lectura visual:** [actores, extensiones y dirección de flechas](../../architecture/views/diagram-reading.md#casos-de-uso).

## Proveedor durante una captura

**Identificador:** `DIA-VUE-CU-024`. **Pregunta:** ¿Qué capturas permiten registrar un proveedor sin perder sus datos?

```mermaid
usecase-beta
direction LR
    actor warehouse("Personal de almacén")
    systemBoundary supplierContext["Nexus · Alta contextual de proveedor"]
        supplier("CU-CAT-02 Crear proveedor")
        material("CU-ALM-02 Crear existencia de material")
        consumable("CU-ALM-18 Crear existencia de consumible")
        materialPurchase("CU-ENT-02 Crear compra de material")
        consumablePurchase("CU-ENT-08 Crear compra de consumible")
    end
    warehouse -- supplier
    supplier ..>:extend material
    supplier ..>:extend consumable
    supplier ..>:extend materialPurchase
    supplier ..>:extend consumablePurchase
```

Con permisos de lectura y alta, el actor escribe el nombre en el selector; **Registrar
proveedor** aparece sólo si la búsqueda no encuentra una coincidencia. Al elegirlo, el
auxiliar devuelve el proveedor activo y reanuda la captura. En edición de compra el
proveedor permanece fijo, sin cambio ni alta auxiliar.

## Artículo para un detalle nuevo de compra

**Identificador:** `DIA-VUE-CU-025`. **Pregunta:** ¿Dónde puede darse de alta el artículo que falta en un detalle nuevo?

```mermaid
usecase-beta
direction LR
    actor warehouse("Personal de almacén")
    systemBoundary itemContext["Nexus · Artículo desde Compras"]
        item("CU-ALM-26 Crear artículo")
        createMaterialPurchase("CU-ENT-02 Crear compra de material")
        editMaterialPurchase("CU-ENT-03 Editar compra de material")
        createConsumablePurchase("CU-ENT-08 Crear compra de consumible")
        editConsumablePurchase("CU-ENT-09 Editar compra de consumible")
    end
    warehouse -- item
    item ..>:extend createMaterialPurchase
    item ..>:extend editMaterialPurchase
    item ..>:extend createConsumablePurchase
    item ..>:extend editConsumablePurchase
```

Requiere `material-catalogs:manage` y, para agregar el detalle, un proveedor
seleccionado. El alta registra sólo la identidad, sin oferta ni existencia inicial.
Al volver, el actor completa cantidad y costo y agrega el detalle. Registrar el
artículo no guarda la compra ni modifica un detalle persistido.

## Cliente durante una salida

**Identificador:** `DIA-VUE-CU-026`. **Pregunta:** ¿Qué capturas de salida permiten registrar el cliente que falta?

```mermaid
usecase-beta
direction LR
    actor warehouse("Personal de almacén")
    systemBoundary clientContext["Nexus · Cliente desde Salidas"]
        client("CU-CAT-06 Crear cliente")
        createMaterial("CU-SAL-02 Crear salida de material")
        headerMaterial("CU-SAL-03 Editar encabezado de salida de material")
        createWaste("CU-SAL-09 Crear salida de merma")
        headerWaste("CU-SAL-10 Editar encabezado de salida de merma")
        createConsumable("CU-SAL-16 Crear salida de consumible")
        headerConsumable("CU-SAL-17 Editar encabezado de salida de consumible")
    end
    warehouse -- client
    client ..>:extend createMaterial
    client ..>:extend headerMaterial
    client ..>:extend createWaste
    client ..>:extend headerWaste
    client ..>:extend createConsumable
    client ..>:extend headerConsumable
```

Con cliente editable y permisos de lectura/alta, el actor escribe el nombre en el selector;
**Registrar cliente** aparece sólo si la búsqueda no encuentra una coincidencia. Al elegirlo,
el auxiliar devuelve el cliente activo y reanuda la captura. Las áreas operativas no reciben
permisos de Directorio por solicitar salidas. No guarda la salida ni abre el Directorio
independiente.
Surtido y devolución bloquean el encabezado y no ofrecen esta extensión.
