# Estado, propiedad y ciclo de vida

## Inventario de propietarios

| Estado | Propietario | Alcance y salida |
| --- | --- | --- |
| Identidad y permisos | `createAuthSession` proporcionado desde `main.ts`. | Una instancia por aplicación; carga compartida pendiente, usuario readonly. |
| Preferencia de login | `useLoginForm`. | `nexus.rememberedUser` conserva el nombre tras el éxito; precarga sólo si es válido. Storage es opcional y su fallo no impide ingresar. |
| Consulta aplicada/filas | `usePagedList` por listado. | Cada pantalla conserva query, conteo y carga/error; desmontar aborta/invalida. |
| Búsqueda borrador | `useListSearch` y filtros de dominio. | Se aplica explícitamente, sin mutar resultados por cada tecla. |
| Captura y errores | Composable de editor y VeeValidate. | Cada apertura tiene su instancia; precarga no cuenta como interacción. |
| Opción seleccionada | `useSelectedOption`. | Persiste fuera de la página remota mientras su ID esté vigente. |
| Pendiente de escritura | `useRecordSave`. | Bloquea duplicados, conserva error/conflicto e invalida al desmontar. |
| Captura incierta de merma | `pendingWasteOperation`. | Conserva clave/cuerpo para recuperación según contrato; no guarda credenciales. |
| Diálogo auxiliar | Workspace de aplicación. | Se abre por intención y devuelve alta confirmada; no guarda el principal. |
| Aviso/popup | Helper de feedback. | Cancela/limpia el popup al terminar su consumidor. |

## Decisión de estado compartido

El estado de sesión se comparte mediante provide/inject con una InjectionKey tipada.
Formularios, listas y selección tienen propietarios por instancia. No hay un store
Pinia en el código actual. Introducir uno requiere un estado transversal con varios
consumidores, transiciones y vida útil que no resuelva la composición vigente; no se
crea un store por modal o para reemplazar props/eventos.

## Ciclo de guardado

**ID:** `DIA-VUE-ARQ-003`. **Pregunta:** ¿qué impide confirmar una captura antigua o
cerrada? **Fuente:** `useRecordSave.ts` y editores consumidores. Diagrama de estados
selectivo del coordinador, no del estado persistido del documento.

**Estado observado:** `isSubmitting`, `isConflicted` y vigencia del consumidor.
**Lectura visual:** [evento, guarda y efecto](../../diagram-reading.md#estados).

```mermaid
stateDiagram-v2
    state Instancia {
        [*] --> Disponible
        Disponible --> Pendiente: execute(operation) [G1] / isSubmitting.value = true
        Pendiente --> Disponible: operation resuelve [!aborted] / options.onSaved(result)
        Pendiente --> Disponible: operation rechaza [!aborted && !G2] / publicar error
        Pendiente --> Conflicto: operation rechaza [!aborted && G2] / isConflicted.value = true
    }
    Instancia --> [*]: onBeforeUnmount / controller.abort()
```

| Guarda o efecto | Correspondencia |
| --- | --- |
| `G1` | `!isSubmitting.value && !isConflicted.value && !controller.signal.aborted`. Si falla, `execute` retorna sin iniciar otra escritura. |
| `G2` | `cause instanceof ApiError && cause.code === 'RECORD_VERSION_CONFLICT'`. Esa instancia queda bloqueada; cerrarla y abrir otra permite una lectura nueva. |
| `aborted` | Abreviatura de `controller.signal.aborted`, no otro flag. El desmontaje termina la instancia desde cualquiera de sus estados. |
| Publicar error | Asigna `message`; para `ApiError` llama a `setErrors`, y para estado HTTP 401/403, a `onDenied`. La captura pertenece al editor consumidor. |
| Fin de operación | `finally` libera `isSubmitting` tanto en éxito como en rechazo. La confirmación invoca `onSaved` sólo si sigue vigente; ese callback puede cerrar el editor, no lo impone el helper. |

El retorno a Disponible no es una confirmación persistida ni termina la aplicación.
Abortar no revierte una transacción que ya completó la API; la recuperación consulta
el resultado o reutiliza la identidad idempotente cuando el contrato lo permite.

## Consulta y actualización

Una carga explícita muestra indicador; la recarga de fondo conserva filas y usa su
estado separado. `useVisibleRefresh` comprueba visibilidad, posibilidad de recargar y
antigüedad de 30 segundos por defecto. El listado decide si hay editor abierto o
consulta pendiente. Cada lectura recibe una secuencia y AbortSignal: sólo la vigente
puede publicar datos. Una respuesta vacía puede ajustar la página al último rango válido.

## Evidencia

`listInteractionTest.ts`, `selectedOptionTest.ts`, las pruebas de formularios y los
recorridos de catálogo/almacén/documentos cubren estados observables. La [matriz](../../../../testing/04-use-case-coverage.md)
identifica representantes y límites de persistencia.
