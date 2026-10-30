# 2. Contenedor y presentación

## Propósito y funcionamiento

Un componente que consulta la API, decide permisos y dibuja controles cambia por
motivos distintos. El contenedor coordina el caso; la presentación recibe props
y emite intenciones. En Vue esta separación se implementa con componentes y
composables, que conservan el estado y coordinan las operaciones de la página.

## Modelo general de contenedor y presentación

**Identificador:** `DIA-VUE-GEN-001`. **Pregunta:** ¿cómo vuelve una intención del
usuario al propietario del estado? **Fuente:** contratos de props/eventos de Vue
y sus consumidores actuales. Secuencia conceptual de consulta y apertura de captura.

**Lectura visual:** [mensajes, retornos y alternativas de secuencia](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuario
    participant View@{ "type": "boundary" } as Presentación
    participant Container@{ "type": "control" } as Contenedor
    participant State@{ "type": "control" } as Estado y operaciones
    Container->>View: nowrap: props de datos y estado
    User->>View: nowrap: cambiar consulta
    View->>Container: nowrap: emitir intención con la<br/>consulta
    Container->>State: nowrap: aplicar consulta
    State-->>Container: nowrap: nuevos datos o error<br/>observable
    Container->>View: nowrap: props actualizadas
    User->>View: nowrap: solicitar edición de una fila
    View->>Container: nowrap: emitir intención con la fila
    Container->>State: nowrap: abrir captura si el acceso lo<br/>permite
    State-->>Container: nowrap: destino de captura
    Container->>Container: nowrap: componer el editor con ese<br/>destino
```

## Aplicación en la página de Catálogos

**Identificador:** `DIA-VUE-APL-001`. **Pregunta:** ¿cómo se aplican las intenciones
de `CatalogTable`? **Fuente:** `CatalogPage`, `CatalogTable`, `useCatalogList`,
`usePagedList` y `useListEditor`. Secuencia sobre las instancias ya creadas;
el callback de consulta se desarrolla en `DIA-VUE-PAT-001`.

```mermaid
sequenceDiagram
    autonumber
    participant Table@{ "type": "boundary" } as Catalog<br/>Table.vue
    participant Page@{ "type": "control" } as Catalog<br/>Page.vue
    participant List@{ "type": "control" } as usePaged<br/>List.ts
    participant Editor@{ "type": "control" } as useList<br/>Editor.ts
    participant Dialog@{ "type": "control" } as CatalogEditor<br/>Page.vue
    Page->>Table: nowrap: { rows, total, query,<br/>isLoading }
    Table->>Page: nowrap: emit('query', { page, length<br/>})
    Page->>List: nowrap: list.applyQuery(changes)
    opt nowrap: consulta distinta de la<br/>vigente
        List->>List: nowrap: Object.assign(query, next)<br/>load()
        List-->>Page: nowrap: rows, total, isLoading, error
        Page->>Table: nowrap: props actualizadas
    end
    Table->>Page: nowrap: emit('edit', item)
    Page->>Editor: nowrap: openEditor({ action: 'edit',<br/>row: item })
    Editor->>Page: nowrap: options.canOpen(target)
    Page-->>Editor: nowrap: canManage.value
    opt nowrap: acceso permitido
        Editor-->>Page: nowrap: editor.value = target
        Page->>Dialog: nowrap: :catalog="catalog"<br/>:target="editor"
    end
```

## Código, contrato y límites

[CatalogPage](../../../../../src/modules/catalogs/pages/CatalogPage.vue) compone los
colaboradores, pasa filas/consulta y conecta `query` a `list.applyQuery`; `edit`
abre el editor con la fila seleccionada.
[CatalogTable](../../../../../src/modules/catalogs/components/CatalogTable.vue) define
columnas y emite eventos; no solicita HTTP ni consulta la sesión.
[useListEditor](../../../../../src/shared/composables/useListEditor.ts) conserva el ciclo
de apertura y recarga, sin definir las reglas del catálogo.

Los eventos de componente llegan al padre directo; un contenedor intermedio los
reenvía explícitamente. La presentación puede tener estado visual local o valores calculados. Una page
también puede contener un diálogo: la carpeta `pages` identifica su coordinación,
mientras el Router determina cuáles de esas páginas tienen una URL.

[catalogs.spec.ts](../../../../../tests/e2e/catalogs.spec.ts) comprueba el flujo con API
simulada; las [pruebas del editor](../../../../../tests/unit/modules/catalogs/catalogEditorTest.ts)
observan captura, errores y confirmación.
