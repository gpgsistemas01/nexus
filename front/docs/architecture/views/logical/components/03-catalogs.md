# Catálogos administrables: componentes

**Identificador:** `DIA-VUE-COMP-003`. **Pregunta:** ¿Qué colaboradores tienen responsabilidad propia y qué contratos los conectan?

**Fuente:** CatalogPage, useCatalogList, CatalogEditorPage, useCatalogEditor, catalogDefinition y catalogService. **Notación y alcance:** Las flechas indican dependencia o consumo; no orden temporal ni herencia.

**Lectura visual:** [formas, límites y flechas del mapa](../../diagram-reading.md#mapas-y-actividades).

```mermaid
flowchart TB
    page["CatalogPage"] --> list["useCatalogList y usePagedList"]
    page --> editorPage["CatalogEditorPage"]
    editorPage --> editor["useCatalogEditor"]
    editorPage --> form["CatalogForm"]
    page --> table["CatalogTable y ServerTable"]
    editor --> config["catalogDefinition · campos y límites"]
    editor --> interaction["VeeValidate y useFormInteraction"]
    editor --> save["useRecordSave · pendiente y conflicto"]
    list --> service["catalogService"]
    editor --> service
    service --> http["apiClient y confirmMutation"]
```

El corte representa elementos del cliente, no clases ni procesos desplegados. La [vista de procesos](../../processes/index.md) detalla orden, validación, rechazo y recuperación. Los contratos de props/eventos se localizan en la [referencia generada](../../development/code-reference.md).
