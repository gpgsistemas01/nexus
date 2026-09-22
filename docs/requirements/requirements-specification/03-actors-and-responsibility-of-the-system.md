# 3. Actores y responsabilidad del sistema

| Participante | Responsabilidad |
| --- | --- |
| Personal de almacén (área Almacén y proveduría) | Mantener los catálogos operativos autorizados y ejecutar entradas, salidas y devoluciones. No ajusta existencias mediante la acción administrativa. |
| Solicitante o aprobador | Participar en documentos operativos de acuerdo con su rol y departamento. |
| Administrador del sistema (área Sistemas) | Ejecutar todas las capacidades vigentes, incluida la administración de clientes, personas, usuarios y accesos, siempre con autorización comprobada en el servidor. Ventas no accede al sistema. |
| Dirección | Parte interesada de supervisión; sus casos de uso y alcance autorizado permanecen pendientes de definición. |
| Nexus (sistema) | Validar, persistir atómicamente, numerar documentos, auditar escrituras críticas y notificar actualizaciones; es participante interno, no actor externo. |

Los nombres de actor expresan responsabilidades, no conceden acceso por sí mismos. La
autorización efectiva se calcula con las asignaciones de usuario, rol y departamento
descritas en [usuarios y permisos](../../data/database-users-and-permissions-analysis.md).

El [diagrama de casos de uso](../domain-and-use-cases/03-cases-of-use-current.md) conserva
las asociaciones y generalizaciones de actores; cada [ficha `CU-*`](../use-cases/index.md)
nombra al actor que inicia el objetivo. La
[matriz de operaciones](../requirements-operations-matrix.md) concentra las operaciones,
las autorizaciones requeridas y su estado de disponibilidad. Estas fuentes se
complementan y no se repiten aquí como otra matriz.

El Administrador del sistema hereda en el diagrama las capacidades asociadas al Personal
de almacén, no a la inversa. Solicitantes, aprobadores, asesores, receptores y proveedores
pueden participar en un documento sin convertirse por ello en actores con acceso. Las
lecturas auxiliares para selectores tampoco conceden mantenimiento del catálogo ni
sustituyen los controles de acceso del sistema.
