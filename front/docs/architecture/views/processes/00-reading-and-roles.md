# Lectura de procesos y roles de participantes

## Alcance de una secuencia

Los mensajes identifican funciones, eventos, retornos y asignaciones del código Vue.
Los participantes conservan el archivo propietario. Las condiciones de los marcos
usan los identificadores del código y las figuras mantienen sus IDs estables.

## Distribución de participantes

| Código | Representación |
| --- | --- |
| Formulario, tabla, selector o menú de presentación | `boundary`, grupo Interfaz. |
| Page o Workspace que conecta estado, eventos y operaciones | `control`, grupo Coordinación. |
| Composable, sesión o guarda propia | `control`, grupo Coordinación. |
| Mapper, validador puro, constructor de payload o normalizador de error | Participante simple, grupo Reglas y datos. |
| Servicio de recurso, cliente HTTP o adaptador de almacenamiento | `boundary`, grupo Integración. |
| API | `boundary`, grupo Sistema externo. |

Los [símbolos de secuencia](../diagram-reading.md#secuencias) definen las formas.
`IssueDocument`, `PurchaseDetail` y `DirectoryEntry` son contratos intercambiados;
sus atributos y relaciones se consultan en los
[modelos de clases y tipos](../logical/class-and-type-models/index.md).

## Tecnología y alcance

Vue, Vue Router, VeeValidate, Axios y SweetAlert2 sustentan la implementación.
Se representan las llamadas escritas en los archivos propios; las instancias internas
de esas bibliotecas no añaden participantes.

## Contratos que deben distinguirse

| Etiqueta | Fuente |
| --- | --- |
| `directoryService.save(...)` | Invocación del servicio desde el editor. |
| `operation(controller.signal)` | Callback definido por el editor y ejecutado por `useRecordSave`. |
| `options.onSaved(result)` | Callback proporcionado al coordinador por el consumidor. |
| `emit('saved', result)` | Evento del componente; el receptor conecta su handler. |
| `{ values, errors, message }` | Valores expuestos y props; no representa una función nueva. |
| `alt target.mode === 'header'` | Condición del recorrido escrito en el código. |
| `...` dentro de argumentos | Argumentos omitidos de la llamada existente; no designa una función ni un campo adicional. |

Las continuaciones se enlazan junto a las fuentes. La numeración expresa orden de
mensajes; no representa duración ni acredita una transacción del servidor.

## Localización de la implementación

| Colaboración | Fuente propietaria |
| --- | --- |
| Ciclo de guardado | [useRecordSave.ts](../../../../src/shared/composables/useRecordSave.ts). |
| Vigencia de lectura | [useDocumentRead.ts](../../../../src/shared/composables/useDocumentRead.ts). |
| Interacción por campo | [useFormInteraction.ts](../../../../src/shared/composables/useFormInteraction.ts). |
| Eventos y callbacks | [Contratos de formularios](../../contracts/form-and-event-contracts.md). |
| Dependencias/exportaciones | [Referencia generada](../development/code-reference.md). |
