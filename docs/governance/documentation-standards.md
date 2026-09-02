# Normas y criterios para la documentación

## Decisión

Nexus no necesita declarar conformidad ni certificación ISO para mantener su
documentación interna. Sí conviene usar normas como **marco de referencia selectivo**:
adoptar las prácticas que mejoran claridad y trazabilidad, sin convertir cada norma en
una plantilla obligatoria ni afirmar cumplimiento completo sin una evaluación formal.

La referencia principal para la especificación actual es
[ISO/IEC/IEEE 29148:2018](https://www.iso.org/standard/72089.html), porque trata la
ingeniería de requisitos. Las demás referencias se aplican sólo al documento o a la
decisión que corresponde.

En particular, ISO/IEC/IEEE 29148 no se adopta como una plantilla de casos de uso. La
norma orienta la calidad y el contenido de los requisitos, mientras que la estructura
de dos columnas, sus secciones y el nivel de detalle de cada ficha son una convención
documental de Nexus. La [estructura de las fichas](../requirements/use-case-descriptions.md#estructura-de-las-fichas)
define la plantilla vigente y permite distinguir qué información se registra y cuál se
mantiene en otros artefactos.

La aplicación concreta, las evidencias revisadas y las brechas se registran en
[Aplicación de normas en Nexus](standards-application.md). Este documento decide **qué
criterio se adopta**; el registro indica **dónde se aplica y cómo se comprueba**.

## Límite frente al estándar de codificación

Este documento gobierna artefactos documentales: fuente de verdad, trazabilidad,
estado, relación entre vistas y uso selectivo de normas. No define formato de código,
nombres de símbolos, imports, exports, estructura de módulos ni patrones CRUD; esas
reglas pertenecen exclusivamente al
[estándar de codificación](../architecture/coding-standards.md). Cuando una evidencia
técnica aparece aquí, sirve para localizar la comprobación de una afirmación, no para
establecer cómo debe implementarse.

## Aplicación por tipo de documento

| Referencia | Uso recomendado en Nexus | Alcance actual |
| --- | --- | --- |
| [ISO/IEC/IEEE 29148:2018](https://www.iso.org/standard/72089.html) | Mantener requisitos identificables, necesarios, verificables, trazables y separados de su evidencia de implementación. | Aplica a `requirements-specification.md`, `use-case-descriptions.md` y `requirements-diagrams.md`. Es la guía principal, no una declaración de conformidad. |
| [ISO/IEC/IEEE 1016:2009](https://www.iso.org/standard/45144.html) | Estructurar una descripción de diseño mediante interesados, preocupaciones, puntos de vista, vistas, elementos de diseño, relaciones y justificación. | Es la referencia más próxima para la documentación técnica del código y complementa 42010. Se aplica selectivamente a la guía común y a las referencias separadas de backend y frontend; no prescribe JSDoc, nombres de funciones, bloques de código ni una plantilla por endpoint. |
| [ISO/IEC/IEEE 42010:2022](https://www.iso.org/standard/74393.html) | Explicar interesados, preocupaciones, puntos de vista, vistas y decisiones arquitectónicas cuando esa información sea útil. | Aplica de forma ligera a `architecture-and-web-views.md` y a las [convenciones de diagramas](../architecture/diagram-conventions.md); no exige reemplazar Mermaid ni adoptar una herramienta nueva. |
| [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html) | Usar un vocabulario consistente para características de calidad y convertir sólo objetivos acordados en requisitos medibles. | Sirve para revisar la sección de calidad; no autoriza inventar umbrales de rendimiento, disponibilidad o seguridad. |
| [ISO/IEC/IEEE 15289:2019](https://www.iso.org/standard/74909.html) | Orientar el contenido y ciclo de vida de los elementos de información sin imponer un formato único. | Útil si el conjunto documental crece o necesita entregables contractuales; por ahora basta el índice y la regla de actualización existentes. |
| OpenAPI 3.1 | Versionar el contrato HTTP de rutas, parámetros, cuerpos, respuestas, errores y autenticación. | Es una especificación técnica complementaria, no una norma ISO ni un sustituto de requisitos o arquitectura. Su adopción sigue la estrategia de `api-contract.md`. |

### Decisión para documentación técnica y rutas API

No existe una única norma ISO que defina cómo comentar cada función JavaScript o cómo
documentar una ruta Express. Para Nexus se combinan referencias según la pregunta:

- **ISO/IEC/IEEE 1016:2009** orienta la descripción del diseño implementado: elementos,
  responsabilidades, relaciones, interfaces y decisiones. Justifica organizar la
  referencia técnica por vistas y mantener trazabilidad hacia el código.
- **ISO/IEC/IEEE 42010:2022** se usa en el nivel arquitectónico para separar interesados,
  preocupaciones, puntos de vista y vistas. No baja por sí sola al contrato de cada
  función.
- **ISO/IEC/IEEE 15289:2019** ayuda a gobernar los artefactos del ciclo de vida, su
  propósito, contenido, mantenimiento y relación, pero no aporta una sintaxis de API.
- **OpenAPI 3.1**, aunque no es ISO, es la especificación adecuada para describir de
  manera procesable métodos HTTP, parámetros, cuerpos, respuestas, errores y seguridad.

Por tanto, las tablas de símbolos, firmas y bloques de código de las referencias de
[backend](../architecture/backend-technical-documentation.md) y
[frontend](../architecture/frontend-technical-documentation.md) son una convención local
alineada selectivamente con 1016. Las fichas actuales del
[contrato API](../data/api-contract.md) preparan la migración incremental a OpenAPI. No
se atribuye a ninguna ISO una plantilla que la norma no proporciona.

ISO 9001 o ISO/IEC 27001 sólo deben introducirse como requisitos documentales si la
organización adopta formalmente un sistema de gestión de calidad o de seguridad de la
información. No son necesarias únicamente porque Nexus sea una aplicación de software.
La obligación contractual, regulatoria o de auditoría siempre prevalece sobre este
criterio y debe registrarse explícitamente.

## Convenciones mínimas adoptadas

Sin declarar conformidad total con las normas anteriores, la documentación del
repositorio debe:

1. declarar un artefacto propietario para cada decisión y distinguir contenido
   normativo, vista complementaria y evidencia generada;
2. mantener identificadores estables y trazabilidad desde requisitos y casos de uso
   hacia la evidencia, sin copiar la misma regla normativa en varios documentos;
3. redactar criterios observables y verificables, diferenciando requisito, evidencia,
   estado y decisión pendiente;
4. presentar como implementado sólo aquello que tenga evidencia suficiente y conservar
   el responsable de la validación funcional fuera del estado técnico;
5. actualizar las vistas curadas afectadas y regenerar los inventarios derivados con
   `npm run docs:architecture` cuando cambie su fuente;
6. agrupar los casos de uso por capacidad funcional y conservar identificadores con el
   formato `CU-<GRUPO>-<SECUENCIA>` en el catálogo y en todos sus diagramas; estos grupos
   no se confunden con los paquetes documentales de publicación.

La convención de grupos e identificadores pertenece a la documentación normativa de
requisitos, porque define trazabilidad y estructura del modelo. No se duplica en
`AGENTS.md`: ese archivo contiene instrucciones operativas para quienes modifican el
repositorio y ya exige mantener sincronizados los documentos relacionados.

### Títulos y vocabulario técnico

Cada documento conserva un único título de nivel 1, específico y coherente con el
nombre mostrado en el índice. Las secciones usan niveles consecutivos y no repiten el
título del documento. Los nombres literales del código, rutas, variables, bibliotecas y
patrones reconocidos permanecen en inglés y entre comillas invertidas cuando procede;
la explicación se redacta en español.

Se prefieren **importación**, **exportación**, **controlador**, **servicio**, **ruta de
la API**, **interfaz**, **existencias**, **registros**, **rama** y **solicitud de cambio**
en lugar de mezclar *import*, *export*, *controller*, *service*, *endpoint*, *UI*,
*stock*, *logs*, *branch* y *pull request* dentro de una oración en español. Se permite
el término original cuando identifica una carpeta, una función, un permiso, una opción
de una herramienta o un concepto sin traducción inequívoca; no se traducen los
identificadores del código.

## Cuándo reevaluar

Se debe realizar una revisión formal de aplicabilidad y conformidad si un contrato,
cliente, auditoría o regulación exige una edición concreta de una norma. En ese caso se
registrarán, como mínimo, la edición requerida, el alcance, las exclusiones, el dueño de
cada documento, la evidencia y el método de auditoría. Hasta entonces, el repositorio
afirma **alineación práctica**, no certificación ni conformidad normativa completa.
