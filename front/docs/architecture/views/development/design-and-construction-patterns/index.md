# Patrones y mecanismos del frontend Vue

Cada capítulo explica una colaboración del cliente, su modelo general y su
realización con archivos y funciones de Nexus. El modelo general presenta roles;
el aplicado permite seguirlos en el código. La notación se elige según la pregunta.

| Capítulo | Pregunta principal | Diagramas utilizados |
| --- | --- | --- |
| [Principios y clasificación](01-applicability-and-principles.md) | ¿Qué mecanismos comparten los módulos y dónde se aplican? | Catálogo de mecanismos, figuras y aplicación de SOLID. |
| [Contenedor y presentación](02-container-and-presentation.md) | ¿Cómo vuelve una intención del usuario al propietario del estado? | Secuencias de props, eventos, actualización y apertura de captura. |
| [Composables y callbacks](03-composables-and-callbacks.md) | ¿Quién configura, ejecuta y recibe el resultado del callback? | Secuencias de configuración, consulta y selección dependiente. |
| [Adaptadores HTTP y de datos](04-http-and-data-adapters.md) | ¿Quién solicita, transforma y admite una respuesta externa? | Secuencias de servicio, transporte y mapper con alternativas de rechazo. |
| [Slots y composición visual](05-slots-and-visual-composition.md) | ¿Dónde se inserta el contenido y cómo recibe los datos del marco? | Mapas de regiones y secuencias de evaluación e interacción. |
| [Provisión de sesión](06-session-provision.md) | ¿En qué orden se crea, proporciona y recupera la misma instancia? | Secuencias de arranque e inyección. |
| [Fábricas de esquemas](07-schema-factories.md) | ¿Qué reglas se construyen y cuándo leen la captura vigente? | Actividades de selección de reglas y secuencias de ejecución del producto. |
| [Composición de documentos](08-document-responsibilities.md) | ¿Cómo se conectan captura, payload, escritura y confirmación? | Secuencias del callback de escritura y de su resultado entre contenedores. |
| [Altas contextuales](09-contextual-creation.md) | ¿Cómo vuelve el registro confirmado al formulario origen? | Secuencia general y secuencias de eventos/callbacks de los cuatro casos. |

Cada pareja conserva el mismo recorrido: los roles del modelo general se sustituyen
por los archivos que los realizan. Las secuencias hacen visible el orden y el retorno;
las actividades, las decisiones; los mapas de slots, las regiones de contenido.
Los imports se consultan en la [vista de componentes](../../logical/components/index.md).

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
