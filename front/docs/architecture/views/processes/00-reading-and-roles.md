# Lectura de procesos y roles de participantes

## Alcance de una secuencia

Las figuras representan colaboraciones del cliente por operación. Cada línea de vida
nombra un colaborador o un grupo explícito de interfaz; no exige una clase instanciada
ni enumera todos los imports de su archivo. Los reexports, constantes y funciones
puras auxiliares se localizan en la referencia de código cuando no cambian el recorrido.

| Elemento | Rol visual | Ejemplos reales y fuente |
| --- | --- | --- |
| Usuario | Actor humano externo. | Captura, selección, confirmación o reintento. |
| Interfaz | `boundary`: frontera de interacción. | Page/formulario, `RemoteSelect` y `confirmAction`. El componente puede coordinar eventos sin convertirse en una clase UML. |
| Coordinación/cálculo | `control`: decide y mantiene el recorrido. | Composables, Router, mappers y esquemas de captura. |
| Transporte | `boundary`: intercambio con otro sistema. | Servicios del recurso, `apiClient`, `requestExcel` y API externa. |
| Entorno/almacenamiento | `boundary`: frontera del navegador. | Eventos de visibilidad/foco/temporizador y `pendingWasteOperation` sobre Storage. Un temporizador no es un actor humano. |

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
