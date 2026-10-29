# Inventario y merma: componentes

**Identificador:** `DIA-VUE-COMP-002`. **Pregunta:** ¿Qué colaboradores tienen responsabilidad propia y qué contratos los conectan?

**Fuente:** InventoryWorkspace, InventoryPage, useInventoryEditor, useInventorySelection, inventoryService y pendingWasteOperation. **Notación y alcance:** Las flechas indican dependencia o consumo; no orden temporal ni herencia.

**Lectura visual:** [formas, límites y flechas del mapa](../../diagram-reading.md#mapas-y-actividades).

```mermaid
flowchart TB
    workspace["InventoryWorkspace"] --> page["InventoryPage"]
    workspace --> auxiliary["DirectoryCreationPage · proveedor"]
    page --> list["useInventoryList · query y filas"]
    page --> editor["InventoryEditorPage y useInventoryEditor"]
    editor --> ui["InventoryEditor · presentación"]
    editor --> selection["useInventorySelection · catálogos y dependencias"]
    editor --> rules["formModel · esquema, preview y payload"]
    editor --> pending["pendingWasteOperation · captura incierta"]
    editor --> duplicate["useWasteDuplicateRecovery · confirmación"]
    list --> api["inventoryService y apiClient"]
    editor --> api
    selection --> lookups["useRemoteOptions y servicios de catálogo"]
```
