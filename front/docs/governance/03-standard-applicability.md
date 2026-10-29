# 3. Aplicación de estándares a la documentación Vue

## Referencias adoptadas

Se revisaron las fichas públicas oficiales de alcance de ISO/IEEE y la documentación de Vue el 2026-10-26. La aplicación a Nexus que sigue es una decisión selectiva del proyecto. No representa una auditoría completa del texto normativo ni una declaración de conformidad integral.

## Alcance de las referencias

| Referencia | Qué aporta | Decisión para Vue |
| --- | --- | --- |
| [ISO/IEC/IEEE 15289:2019](https://www.iso.org/standard/74909.html) | Propósito y contenido de los elementos de información del ciclo de vida. | Conservar guías identificables, responsables y relaciones; adaptar su contenido a desarrollo, operación y pruebas del cliente. |
| [ISO/IEC/IEEE 29148:2018](https://www.iso.org/standard/72089.html) | Ingeniería de requisitos e información que resulta de ella. | Mantener obligaciones observables y trazables. `RF/RD/RN/RC-VUE-*` y fichas `CU-AUT/CU-ALM/CU-CAT/CU-IDA/CU-ENT/CU-SAL` son identificadores locales, con criterios de captura/interacción y postcondiciones propias. |
| [ISO/IEC/IEEE 42010:2022](https://www.iso.org/standard/74393.html) | Descripción de arquitectura y relaciones entre sus conceptos. | Usar preocupaciones, vistas y decisiones del cliente. La referencia no fija herramienta, notación, método o soporte de registro; Mermaid, C4 y organización Markdown son elecciones del proyecto. |
| [IEEE 1016-2009](https://standards.ieee.org/ieee/1016/4502/) | Referencia histórica de descripción de diseño. IEEE la identifica Inactive-Reserved. | Complementar la explicación de interfaces, responsabilidades y relaciones; no presentarla como una obligación actual de Vue ni como plantilla universal por función. |
| [ISO/IEC/IEEE 29119-3:2021](https://www.iso.org/standard/79429.html) | Documentación de pruebas que resulta de los procesos de prueba. | Conservar plan, diseño, datos, resultado esperado y ejecución como información distinta; los formatos DP/CP/EP se adaptan localmente. |
| [ISO/IEC/IEEE 26514:2022](https://www.iso.org/standard/77451.html) | Diseño y desarrollo de información para usuarios de software. | Organizar el manual por audiencia y tareas, con conceptos, instrucciones, referencia de campos y resolución de problemas; revisar su estructura, contenido y presentación. |
| [ISO/IEC/IEEE 29119-4:2021](https://www.iso.org/standard/79430.html) | Técnicas de diseño de pruebas. | Aplicar particiones, fronteras, decisiones y transiciones a captura, permisos, sesión, paginación y recuperación. Vitest/Playwright son herramientas de ejecución. |
| [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html) | Modelo de calidad del producto para especificar y evaluar sus características. | Revisar mantenibilidad, interacción, seguridad y desempeño con criterios verificables. Una compilación o conteo de pruebas no demuestra por sí solo esos atributos. |
| [Guías de Vue](https://vuejs.org/style-guide/) y configuración local | Recomendaciones y mecanismos propios del framework. | Describir contratos SFC, estado, props/eventos y reactividad. ESLint/Prettier y el estándar local concretan el estilo; no son normas de documentación ni certificaciones. |

Las ediciones listadas identifican referencias elegidas, no un cambio automático de versión cuando aparece un borrador. Modificar la base normativa requiere revisar su alcance e impacto documental; cambiar de framework o motor de renderizado tampoco justifica hacerlo por sí solo.

## Artefactos y controles

Los casos de uso siguen la tabla y granularidad definidas en su [catálogo](../requirements/use-cases/index.md).
El plan, los diseños, las fichas de prueba y la evidencia de ejecución conservan los
formatos DP, CP y EP del [plan de pruebas](../testing/01-test-plan.md). La tecnología
no reduce los campos ni el nivel de detalle exigido para esos registros.

Arquitectura se organiza en vistas 4+1. La distribución de las reglas locales se
consulta en el [mapa de estándares](09-standards-and-ownership.md); cada ámbito
mantiene su propia fuente y controles.

La revisión comprueba enlaces, IDs, correspondencia con código, frescura de fuentes
generadas y legibilidad de figuras/tablas. `docs:check` automatiza controles de fuentes;
la revisión de prosa y la aceptación requieren evidencia y responsable.

La aplicación de la información de usuario se detalla en el
[estándar editorial del manual](05-user-manual.md).
