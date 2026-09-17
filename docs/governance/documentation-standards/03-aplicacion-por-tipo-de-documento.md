# 3. Aplicación por tipo de documento

| Referencia | Uso recomendado en Nexus | Alcance actual |
| --- | --- | --- |
| [ISO/IEC/IEEE 29148:2018](https://www.iso.org/standard/72089.html) | Mantener requisitos identificables, necesarios, verificables, trazables y separados de su evidencia de implementación. | Aplica a `requirements-specification/`, `use-cases/` y `diagrams/`. Es la guía principal, no una declaración de conformidad. |
| [ISO/IEC/IEEE 1016:2009](https://www.iso.org/standard/45144.html) | Estructurar una descripción de diseño mediante interesados, preocupaciones, puntos de vista, vistas, elementos de diseño, relaciones y justificación. | Es la referencia más próxima para la documentación técnica del código y complementa 42010. Se aplica selectivamente a la guía común y a las referencias separadas de backend y frontend; no prescribe JSDoc, nombres de funciones, bloques de código ni una plantilla por endpoint. |
| [ISO/IEC/IEEE 42010:2022](https://www.iso.org/standard/74393.html) | Explicar interesados, preocupaciones, puntos de vista, vistas y decisiones arquitectónicas cuando esa información sea útil. | Aplica de forma ligera a `architecture-and-web-views/index.md` y a las [convenciones de diagramas](../../architecture/diagram-conventions/index.md); no exige reemplazar Mermaid ni adoptar una herramienta nueva. |
| [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html) | Usar un vocabulario consistente para características de calidad y convertir sólo objetivos acordados en requisitos medibles. | Sirve para revisar la sección de calidad; no autoriza inventar umbrales de rendimiento, disponibilidad o seguridad. |
| [ISO/IEC/IEEE 15289:2019](https://www.iso.org/standard/74909.html) | Orientar el contenido y ciclo de vida de los elementos de información sin imponer un formato único. | Útil si el conjunto documental crece o necesita entregables contractuales; por ahora basta el índice y la regla de actualización existentes. |
| OpenAPI 3.1 | Versionar el contrato HTTP de rutas, parámetros, cuerpos, respuestas, errores y autenticación. | Es una especificación técnica complementaria, no una norma ISO ni un sustituto de requisitos o arquitectura. Su adopción sigue la estrategia de `api-contract/index.md`. |

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
[backend](../../architecture/backend-technical-documentation/index.md) y
[frontend](../../architecture/frontend-technical-documentation/index.md) son una convención local
alineada selectivamente con 1016. Las fichas actuales del
[contrato API](../../architecture/api-contract/index.md) se complementan con la
[especificación OpenAPI 3.1](../../architecture/openapi/openapi.json). No se atribuye a ninguna ISO
una plantilla que la norma no proporciona.

### Entregables recomendados para Nexus

La aplicación conjunta de estas referencias no obliga a elegir entre SRS y arquitectura:
ambas responden preguntas distintas y deben conservarse como entregas coordinadas.

| Entrega | Contenido recomendado | Relación con casos de uso |
| --- | --- | --- |
| Visión y alcance | Necesidad, interesados, contexto de negocio, objetivos y límites del producto. | Resume capacidades; no contiene el flujo detallado. |
| SRS | Requisitos funcionales y de calidad, reglas, condiciones, resultados, atributos, estado y trazabilidad. | Es propietaria de actores, precondiciones, flujo principal, alternativas, excepciones y postcondiciones de cada `CU-*`. |
| Descripción de arquitectura | Interesados y preocupaciones arquitectónicas, puntos de vista, vistas, correspondencias, decisiones y justificación; se complementa con elementos, interfaces y relaciones de diseño. | Usa los `CU-*` como escenarios o entradas para seleccionar y validar vistas; documenta su realización sin copiar la ficha. |

ISO/IEC/IEEE 15289 permite gobernar estos contenidos como elementos de información; no
se interpreta aquí que cada concepto deba convertirse en un archivo físico independiente.
Por ello Nexus mantiene fuentes Markdown modulares y produce paquetes exportables. ISO no
obliga a utilizar Mermaid, UML, C4, 4+1, arc42 ni una herramienta concreta: son elecciones
locales para representar las vistas y sólo se atribuyen a la norma los conceptos que ésta
orienta.

ISO 9001 o ISO/IEC 27001 sólo deben introducirse como requisitos documentales si la
organización adopta formalmente un sistema de gestión de calidad o de seguridad de la
información. No son necesarias únicamente porque Nexus sea una aplicación de software.
La obligación contractual, regulatoria o de auditoría siempre prevalece sobre este
criterio y debe registrarse explícitamente.
