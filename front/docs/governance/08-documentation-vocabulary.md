# 8. Vocabulario de requisitos y documentación

## Alcance

Esta referencia define palabras utilizadas para especificar, revisar y publicar
la documentación. Los conceptos que describen personas, artículos y operaciones
pertenecen al [glosario de negocio](../requirements/business-glossary.md); la
[guía de diagramas](../architecture/views/diagram-reading.md) concentra notación,
actores, guardas y efectos de transición.

## Especificación y aceptación

| Término | Significado | Distinción |
| --- | --- | --- |
| Parte interesada | Persona, grupo u organización con necesidades o preocupaciones sobre el producto. | No toda parte interesada es usuario o actor de un caso de uso. |
| Objetivo de negocio | Resultado de valor que justifica el producto o una capacidad. | Una capacidad implementada no demuestra una meta alcanzada; requiere indicadores acordados. |
| Alcance vigente | Capacidades y límites incluidos actualmente en el producto. | Un concepto modelado o una propuesta no equivalen a una capacidad disponible. |
| Supuesto | Condición que se toma como base para analizar u operar y debe confirmarse. | No es un hecho verificado ni un requisito aprobado por sí mismo. |
| Dependencia | Condición, dato o servicio necesario para una capacidad u operación. | Su disponibilidad y responsabilidad requieren revisión. |
| Restricción | Límite que condiciona una solución u operación. | Debe tener fuente; no se deduce de una preferencia de implementación. |
| Riesgo | Posible situación que afecta un objetivo o la operación. | No es un incidente ya ocurrido; las decisiones abiertas pueden dejar riesgos sin tratar. |
| SRS | Especificación de requisitos de software que conserva obligaciones, reglas, criterios, estados y trazabilidad. | Complementa visión y alcance; no equivale a arquitectura ni a código. |
| Requisito | Obligación identificada y verificable sobre una capacidad, dato, regla o calidad. | Su fuente normativa es la SRS; el código aporta evidencia, no aceptación funcional. |
| Criterio de aceptación | Condición observable que permite comprobar el cumplimiento de un requisito o resultado acordado. | Aprobar pruebas técnicas no sustituye la aceptación de negocio. |
| Línea base de requisitos | Conjunto versionado y aprobado de requisitos y vocabulario usado como referencia para cambios. | Un paquete En revisión es una propuesta; su versionado no demuestra aceptación funcional. |

## Objetivos de servicio y recuperación

Estos términos se utilizan al documentar requisitos de calidad y operación.
Sus definiciones no establecen valores comprometidos para Nexus.

| Término | Significado | Distinción |
| --- | --- | --- |
| SLA | Acuerdo de nivel de servicio con medidas y compromisos aceptados. | Nexus no tiene aquí valores comprometidos; están pendientes de acuerdo. |
| RTO | Objetivo de tiempo de recuperación del servicio después de una interrupción. | Es un objetivo por acordar, no un tiempo demostrado. |
| RPO | Objetivo de pérdida máxima de datos expresada como intervalo entre el último punto recuperable y la interrupción. | Es distinto de RTO; requiere política y medios de recuperación acordados. |

## Mantenimiento del vocabulario de negocio

1. Un requisito nuevo reutiliza primero un término canónico; no crea un sinónimo por
   módulo o pantalla.
2. Una diferencia real de contexto se expresa con un calificativo, por ejemplo «salida
   de material», «salida de consumible» y «salida de merma», y reutiliza el proceso común cuando corresponde.
3. El responsable funcional valida definiciones nuevas o ambiguas antes de aceptar el
   requisito. Desarrollo verifica su correspondencia con rutas, DTO, servicios y datos.
4. Cambiar el significado de un término obliga a revisar requisitos, casos de uso,
   modos y efectos de las operaciones,
   diagramas de dominio, contrato API, mensajes visibles y pruebas relacionadas.
5. El glosario no enumera todos los campos ni valores permitidos. Esos detalles se
   mantienen en el diccionario técnico, Prisma, validadores o catálogos según su fuente.
