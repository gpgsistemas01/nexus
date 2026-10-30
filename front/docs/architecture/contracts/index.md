# Contratos del cliente Vue

Un contrato define los datos, eventos y resultados que dos colaboradores intercambian
y aceptan. Las vistas relacionadas describen su estructura y ejecución.

## Interfaces de intercambio

| Referencia | Contenido propietario |
| --- | --- |
| [HTTP del cliente](client-contracts.md) | Endpoints consumidos, parámetros, respuestas, confirmaciones, metadatos, errores y archivos. |
| [Formularios, eventos y callbacks](form-and-event-contracts.md) | Props, intenciones, resultados de guardado y comunicación entre componentes y composables. |

## Modelos relacionados

| Necesidad | Documento |
| --- | --- |
| Colaboradores, responsabilidades y dependencias | [Componentes por capacidad](../views/logical/components/index.md). |
| Atributos, relaciones y variantes TypeScript | [Clases, interfaces y tipos](../views/logical/class-and-type-models/index.md). |
| Firmas completas declaradas o inferidas | [Referencia TypeScript y SFC generada](../views/logical/type-reference/index.md). |
| Condiciones y efectos funcionales | [Modos de operación](../../requirements/requirements-specification/06-operation-modes-and-effects.md). |
| Transiciones de captura y recuperación | [Estado y ciclo de vida](../views/logical/states/04-state-ownership-and-save.md). |
| Orden de llamadas entre propietarios | [Procesos y secuencias](../views/processes/index.md). |
