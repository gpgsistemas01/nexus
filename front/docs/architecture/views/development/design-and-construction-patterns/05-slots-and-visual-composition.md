# 5. Slots y composición visual

## Propósito y funcionamiento

Un slot es una región que un componente deja disponible para que su consumidor
aporte contenido. Un slot con alcance también entrega datos a ese contenido.
`ServerTable` reutiliza el marco y la paginación de la tabla, mientras cada recurso
define cómo presentar sus celdas y acciones.

## Modelo general de composición por slots

**Identificador:** `DIA-VUE-GEN-004`. **Pregunta:** ¿qué estructura conserva el
componente común y qué contenido aporta el consumidor? **Fuente:** contratos de
slots de Vue y componentes actuales. **Notación:** árbol de composición con regiones
de contenido; el marco agrupa la estructura común y las flechas distinguen inserción
de contenido de props devueltas al consumidor.

**Lectura visual:** [formas, límites y flechas del mapa](../../diagram-reading.md#mapas-y-actividades).

```mermaid
flowchart TB
    consumer[Consumidor] -->|define contenido| content[Contenido específico]
    subgraph frame[Componente de marco]
        structure[Estructura y controles comunes]
        slot[Región de slot con nombre]
    end
    content -->|se inserta en| slot
    slot -.->|props del slot| content
    consumer -->|props de configuración| structure
```

## Evaluación general de un slot con alcance

**Identificador:** `DIA-VUE-GEN-008`. **Pregunta:** ¿cómo llega el dato del marco
al contenido definido por su consumidor? **Fuente:** contratos de slots y
`ServerTable`. Secuencia conceptual de renderizado;
las regiones del modelo anterior no son componentes adicionales.

```mermaid
sequenceDiagram
    autonumber
    participant Consumer@{ "type": "control" } as Consumidor
    participant Frame@{ "type": "boundary" } as Marco reutilizable
    participant Slot as Contenido del slot
    Consumer->>Frame: nowrap: props de configuración y<br/>contenido con nombre
    loop nowrap: cada elemento que presenta el<br/>marco
        Frame->>Slot: nowrap: evaluar contenido con props<br/>del slot
        Slot->>Slot: nowrap: combinar datos del consumidor<br/>y props recibidas
        Slot-->>Frame: nowrap: contenido visual del elemento
    end
```

## Aplicación a las celdas de Catálogos

**Identificador:** `DIA-VUE-APL-004`. **Pregunta:** ¿cómo se comparten controles de
tabla conservando las celdas específicas? **Fuente:** `CatalogTable`, `ServerTable`,
`StateBadge` y `TableAction`. **Notación:** composición de contenido propio;
flechas continuas = configuración/inserción, discontinuas = props de slot o evento.
Vuetify aporta el control de tabla y se identifica en el texto.

```mermaid
flowchart TB
    table[CatalogTable] -->|rows, headers y paginación| shared[ServerTable]
    subgraph content[Contenido definido por CatalogTable]
        active[template #item.isActive]
        actions[template #item.actions]
        badge[StateBadge]
        action[TableAction]
        active --> badge
        actions --> action
    end
    active -->|contenido del slot| shared
    actions -->|contenido del slot| shared
    shared -.->|item del slot| active
    shared -.->|item del slot| actions
    action -.->|click convertido en edit| table
```

## Evaluación de una celda de Catálogos

**Identificador:** `DIA-VUE-APL-011`. **Pregunta:** ¿cómo se utiliza `item` y de
dónde sale el evento `edit`? **Fuente:** templates de `CatalogTable`, reenvío de
slots de `ServerTable`, `StateBadge` y `TableAction`. Secuencia de renderizado e
interacción; las etiquetas de props y slots son expresiones de template, no métodos.
El control de Vuetify ejecuta los slots que `ServerTable` reenvía.

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuario
    participant Page@{ "type": "control" } as Catalog<br/>Page.vue
    participant Table@{ "type": "control" } as Catalog<br/>Table.vue
    participant Frame@{ "type": "boundary" } as Server<br/>Table.vue
    participant Badge@{ "type": "boundary" } as State<br/>Badge.vue
    participant Action@{ "type": "boundary" } as Table<br/>Action.vue
    Table->>Frame: nowrap: :headers, :rows y templates de<br/>celdas
    Frame->>Table: nowrap: slot item.isActive con { item<br/>}
    Table->>Badge: nowrap: :is-active="item.isActive"
    Badge-->>Table: nowrap: contenido de la celda de<br/>estado
    Table-->>Frame: nowrap: contenido de item.isActive
    Frame->>Table: nowrap: slot item.actions con { item }
    Table->>Action: nowrap: icon="$edit"<br/>label="Editar registro"
    Action-->>Table: nowrap: control de la celda de<br/>acciones
    Table-->>Frame: nowrap: contenido de item.actions
    User->>Action: nowrap: click
    Action->>Table: nowrap: emit('click')
    Table->>Page: nowrap: emit('edit', item)
```

## Código, contrato y límites

[CatalogTable](../../../../../src/modules/catalogs/components/CatalogTable.vue) define
`item.isActive` y `item.actions` usando el `item` recibido.
[ServerTable](../../../../../src/shared/components/ServerTable.vue) reenvía los slots a
Vuetify y emite `options`; no consulta filas ni asigna permisos.
El contenido del slot conserva el ámbito de `CatalogTable`; accede a la fila
mediante el `item` recibido. `edit` se emite desde ese consumidor hacia la página.

Otra aplicación es [RecordListPanel](../../../../../src/shared/components/RecordListPanel.vue):
conserva estructura, carga y errores; `CatalogPage` aporta el botón en `actions`
y la tabla en el slot predeterminado. El contenido y sus eventos siguen conectados
al consumidor que los define; las escrituras permanecen en sus servicios.

[catalogs.spec.ts](../../../../../tests/e2e/catalogs.spec.ts) observa tabla y apertura del
editor.
