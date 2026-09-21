# 2. Resultado de aplicabilidad

| Referencia | Decisión | Aplicación en Nexus | No se afirma ni se aplica |
| --- | --- | --- | --- |
| ISO/IEC/IEEE 29148:2018 | Principal para requisitos. | Identificación estable, redacción verificable, atributos, estado, trazabilidad, revisión y control de cambios. | No se declara conformidad integral ni se reproduce una plantilla normativa. |
| ISO/IEC 25010:2023 | Complementaria para calidad del producto. | Vocabulario para clasificar seguridad, fiabilidad, eficiencia de desempeño, capacidad de interacción y mantenibilidad cuando existe una necesidad comprobable. | No se inventan métricas, umbrales ni prioridades; tampoco se afirma una evaluación completa del producto. |
| ISO/IEC/IEEE 15289:2019 | Complementaria para información del ciclo de vida. | Responsabilidad de cada artefacto, índice, fuente de verdad, mantenimiento curado/generado y relación entre documentos. | No se exige un documento separado por cada proceso ni un paquete contractual. |
| ISO/IEC/IEEE 1016:2009 | Complementaria para descripción de diseño de software. | La guía técnica identifica elementos implementados, responsabilidades, interfaces, relaciones, vistas dinámicas y condiciones de mantenimiento. | No se afirma una descripción de diseño completa ni se atribuye a la norma la plantilla local de nombres, métodos o fragmentos. |
| ISO/IEC/IEEE 42010:2022 | Sólo arquitectura. | Interesados, preocupaciones, alcance y semántica de las vistas arquitectónicas. | No gobierna la redacción de requisitos ni convierte Mermaid en UML o C4 formal. |
| ISO/IEC 27001 e ISO 9001 | No aplicables como sistema de gestión por decisión del repositorio. | Sus temas pueden originar requisitos concretos si existe una obligación organizacional. | Nexus no declara un SGSI, un sistema de gestión de calidad ni certificación. |

### Aplicación de marcos prácticos no normativos

Las normas anteriores se complementan con prácticas de organización que no constituyen
certificación. Su aplicación detallada y los criterios de división se mantienen en
[Buenas prácticas para organizar la documentación](../documentation-practices/index.md).

| Práctica | Aplicación en Nexus | Límite declarado |
| --- | --- | --- |
| Diátaxis | Se distingue guía práctica, referencia, explicación y aprendizaje según la necesidad de quien lee. | No se cuadruplica contenido ni se fuerza una plantilla única. |
| arc42 | Se usa como lista de cobertura para contexto, construcción, ejecución, despliegue, decisiones y calidad. | No se declara adopción integral ni se reemplazan los artefactos propietarios. |
| Modelo C4 | Se aplica revelado progresivo entre contexto, contenedores, componentes y detalle de código. | Mermaid y las convenciones locales no se presentan automáticamente como C4 formal. |
| ADR | Las decisiones arquitectónicas transversales conservan contexto, alternativas y consecuencias. | No se crea un registro para cambios editoriales o locales. |
| Docs as Code | Markdown, Git, generación, comprobaciones y manifiestos de publicación forman un flujo reproducible. | La automatización no inventa decisiones curadas ni versiona resultados de `build/docs`. |

### Aplicación de ISO/IEC/IEEE 1016 a la referencia técnica

La adopción es deliberadamente parcial. Nexus usa conceptos de descripción de diseño
para que una vista técnica responda una pregunta y pueda recorrerse hasta evidencia
concreta, sin convertir cada archivo en un documento independiente.

| Concepto adoptado | Aplicación vigente | Evidencia |
| --- | --- | --- |
| Elemento de diseño | Se identifican archivo, símbolo o ruta con un nombre literal y una responsabilidad. | Tablas de las referencias técnicas de backend y frontend. |
| Relación e interfaz | Se documentan llamadas entre router, middleware, DTO, controller, servicio, inventario y persistencia. | Tabla de operaciones y diagrama de secuencia del surtimiento. |
| Vista | Cada diagrama declara alcance, semántica y evento que obliga a revisarlo. | Diagramas de montaje, secuencia y decisiones; convenciones de diagramas. |
| Justificación | La prosa explica separación entre transporte y dominio, reutilización y límite transaccional cuando no son evidentes por el nombre. | Bloques explicados y referencias al patrón propietario. |
| Trazabilidad | La explicación enlaza código, contrato HTTP, requisito y evidencia ejecutable sin copiar sus reglas. | Guía técnica, contrato API, mapa generado y plan de pruebas. |

Las correspondencias entre vistas también se adoptan de manera selectiva. En Nexus,
una secuencia aplicada declara códigos `FE-P*` o `BE-P*`, y el índice de su colección
los relaciona con un identificador canónico `DIA-PAT-*`. Así puede recorrerse la
manifestación concreta hacia el patrón sin incrustar un diagrama dentro de otro. La
[convención de enlace](../../architecture/diagram-conventions/06-inventory-of-notation-uml.md#enlaces-entre-diagramas-y-patrones)
es local: 42010 y 1016 orientan la separación, las relaciones y la trazabilidad entre
vistas, pero no prescriben esos códigos, Markdown ni Mermaid.

Los campos **nombre, firma, entrada/salida, efecto y evidencia** son la plantilla local
elegida para hacer verificable esa alineación. ISO/IEC/IEEE 1016 no obliga a usar
Markdown, Mermaid, JSDoc ni esos encabezados. Una evaluación contractual de conformidad
requeriría revisar el contenido completo exigido por la edición aplicable y registrar
responsables y aprobaciones formales.

### Plantilla adoptada para casos de uso

ISO/IEC/IEEE 29148 aporta los criterios con los que se revisa la información —identidad,
necesidad, claridad, consistencia, verificabilidad y trazabilidad—, pero no se usa como
fuente de una plantilla literal. Nexus define una ficha de dos columnas que **incluye**
identificador y nombre, actor y disparador, participación, precondiciones, flujo
principal, alternativas y excepciones cuando existan, postcondiciones, inferencia desde
código y requisitos relacionados. Las precondiciones y postcondiciones se enumeran de
forma individual: una ficha conserva tantas como exija su estado inicial y sus efectos,
sin comprimir varias garantías en una sola oración ni completar una cantidad fija.

La plantilla **excluye** secciones vacías para alternativas o excepciones inexistentes,
la descripción exhaustiva de la interfaz y detalles internos de rutas, controladores o
servicios como si fueran acciones del actor. Tampoco exige UML formal ni una ficha
separada por módulo. Estas inclusiones y exclusiones son decisiones de organización del
catálogo, no requisitos atribuidos a la norma.
