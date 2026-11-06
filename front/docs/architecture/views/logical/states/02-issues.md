# Salidas: resolución del modo

**Identificador:** `DIA-VUE-EST-002`. **Pregunta:** ¿qué decisiones separan editar,
consultar, surtir y devolver? **Fuentes:** [useIssueActions.ts](../../../../../src/modules/issues/composables/useIssueActions.ts),
[issueRules.ts](../../../../../src/modules/issues/issueRules.ts) y
[useIssueEditor.ts](../../../../../src/modules/issues/composables/useIssueEditor.ts).
**Estado observado:** lectura y `IssueTarget.mode`. **Notación:**
[evento, guarda y efecto](../../diagram-reading.md#estados).

```mermaid
stateDiagram-v2
    [*] --> Lista
    state Abierta {
        state Resolver <<choice>>
        Leyendo
        ErrorLectura
        RechazoEstado
        state Editor {
            Alta
            ModoLeido
        }
    }
    Lista --> Alta: create() [options.canManage()]
    Lista --> Leyendo: open(row, mode) [options.canRead()]
    Leyendo --> Resolver: reader.load resuelve [document]
    Leyendo --> ErrorLectura: reader.load termina [!document && readError.value]
    Resolver --> RechazoEstado: [G3] / publicar readError
    Resolver --> ModoLeido: [else] / openEditor({ mode: resolved, document })
    ErrorLectura --> Leyendo: retry() [lastRequestedEditor]
    RechazoEstado --> Leyendo: retry() [lastRequestedEditor]
    Abierta --> Lista: close() / reader.close()
    Editor --> Lista: saved(result) / handleSaved(result)
```

| Dato/guarda | Definición en la implementación |
| --- | --- |
| `resolved` | Para `mode === 'edit'`: `options.canManage() ? resolveIssueEditMode(document) : 'view'`. En otros casos conserva el modo solicitado. |
| `resolveIssueEditMode` | No editable → `view`; editable y cumplimiento pendiente → `edit`; editable con detalles protegidos → `header`. |
| `G1` | `options.canSupply() && canSupplyIssue(document)`. Aprobada, no cancelada y con cumplimiento pendiente o parcial. |
| `G2` | `options.canSupply() && canReturnIssue(document)`. Aprobada, no cancelada y con cumplimiento completo. |
| `G3` | `(resolved === 'supply' && !G1) || (resolved === 'return' && !G2)`. El rechazo publica `readError` y no abre el modo pedido. |
| `Abierta` / `Editor` | Estados compuestos para cierre común y editor. `ModoLeido` agrupa los cinco modos que desarrollan las figuras siguientes. El alta usa `{ mode: 'create' }`; consulta no emite `saved`. |

Consulta no envía desde el editor; devolución usa su formulario específico.
El [guardado compartido](04-state-ownership-and-save.md#ciclo-de-guardado) define
qué ocurre si la escritura falla o el consumidor deja de estar vigente.

La [lectura compartida](04-state-ownership-and-save.md#consulta-y-actualización)
define cancelación, respuestas tardías y `readError`.

## Consulta y edición del documento leído

**Identificador:** `DIA-VUE-EST-005`. **Pregunta:** ¿qué valor de `resolved` abre
consulta, edición completa o sólo encabezado? **Fuente:** `useIssueActions.ts` y
`issueRules.ts`. **Alcance:** apertura solicitada como `view` o `edit`, después de
la lectura vigente; el cierre y guardado están en `DIA-VUE-EST-002`.

```mermaid
stateDiagram-v2
    state ResolverEdicion <<choice>>
    [*] --> ResolverEdicion
    ResolverEdicion --> Consulta: [resolved === 'view']
    ResolverEdicion --> Edicion: [resolved === 'edit']
    ResolverEdicion --> Encabezado: [resolved === 'header']
```

Las condiciones de `resolved` y `resolveIssueEditMode` se definen en la tabla anterior.
Estos destinos son los submodos de `ModoLeido`, no estados persistidos de la salida.

## Surtido y devolución del documento leído

**Identificador:** `DIA-VUE-EST-006`. **Pregunta:** ¿qué permiso y estado admiten el
modo operativo? **Fuente:** `useIssueActions.ts` y `issueRules.ts`.
**Alcance:** solicitud de `supply` o `return` después de leer el documento.

```mermaid
stateDiagram-v2
    state ResolverOperacion <<choice>>
    [*] --> ResolverOperacion
    ResolverOperacion --> Surtido: [resolved === 'supply' && G1]
    ResolverOperacion --> Devolucion: [resolved === 'return' && G2]
    ResolverOperacion --> RechazoEstado: [G3] / publicar readError
```

`G1`, `G2` y `G3` conservan la definición de la tabla. El rechazo vuelve al ciclo
de lectura/reintento de `DIA-VUE-EST-002`; no crea un editor de surtido o devolución.
