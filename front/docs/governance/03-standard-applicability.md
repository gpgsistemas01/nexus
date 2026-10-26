# 3. Aplicación de estándares a la documentación Vue

## Resultado de la revisión

La tecnología Vue cambia los elementos y las colaboraciones que se documentan; no obliga a sustituir las referencias generales de documentación, requisitos o pruebas. Esta colección conserva criterios de propósito, audiencia, trazabilidad, decisiones y evidencia, con contenido propio del cliente. Las diferencias se deciden por tipo de artefacto y responsabilidad, no sólo por ser frontend o backend.

Se revisaron las fichas públicas oficiales de alcance de ISO/IEEE y la documentación de Vue el 2026-10-26. La aplicación a Nexus que sigue es una decisión selectiva del proyecto. No representa una auditoría completa del texto normativo ni una declaración de conformidad integral.

## Referencias y alcance conservado

| Referencia | Qué aporta | Decisión para Vue |
| --- | --- | --- |
| [ISO/IEC/IEEE 15289:2019](https://www.iso.org/standard/74909.html) | Propósito y contenido de los elementos de información del ciclo de vida. | Conservar guías identificables, responsables y relaciones; adaptar su contenido a desarrollo, operación y pruebas del cliente. |
| [ISO/IEC/IEEE 29148:2018](https://www.iso.org/standard/72089.html) | Ingeniería de requisitos e información que resulta de ella. | Mantener obligaciones observables y trazables. `RF/RD/RN/RC-VUE-*` y fichas `CU-VUE-*` son identificadores locales, con criterios de captura/interacción y postcondiciones propias. |
| [ISO/IEC/IEEE 42010:2022](https://www.iso.org/standard/74393.html) | Descripción de arquitectura y relaciones entre sus conceptos. | Usar preocupaciones, vistas y decisiones del cliente. La referencia no fija herramienta, notación, método o soporte de registro; Mermaid, C4 y organización Markdown son elecciones del proyecto. |
| [IEEE 1016-2009](https://standards.ieee.org/ieee/1016/4502/) | Referencia histórica de descripción de diseño. IEEE la identifica Inactive-Reserved. | Complementar la explicación de interfaces, responsabilidades y relaciones; no presentarla como una obligación actual de Vue ni como plantilla universal por función. |
| [ISO/IEC/IEEE 29119-3:2021](https://www.iso.org/standard/79429.html) | Documentación de pruebas que resulta de los procesos de prueba. | Conservar plan, diseño, datos, resultado esperado y ejecución como información distinta; los formatos DP/CP/EP se adaptan localmente. |
| [ISO/IEC/IEEE 29119-4:2021](https://www.iso.org/standard/79430.html) | Técnicas de diseño de pruebas. | Aplicar particiones, fronteras, decisiones y transiciones a captura, permisos, sesión, paginación y recuperación. Vitest/Playwright son herramientas de ejecución. |
| [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html) | Modelo de calidad del producto para especificar y evaluar sus características. | Revisar mantenibilidad, interacción, seguridad y desempeño con criterios verificables. Una compilación o conteo de pruebas no demuestra por sí solo esos atributos. |
| [Guías de Vue](https://vuejs.org/style-guide/) y configuración local | Recomendaciones y mecanismos propios del framework. | Describir contratos SFC, estado, props/eventos y reactividad. ESLint/Prettier y el estándar local concretan el estilo; no son normas de documentación ni certificaciones. |

Las ediciones listadas identifican referencias elegidas, no un cambio automático de versión cuando aparece un borrador. Modificar la base normativa requiere revisar su alcance e impacto documental; cambiar de framework o motor de renderizado tampoco justifica hacerlo por sí solo.

## Qué se conserva y qué se adapta

| Artefacto | Criterio común que permanece | Contenido específico del cliente |
| --- | --- | --- |
| Especificación | Actor, objetivo, obligación verificable, datos, restricción y trazabilidad. | Captura, navegación, estados visuales, recuperación y efectos permitidos. La validación definitiva y los saldos persistidos pertenecen a la API. |
| Caso de uso | Disparador, precondiciones, pasos, alternativas, errores y postcondiciones. | Acciones sobre páginas y modales Vue. Props, métodos y endpoints se explican en realización técnica, sin convertirlos en acciones del actor. |
| Arquitectura | Preocupación, elementos, interfaces, relaciones, decisión y restricciones. | Arranque, Router, contenedores, presentación, composables, estado por instancia, servicios y mappers. No se atribuyen controllers/repositories de Express al navegador. |
| Patrón | Problema, decisión, contrato, límites y evidencia. | Modelo general y diagrama aplicado con símbolos reales: props/eventos, callbacks, slots, adaptadores, esquema por contexto y provide/inject. No se inventan clases GoF para una función. |
| Referencia de código | Fuente identificable y actualización reproducible. | Parser SFC/TypeScript, exports, macros y dependencias; con elementos declarados en el código propio del cliente. |
| Estándar de código | Consistencia de nombres, formato, dependencias, errores y revisión. | SFC, `script setup`, imports con extensión, macros, props inmutables, composables y control del DOM por Vue. |
| Pruebas | Riesgo, condición, técnica, dato, oráculo, resultado real y limpieza. | Estado reactivo en jsdom, interacción real de Vuetify/Router en Chromium y sistema como nivel separado. Un mock HTTP no demuestra persistencia. |
| Operación/despliegue | Preparación, configuración, comandos, resultado y recuperación. | Build de Vite, assets, fallback SPA, proxy/cookies y Nginx. La publicación documental es otra tarea, fuera de la imagen de producción. |

## Diagramas: criterio documental y realización

Los patrones mantienen un modelo general y aplicaciones concretas según el [catálogo Vue](../patterns/01-applicability-and-principles.md#modelo-general-y-aplicación-en-código). Los tres consumidores de alta contextual tienen diagramas separados; Compras diferencia proveedor y artículo. Cada figura declara fuente, pregunta, alcance y semántica de flechas.

Ese reparto es una convención útil del proyecto; no se afirma que una norma ISO exija esos IDs o figuras. Un diagrama de flujo explica composición/eventos y uno de secuencia ordena mensajes. No se denomina UML de clases a una colaboración de composables sin clases. El [modelo de vistas web](../architecture/02-web-views.md) separa la organización documental de la arquitectura SPA implementada.

## Documentación autónoma y consistencia entre aplicaciones

Puede repetirse una regla compartida, como `expectedVersion`, explicando qué conserva Vue y qué comprueba Express. También se mantienen por separado los casos, estándares y planes que el lector de cada aplicación necesita. La repetición documental no exige duplicar el código de validación ni mover fuentes privadas al navegador.

Si cambia un contrato común se revisan ambos documentos afectados; si cambia sólo la coordinación Vue, se actualizan sus guías y diagramas. No se elimina documentación backend para crear la del cliente ni se considera que un enlace externo sustituya un flujo local completo.

## Comprobación y límites de evidencia

La revisión comprueba correspondencia con código/configuración, coherencia de IDs, enlaces, fuentes generadas y legibilidad de figuras/tablas exportadas. `docs:check` automatiza parte de esas comprobaciones; no valida toda la prosa ni certifica una norma. La revisión humana conserva los límites de simulación, medición y aceptación. Las herramientas documentales y sus resultados permanecen fuera del despliegue de la SPA.
