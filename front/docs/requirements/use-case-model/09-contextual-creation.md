# Altas desde selectores: modelo de casos de uso

Estos cortes amplían las capturas de Inventario, Compras y Salidas sin repetir sus
consultas y operaciones. Las fichas conservan el mismo ID, actor, punto de extensión,
condición y retorno que los demás modelos. El Administrador del sistema hereda la
participación de Almacén; las áreas operativas no reciben permisos de alta de
Directorio por poder solicitar una salida.

Las asociaciones directas identifican a Almacén como participante de las altas
auxiliares. La entrada a las capturas desde sus consultas se conserva en los cortes
funcionales, sin repetir esos enlaces aquí. Las flechas `«extend»` representan la
inserción condicionada del alta; no transmiten actores ni permisos.

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
        material("CU-ALM-02 Crear material")
        consumable("CU-ALM-18 Crear consumible")
        materialPurchase("CU-ENT-02 Crear compra de material")
        consumablePurchase("CU-ENT-08 Crear compra de consumible")
    end
    warehouse -- supplier
    supplier ..>:extend material
    supplier ..>:extend consumable
    supplier ..>:extend materialPurchase
    supplier ..>:extend consumablePurchase
```

Se activa cuando el actor no encuentra el proveedor y elige **Registrar proveedor**
con permisos de lectura y alta. El resultado guardado vuelve seleccionado al
formulario; cancelar conserva su captura. Editar una compra no permite cambiar ni
registrar otro proveedor: el existente permanece fijado.

## Artículo para una partida nueva de compra

**Identificador:** `DIA-VUE-CU-025`. **Pregunta:** ¿Dónde puede darse de alta el artículo que falta en una partida nueva?

```mermaid
usecase-beta
direction LR
    actor warehouse("Personal de almacén")
    systemBoundary itemContext["Nexus · Artículo desde Compras"]
        material("CU-ALM-02 Crear material")
        consumable("CU-ALM-18 Crear consumible")
        createMaterialPurchase("CU-ENT-02 Crear compra de material")
        editMaterialPurchase("CU-ENT-03 Editar compra de material")
        createConsumablePurchase("CU-ENT-08 Crear compra de consumible")
        editConsumablePurchase("CU-ENT-09 Editar compra de consumible")
    end
    warehouse -- material
    warehouse -- consumable
    material ..>:extend createMaterialPurchase
    material ..>:extend editMaterialPurchase
    consumable ..>:extend createConsumablePurchase
    consumable ..>:extend editConsumablePurchase
```

Requiere los permisos de artículo y catálogos auxiliares y un proveedor seleccionado.
El alta conserva ese proveedor y utiliza el contexto de compra, sin existencia
inicial ni costo máximo. Al volver, el actor completa cantidad y costo y agrega el
renglón. Registrar el artículo no guarda la compra ni modifica una partida persistida.

## Cliente durante una salida

**Identificador:** `DIA-VUE-CU-026`. **Pregunta:** ¿Qué capturas de salida permiten registrar el cliente que falta?

```mermaid
usecase-beta
direction LR
    actor warehouse("Personal de almacén")
    systemBoundary clientContext["Nexus · Cliente desde Salidas"]
        client("CU-CAT-06 Crear cliente")
        createMaterial("CU-SAL-02 Crear salida de material")
        headerMaterial("CU-SAL-03 Editar encabezado de material")
        createWaste("CU-SAL-09 Crear salida de merma")
        headerWaste("CU-SAL-10 Editar encabezado de merma")
        createConsumable("CU-SAL-16 Crear salida de consumible")
        headerConsumable("CU-SAL-17 Editar encabezado de consumible")
    end
    warehouse -- client
    client ..>:extend createMaterial
    client ..>:extend headerMaterial
    client ..>:extend createWaste
    client ..>:extend headerWaste
    client ..>:extend createConsumable
    client ..>:extend headerConsumable
```

La selección de cliente debe ser editable y el actor debe tener lectura y alta de
Clientes. **Registrar cliente** devuelve el registro confirmado y reanuda la captura;
no guarda la salida ni concede consulta del Directorio independiente. Los modos de
surtido y devolución mantienen el encabezado bloqueado y no activan esta extensión.
