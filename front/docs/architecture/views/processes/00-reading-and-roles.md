# Lectura de procesos y roles de participantes

## Alcance de una secuencia

Las secuencias describen una operación del cliente mediante sus archivos y funciones
propios. Cada figura declara dónde empieza y qué colaboración amplía; los cortes de
interfaz, coordinación y transporte se enlazan mediante identificadores estables.

## Distribución de participantes

| Grupo | Participantes del sistema | Rol visual |
| --- | --- | --- |
| Actor | Persona que inicia o confirma la operación. | Actor humano, fuera de los grupos internos. |
| Interfaz | Formulario, Page, Workspace o adaptador de avisos, por ejemplo `IssueEditor.vue`, `IssueEditorPage.vue` y `feedback.ts`. | `boundary`: entrada/salida de interacción. |
| Coordinación | Composable que mantiene estado y ejecuta callbacks, por ejemplo `useIssueEditor.ts`, `useRecordSave.ts` y `useDocumentRead.ts`. La guarda propia se identifica como `createAppRouter` en `router/index.ts`. | `control`: coordina el recorrido. |
| Reglas y datos | Mapper, constructor de borradores o módulo de reglas propio, por ejemplo `issueRequestMapper.ts`, `issueDetails.ts` y `issueRules.ts`. | `control`: transforma o decide. |
| Integración | Servicio de recurso, `pageRequest.ts`, `requestExcel.ts`, `apiClient.ts` o `pendingWasteOperation.ts`. | `boundary`: adapta una frontera de datos. |
| Sistema externo | API que recibe la petición y devuelve su respuesta. | `boundary`: límite del cliente, sin detallar transacciones del servidor. |

Las cajas agrupan responsabilidades; cada línea de vida conserva el archivo que
recibe la llamada. Dos funciones del mismo archivo pueden representarse en la misma
línea de vida, con su nombre en el mensaje. El orden visual parte de interfaz y
coordinación hacia reglas e integración; no impone un orden distinto de ejecución.

`IssueDocument`, `PurchaseDetail`, `DirectoryEntry` y otros contratos de datos se
nombran en los mensajes. Una interfaz TypeScript no recibe llamadas ni se instancia
por aparecer en una firma. Sus atributos y relaciones pertenecen a los
[modelos de clases y tipos](../logical/class-and-type-models/index.md).

## Tecnología y alcance

Vue aporta componentes y reactividad; VeeValidate, el mecanismo de formularios;
Vue Router, la navegación; Axios, el transporte; SweetAlert2, los avisos. Las figuras
muestran la integración escrita para Nexus: el editor, la guarda, `apiClient.ts` y
`feedback.ts`. Los componentes y objetos internos de esas bibliotecas no tienen
líneas de vida propias. Foco, visibilidad, temporizadores y desmontaje se indican
como eventos o notas sobre el módulo que los atiende.

Una figura de aplicación conserva el formulario y su contenedor cuando ambos
intervienen. Una continuación de transporte empieza en el servicio y enlaza la
figura que lo llamó. Los constantes y reexports que no reciben mensajes se
localizan en la referencia de código. Los rechazos interrumpen la rama correspondiente;
no continúan como si el servicio hubiera devuelto un resultado válido.

Los símbolos y extremos de flecha se consultan en la
[leyenda de secuencias](../diagram-reading.md#secuencias). El rol describe la participación
en esa colaboración; la dirección de imports se verifica en los
[mapas de componentes](../logical/components/index.md).

## Contratos que deben distinguirse

| Relación | Lectura correcta |
| --- | --- |
| Invocación de función | El origen ejecuta la operación del colaborador de destino. |
| `operation(signal)` | Callback definido por el editor y ejecutado por `useRecordSave`; el editor construye payload y llama al servicio. |
| `onSaved(result)` | Callback de confirmación, vigente y configurado por el consumidor. |
| Evento Vue | El componente emite y el contenedor conecta el handler. Si se omiten esos pasos intermedios, el alcance de la figura lo declara. |
| Actualización reactiva | Propagación de valores/estado descrita por su etiqueta; no necesariamente un método público del destino. |
| Resultado de red | Respuesta observada por el cliente; no acredita por sí sola un código de éxito esperado ni describe la transacción interna. |

Las flechas con etiquetas de props, estado o eventos describen propagación observable;
las etiquetas con una función identifican la invocación de código.

`useRecordSave` no importa servicios de módulos. Una secuencia que desarrolla el
callback vuelve al editor antes de dibujar la llamada HTTP. Los mappers transforman
datos y devuelven el resultado; en los mapas de dependencias, sus consumidores apuntan
a ellos, sin dibujar que el mapper importa el servicio.

## Localización de la implementación

| Colaboración | Fuente propietaria |
| --- | --- |
| Ciclo de guardado | [useRecordSave.ts](../../../../src/shared/composables/useRecordSave.ts). |
| Vigencia de lectura | [useDocumentRead.ts](../../../../src/shared/composables/useDocumentRead.ts). |
| Interacción por campo | [useFormInteraction.ts](../../../../src/shared/composables/useFormInteraction.ts). |
| Eventos y modos | [Contratos de captura](../development/frontend-technical-documentation/08-form-and-event-contracts.md). |
| Dependencias/exportaciones | [Referencia generada](../development/code-reference.md). |

Las fuentes de cada figura identifican la especialización del dominio. La API es una
frontera externa y conserva autorización, datos persistidos y transacciones. Los
[casos y cobertura](../../../testing/04-use-case-coverage.md) indican qué condición
observable comprueba cada nivel de prueba.
