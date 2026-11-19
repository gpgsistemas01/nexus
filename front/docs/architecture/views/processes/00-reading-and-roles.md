# Lectura de procesos y roles de participantes

## Alcance de una secuencia

Una secuencia explica una interacción relevante entre responsabilidades: intención del
usuario, coordinación de la página o composable, consulta HTTP cuando aplica y resultado
visible. Muestra sólo decisiones que cambian el recorrido, como permiso, modo, cancelación,
fallo recuperable o respuesta obsoleta. No transcribe cada función, `ref`, asignación,
watcher o llamada interna. El diagrama se mantiene en el nivel necesario para responder
su pregunta; las fuentes enlazadas permiten verificar el comportamiento real.

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
sus campos se consultan en los [modelos de clases y tipos](../logical/class-and-type-models/index.md).

## Tecnología y alcance

Vue, Vue Router, VeeValidate, Axios y SweetAlert2 sustentan la implementación. Las
bibliotecas se omiten como participantes salvo que su frontera sea relevante para la
pregunta; no se representan sus detalles internos.

## Contratos que deben distinguirse

| Etiqueta | Fuente |
| --- | --- |
| Evento del formulario | Intención como Guardar, Buscar, Cancelar o Seleccionar. |
| Coordinador | Responsabilidad que valida el modo, permiso o estado antes de continuar. |
| Servicio de recurso | Frontera HTTP para consultar o guardar; los detalles de URL se incluyen sólo si distinguen el comportamiento. |
| Retorno | Resultado relevante para la interfaz: datos, confirmación, error o cancelación. |
| Condición | Regla que modifica el recorrido, expresada en lenguaje funcional cuando el nombre interno no aporta al lector. |

La numeración expresa orden de mensajes; no representa duración ni acredita una
transacción del servidor. Se conserva una secuencia por interacción compartida o por
variante que cambie reglas, permisos, payload o recuperación. Variantes que sólo cambian
un valor permanecen en la misma figura; detalles internos se dejan a la referencia de
código.

## Localización de la implementación

| Colaboración | Fuente propietaria |
| --- | --- |
| Ciclo de guardado | [useRecordSave.ts](../../../../src/shared/composables/useRecordSave.ts). |
| Vigencia de lectura | [useDocumentRead.ts](../../../../src/shared/composables/useDocumentRead.ts). |
| Interacción por campo | [useFormInteraction.ts](../../../../src/shared/composables/useFormInteraction.ts). |
| Eventos y callbacks | [Contratos de formularios](../../contracts/form-and-event-contracts.md). |
| Dependencias/exportaciones | [Referencia generada](../development/code-reference.md). |
