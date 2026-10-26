# Patrones y mecanismos del frontend Vue

Los capítulos de mecanismos separan el **modelo general** y su **aplicación actual**.
El primero explica responsabilidades sin nombres del proyecto; el segundo permite
seguir archivos y símbolos existentes. Ninguno representa una migración propuesta.
La [evaluación de aplicabilidad](01-applicability-and-principles.md) conserva la clasificación y SOLID.

## Capítulos

1. [Patrones y principios de diseño en Vue](01-applicability-and-principles.md).
2. [Contenedor y presentación](02-container-and-presentation.md).
3. [Composables y operaciones por callback](03-composables-and-callbacks.md).
4. [Adaptadores HTTP y de datos](04-http-and-data-adapters.md).
5. [Slots y composición visual](05-slots-and-visual-composition.md).
6. [Provisión de sesión e inyección](06-session-provision.md).
7. [Fábricas funcionales de esquemas](07-schema-factories.md).
8. [Responsabilidades y nombres de Salidas y Compras](08-document-responsibilities.md).

## Notación y mantenimiento

Los diagramas de flujo muestran composición, dependencias y contratos, sin atribuir
herencia ni notación UML de clases a funciones de Composition API. Cada figura
declara identificador, pregunta, alcance, fuente y significado de las flechas.
Los identificadores generales `DIA-VUE-GEN-*` y aplicados `DIA-VUE-APL-*` son una
convención local; la figura de listado conserva su ID previo `DIA-VUE-PAT-001`.

La [secuencia de guardado](08-document-responsibilities.md#secuencia-de-guardado-confirmado)
y las [altas rápidas entre dominios](08-document-responsibilities.md#composición-entre-dominios-para-altas-rápidas)
amplían colaboraciones que cruzan varios mecanismos, sin reemplazar estos modelos.
Los capítulos enlazan pruebas existentes y explican sus límites; no mantienen
otra lista de resultados de ejecución. Al cambiar un colaborador se revisan su
figura aplicada, contratos y consumidores, siguiendo el [índice documental](../index.md).
