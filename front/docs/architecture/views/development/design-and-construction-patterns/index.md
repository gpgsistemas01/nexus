# Patrones y mecanismos del frontend Vue

Cada capítulo explica una colaboración del cliente, su modelo general y su
realización con archivos y funciones de Nexus. El modelo general presenta roles;
el aplicado permite seguirlos en el código. La notación se elige según la pregunta.

| Capítulo | Pregunta principal | Diagramas utilizados |
| --- | --- | --- |
| [Principios y clasificación](01-applicability-and-principles.md) | ¿Qué mecanismos comparten los módulos y dónde se aplican? | Catálogo de mecanismos, figuras y aplicación de SOLID. |
| [Contenedor y presentación](02-container-and-presentation.md) | ¿Quién conserva el estado y quién presenta/emite intenciones? | Mapa de composición de componentes con props y eventos. |
| [Composables y callbacks](03-composables-and-callbacks.md) | ¿Cómo ejecuta un coordinador una operación aportada por su consumidor? | Secuencia UML del callback y mapas de dependencias aplicadas. |
| [Adaptadores HTTP y de datos](04-http-and-data-adapters.md) | ¿Cómo se transforma y admite una respuesta externa? | Flujo de datos con transformación y decisiones de aceptación. |
| [Slots y composición visual](05-slots-and-visual-composition.md) | ¿Qué marco se comparte y dónde se inserta el contenido específico? | Árbol/regiones de composición con contenido y props de slot. |
| [Provisión de sesión](06-session-provision.md) | ¿Cómo recuperan varios consumidores la misma instancia? | Mapa de provisión y secuencia UML de creación e inyección. |
| [Fábricas de esquemas](07-schema-factories.md) | ¿Qué reglas construye la función para cada contexto? | Actividad con decisiones y productos, usando notación de flujo. |
| [Composición de documentos](08-document-responsibilities.md) | ¿Cómo colaboran los mecanismos en Compras y Salidas? | Mapas de responsabilidades y secuencia UML de confirmación. |
| [Altas contextuales](09-contextual-creation.md) | ¿Cómo retorna un alta auxiliar sin guardar el documento principal? | Secuencia UML general y mapas de los cuatro casos aplicados. |

## Lectura de las figuras

La [guía visual](../../diagram-reading.md) define símbolos y flechas. Los mapas de
composición y las actividades con Mermaid explican sus convenciones locales;
las secuencias usan líneas de vida, llamadas, retornos y alternativas UML.
Las funciones, slots y callbacks conservan su naturaleza en el modelo.

`DIA-VUE-GEN-*` identifica modelos generales; `DIA-VUE-APL-*`, casos aplicados.
Las figuras de colaboraciones compartidas usan `DIA-VUE-PAT-*` o `DIA-VUE-DOC-*`.
El [catálogo](01-applicability-and-principles.md#modelo-general-y-aplicación-en-código)
relaciona esos IDs con sus fuentes. Las clases de dependencias externas se describen
como tecnología utilizada en el texto, sin convertirlas en entidades del sistema.

Los [contratos de intercambio](../../../contracts/index.md) definen los datos y
resultados requeridos. Las pruebas de cada capítulo observan ese contrato; el
[plan de pruebas](../../../../testing/01-test-plan.md) explica los niveles y sus límites.

## Mecanismos de Vue utilizados

- [Props](https://vuejs.org/guide/components/props.html) y [eventos](https://vuejs.org/guide/components/events.html): datos hacia la presentación e intenciones hacia su contenedor.
- [Composables](https://vuejs.org/guide/reusability/composables.html): lógica reactiva reutilizable con estado y operaciones explícitos.
- [Slots](https://vuejs.org/guide/components/slots.html): contenido del consumidor y datos recibidos por props del slot.
- [Provide/inject](https://vuejs.org/guide/components/provide-inject.html): acceso a la sesión proporcionada por la aplicación.
