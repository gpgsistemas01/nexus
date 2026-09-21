# 3. Actores y responsabilidad del sistema

| Participante | Responsabilidad |
| --- | --- |
| Personal de almacén (área Almacén y proveduría) | Mantener catálogos operativos y ejecutar entradas, salidas, devoluciones y ajustes autorizados. |
| Solicitante o aprobador | Participar en documentos operativos de acuerdo con su rol y departamento. |
| Administrador del sistema (área Sistemas) | Ejecutar todas las capacidades vigentes, incluida la administración de clientes, personas, usuarios y accesos, siempre con autorización comprobada en el servidor. Ventas no accede al sistema. |
| Dirección | Parte interesada de supervisión; sus casos de uso y alcance autorizado permanecen pendientes de definición. |
| Nexus (sistema) | Validar, persistir atómicamente, numerar documentos, auditar escrituras críticas y notificar actualizaciones; es participante interno, no actor externo. |

Los nombres de actor expresan responsabilidades, no conceden acceso por sí mismos. La
autorización efectiva se calcula con las asignaciones de usuario, rol y departamento
descritas en [usuarios y permisos](../../data/database-users-and-permissions-analysis.md).
