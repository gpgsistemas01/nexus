# Aplicación de normas en Nexus

## Propósito y declaración

Este registro explica qué referencias se revisaron, qué prácticas adopta Nexus y dónde
puede comprobarlas una persona lectora. Es una evidencia de **alineación selectiva**; no
es un certificado ni una evaluación de conformidad. La edición aplicable, el alcance y
las exclusiones deberán reevaluarse si un contrato, regulación o auditoría exige
cumplimiento formal.

## Resultado de aplicabilidad

| Referencia | Decisión | Aplicación en Nexus | No se afirma ni se aplica |
| --- | --- | --- | --- |
| ISO/IEC/IEEE 29148:2018 | Principal para requisitos. | Identificación estable, redacción verificable, atributos, estado, trazabilidad, revisión y control de cambios. | No se declara conformidad integral ni se reproduce una plantilla normativa. |
| ISO/IEC 25010:2023 | Complementaria para calidad del producto. | Vocabulario para clasificar seguridad, fiabilidad, eficiencia de desempeño, capacidad de interacción y mantenibilidad cuando existe una necesidad comprobable. | No se inventan métricas, umbrales ni prioridades; tampoco se afirma una evaluación completa del producto. |
| ISO/IEC/IEEE 15289:2019 | Complementaria para información del ciclo de vida. | Responsabilidad de cada artefacto, índice, fuente de verdad, mantenimiento curado/generado y relación entre documentos. | No se exige un documento separado por cada proceso ni un paquete contractual. |
| ISO/IEC/IEEE 1016:2009 | Complementaria para descripción de diseño de software. | La guía técnica identifica elementos implementados, responsabilidades, interfaces, relaciones, vistas dinámicas y condiciones de mantenimiento. | No se afirma una descripción de diseño completa ni se atribuye a la norma la plantilla local de nombres, métodos o fragmentos. |
| ISO/IEC/IEEE 42010:2022 | Sólo arquitectura. | Interesados, preocupaciones, alcance y semántica de las vistas arquitectónicas. | No gobierna la redacción de requisitos ni convierte Mermaid en UML o C4 formal. |
| ISO/IEC 27001 e ISO 9001 | No aplicables como sistema de gestión por decisión del repositorio. | Sus temas pueden originar requisitos concretos si existe una obligación organizacional. | Nexus no declara un SGSI, un sistema de gestión de calidad ni certificación. |

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

## Aplicación de ISO/IEC/IEEE 29148 a la especificación

La revisión usa preguntas binarias en lugar de una puntuación subjetiva. Un requisito se
considera listo para revisión sólo cuando todas las respuestas aplicables son «sí».

| Criterio adoptado | Pregunta de revisión | Evidencia documental |
| --- | --- | --- |
| Identificación | ¿Tiene un ID único, estable y un tipo definido (`RF`, `RN` o `RC`)? | Convenciones e inventario de requisitos. |
| Singularidad | ¿Expresa una capacidad o restricción principal y separa criterios enumerables? | Una fila por requisito; criterios `CA-*` cuando una capacidad necesita varias comprobaciones. |
| Necesidad | ¿Existe actor, regla de negocio, obligación o atributo de calidad que lo justifique? | Alcance, casos de uso, reglas o decisión registrada. |
| Claridad | ¿Usa sujeto, verbo obligatorio, objeto y condiciones sin «adecuado», «rápido» o «cuando sea posible»? | Texto normativo y glosario. |
| Factibilidad | ¿La evidencia o el estado distingue implementado, parcial, modelado y propuesto? | Columna Estado y decisiones pendientes. |
| Verificabilidad | ¿Indica un resultado observable y una forma de comprobación reproducible? | Criterio de aceptación y evidencia/prueba. |
| Consistencia | ¿Usa términos del glosario y no contradice casos, diagramas, matriz de operaciones o permisos? | Revisión de referencias `CU-*`, `RF-*`, rutas y actores. |
| Trazabilidad | ¿Se puede recorrer requisito → permiso/validación → servicio/persistencia → prueba? | Evidencia principal, mapa generado y estrategia de pruebas. |
| Modificabilidad | ¿El cambio puede localizarse sin repetir la misma regla normativa en varios archivos? | Fuente de verdad declarada y documentos complementarios enlazados. |

### Forma de redacción adoptada

Cada requisito funcional sigue esta lectura, aunque se presente de forma compacta en una
tabla:

1. **Sujeto:** actor o sistema responsable.
2. **Obligación:** «debe» o una capacidad inequívoca en presente normativo.
3. **Objeto y condición:** dato o comportamiento afectado y situación aplicable.
4. **Resultado observable:** estado que permite decidir si se cumplió.
5. **Criterios de aceptación:** escenarios numerados cuando una sola oración dejaría de
   ser comprensible.
6. **Estado y evidencia:** grado de implementación y artefactos que permiten comprobarlo.

La implementación no se copia dentro de la obligación. Los nombres de archivos se
mantienen en Evidencia; decisiones de interfaz o algoritmos sólo aparecen en criterios
cuando son parte del comportamiento comprometido.

## Aplicación de ISO/IEC 25010 a requisitos de calidad

La norma se utiliza como vocabulario de revisión, no como lista que deba llenarse con
valores ficticios. La sección de calidad de la especificación mantiene únicamente
necesidades justificadas:

| Tema usado en Nexus | Requisitos actuales | Comprobación o decisión pendiente |
| --- | --- | --- |
| Seguridad | `RC-SEG-001` a `RC-SEG-004`; `RN-001`, `RN-009`, `RN-010` | Credenciales, secretos, middleware y pruebas negativas. |
| Fiabilidad e integridad de datos | `RD-001` a `RD-010`; `RC-DAT-001`, `RC-DAT-002`; `RN-002` a `RN-005`, `RN-011` a `RN-018`, `RN-020` a `RN-022` | Persistencia, migraciones, transacciones y trazabilidad de movimientos. |
| Mantenibilidad | `RC-MAN-001`, `RC-MAN-002`, `RC-DOC-001` | Capas por dominio, reutilización y `npm run docs:check`. |
| Capacidad de interacción | Requisitos funcionales de formularios y retroalimentación | Criterios observables del flujo; faltan métricas de usabilidad acordadas. |
| Eficiencia de desempeño | `RC-REN-001` a `RC-REN-003` | Paginación parcial; tiempos, concurrencia y volumen propuestos hasta acordar métricas. |
| Disponibilidad y recuperación | `RC-DIS-001`, `RC-DIS-002` | Propuestos hasta definir infraestructura, disponibilidad, RTO, RPO y responsable. |

Una característica sin necesidad, umbral, propietario o método de comprobación queda
como decisión pendiente; no se presenta como requisito cumplido.

## Resultado de la revisión vigente

La revisión documental encontró y trató estas brechas:

| Hallazgo | Tratamiento vigente | Seguimiento |
| --- | --- | --- |
| Casos con verbos amplios («administrar», «mantener»). | Se separaron en objetivos `CU-*` observables; las familias sólo comparten contexto. | Verificar igualdad de IDs entre catálogo y diagramas al cambiar casos. |
| Requisitos extensos que mezclan obligación, diseño y numerosos escenarios. | Se adoptó una obligación por operación observable en todos los paquetes; los criterios `CA-*` conservan variantes del mismo resultado. | Revisar la granularidad con la misma regla cuando cambie cualquier requisito, sin crear una obligación por campo. |
| Evidencia mezclada con la formulación normativa. | La evidencia permanece en columna propia y el mapa generado conserva rutas/importaciones. | Rechazar nuevas filas que describan archivos dentro de la obligación. |
| Calidad sin valores medidos. | Rendimiento y disponibilidad permanecen propuestos. | Definir propietario, línea base, umbral y prueba antes de marcarlos implementados. |
| Ausencia de responsable formal de aprobación. | El estado refleja evidencia técnica, no aceptación funcional. | Registrar responsable y aprobación en la incidencia o solicitud de cambio. |

### Auditoría de granularidad por tipo

| Tipo | Decisión aplicada | Ejemplos de separación |
| --- | --- | --- |
| `RF-*` funcional | Una operación o resultado observable por requisito. | Iniciar/renovar/cerrar sesión; consultar/crear/editar; surtir/devolver. |
| `RD-*` datos | Una garantía persistente que puede comprobarse de forma independiente. | UUID, precisión decimal, relaciones, historia, fechas y estados. |
| `RN-*` negocio | Una restricción transversal por posible incumplimiento. | Autenticación, autorización y validación de entrada tienen IDs distintos. |
| `RC-*` calidad | Un atributo y mecanismo de comprobación por requisito. | Hash, rutas protegidas, aislamiento de pruebas, logs, runtime y despliegue. |

La revisión no divide listas de atributos inseparables de una misma identidad ni los
participantes de una misma transacción atómica. Esos detalles permanecen como condición
o criterio de aceptación del requisito propietario.

## Mantenimiento y evidencia de revisión

Al modificar requisitos se debe:

1. aplicar la tabla binaria de ISO/IEC/IEEE 29148 a cada requisito afectado;
2. comprobar que casos de uso y diagramas conservan los mismos `CU-*`;
3. revisar actores, glosario, matriz de operaciones y estados;
4. mantener las pruebas unitarias junto a su artefacto y las integraciones CRUD en
   `tests/integration/controllers`;
5. ejecutar `npm run docs:check` y las pruebas relacionadas;
6. registrar cualquier criterio no aplicable, brecha aceptada o aprobación externa en
   la incidencia que origina el cambio.

La reevaluación completa ocurre al cambiar la edición contractual de una norma, el
alcance del producto, los actores, las características de calidad o la estructura de los
artefactos documentales.
