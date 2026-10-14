# 6. Responsabilidades, aceptación y control de cambios

La gobernanza documental permite saber quién propone un cambio, quién comprueba sus hechos y quién acepta su contenido. Una fuente en Git identifica la versión revisada; no acredita por sí sola aprobación funcional.

## Responsabilidades por artefacto

| Artefacto | Quién prepara y mantiene | Quién verifica | Quién acepta |
| --- | --- | --- | --- |
| Visión, alcance, SRS y glosario | Responsable funcional con apoyo de desarrollo | Representante de Almacén y Sistemas: necesidad, reglas, escenarios y brechas | Responsable del producto por designar; Dirección cuando cambie alcance o compromiso de servicio |
| Manuales por perfil | Persona responsable de capacitación con apoyo de desarrollo | Usuario representativo del perfil: menú, acciones, capturas y recorrido completo | Responsable operativo del área por designar |
| Arquitectura, API, datos y pruebas | Equipo de desarrollo | Otro revisor técnico: correspondencia con código, límites, contratos y comprobaciones | Responsable técnico por designar |
| Normas documentales y publicación | Equipo Nexus | Revisores funcional y técnico según el contenido afectado | Responsable del gobierno documental por designar |

Estas funciones describen el proceso requerido; no atribuyen una aprobación a una persona no nombrada. Hasta registrar responsables y su aceptación, la portada conserva **En revisión**. Una decisión de negocio no se deduce de que una prueba pase.

## Registro del cambio y de las decisiones pendientes

La incidencia o solicitud de cambio debe conservar: motivo y necesidad, documentos e IDs afectados, versión del sistema, versión documental, decisión funcional, responsable, fecha, evidencia de comprobación y pendientes. Si cambia un requisito, indicar su impacto en casos de uso, permisos, pruebas, manuales y capturas. Un ID retirado conserva la referencia de su sustituto; no se reasigna.

Cuando falta una decisión, registrar la pregunta, el impacto de dejarla abierta, la función que debe resolverla y su estado. No convertir una propuesta en una capacidad implementada ni fijar metas sin acuerdo. Siguen pendientes de acuerdo organizacional los responsables nominales, prioridades de producto, retención y clasificación de datos, disponibilidad, respaldo y recuperación. Las necesidades de producto permanecen en la [visión y sus brechas](../../requirements/vision-scope-and-requirements/10-known-gaps-and-pending-decisions.md); este capítulo gobierna su registro y seguimiento.

## Ciclo de revisión

1. Identificar el artefacto propietario desde [el índice documental](../../README.md) y delimitar el cambio.
2. Preparar las fuentes curadas y regenerar sólo los inventarios cuya fuente cambió.
3. Revisar redacción con una persona de la audiencia prevista. Un manual debe poder explicarse en voz alta; una regla de negocio debe poder aceptarse sin conocer el código; una explicación técnica debe permitir localizar su implementación y sus límites.
4. Comprobar enlaces, IDs, permisos y evidencia. Para manuales, comprobar también selección por perfil, capturas del área y todos los estados del recorrido.
5. Registrar resultado, pendientes y aceptación. La publicación aprobada identifica su versión y los documentos que reemplaza; Git conserva su historia.
6. Retirar de la distribución los documentos obsoletos sin borrar su historia. Una corrección urgente se identifica como tal y conserva su revisión pendiente.

La comprobación automatizada detecta errores estructurales; la revisión humana comprueba claridad y veracidad. Para imágenes y formatos se aplica la [guía de publicación](../publication-and-versioning/index.md); para comandos y preparación, la [guía de exportación](../document-export-guide/index.md).
