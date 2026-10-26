# 2. Contenedor y presentación

## Problema y decisión

Un componente que consulta la API, decide permisos y dibuja controles cambia por
motivos distintos. El contenedor coordina el caso; la presentación recibe props
y emite intenciones. En Vue esta separación se implementa con componentes y
composables; no exige crear un controlador Express dentro del navegador.

## Modelo general de contenedor y presentación

**Identificador:** `DIA-VUE-GEN-001`. **Pregunta:** ¿quién posee el estado y quién
presenta la interacción? **Fuente:** contratos de props/eventos de Vue y sus
consumidores actuales. Modelo conceptual; flechas continuas = consumo o datos
entregados, discontinuas = intenciones emitidas.

```mermaid
flowchart TB
    container["Contenedor<br/>coordina el caso"] -->|props| view["Presentación<br/>controles y texto"]
    view -.-> container
    container --> behavior["Comportamiento reactivo<br/>estado y operaciones"]
    behavior -.->|estado observable| container
```

## Aplicación en la página de Catálogos

**Identificador:** `DIA-VUE-APL-001`. **Pregunta:** ¿quién carga, presenta y abre la
edición de un catálogo? **Fuente:** `CatalogPage`, `useCatalogList`, `CatalogTable`
y `useListEditor`. Flechas continuas = composición; discontinuas = datos o eventos.

```mermaid
flowchart TB
    page["CatalogPage<br/>permisos y coordinación"] --> list["useCatalogList<br/>consulta y estado"]
    page --> table["CatalogTable<br/>props de filas y consulta"]
    table -.->|query o edit| page
    list -.->|rows y total| page
    page --> editor["useListEditor<br/>abrir y cerrar captura"]
```

## Código, contrato y límites

[CatalogPage](../../src/modules/catalogs/pages/CatalogPage.vue) compone los
colaboradores, pasa filas/consulta y conecta `query` a `list.applyQuery`; `edit`
abre el editor con la fila seleccionada.
[CatalogTable](../../src/modules/catalogs/components/CatalogTable.vue) define
columnas y emite eventos; no solicita HTTP ni consulta la sesión.
[useListEditor](../../src/shared/composables/useListEditor.ts) conserva el ciclo
de apertura y recarga, sin definir las reglas del catálogo.

La presentación puede tener estado visual local o valores calculados. Una page
puede ser contenedor de un diálogo sin ser una ruta independiente. No se extrae
un contenedor adicional por cada botón. ESLint protege imports de presentación;
la revisión comprueba también dependencias indirectas.

[catalogs.spec.ts](../../tests/e2e/catalogs.spec.ts) comprueba el flujo con API
simulada; las [pruebas del editor](../../tests/unit/modules/catalogs/catalogEditorTest.ts)
observan captura, errores y confirmación. No acreditan autorización en Express.
Referencia: [props](https://vuejs.org/guide/components/props.html) y
[eventos de Vue](https://vuejs.org/guide/components/events.html).
