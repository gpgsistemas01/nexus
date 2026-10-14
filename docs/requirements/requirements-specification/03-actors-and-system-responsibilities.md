# 3. Actores y responsabilidad del sistema

| Participante | Responsabilidad |
| --- | --- |
| Personal de almacén (área Almacén y proveduría) | Mantener los catálogos operativos autorizados y ejecutar entradas, salidas y devoluciones. No ajusta existencias mediante la acción administrativa. |
| Solicitante o aprobador | Persona que participa como dato del documento cuando corresponde; no implica una cuenta, acceso ni un flujo de aprobación disponible. |
| Administrador del sistema (área Sistemas) | Ejecutar todas las capacidades vigentes, incluida la administración de clientes, personas, usuarios y accesos, siempre con autorización comprobada en el servidor. Ventas no accede al sistema. |
| Dirección | Parte interesada de supervisión; sus casos de uso y alcance autorizado permanecen pendientes de definición. |
| Nexus (sistema) | Comprobar accesos y reglas, confirmar operaciones sin cambios parciales, asignar folios, conservar historia y notificar actualizaciones. La auditoría tiene el alcance configurado, no cobertura exhaustiva; el sistema no es actor externo. |

Los nombres de actor expresan responsabilidades, no conceden acceso por sí mismos. La
autorización efectiva se calcula con las asignaciones de usuario, rol y departamento
descritas en [usuarios y permisos](../../architecture/views/logical/02-identity-access-and-audit.md).

El [diagrama de casos de uso](../domain-and-use-cases/02-current-use-cases.md) conserva
las asociaciones y generalizaciones de actores; cada [ficha `CU-*`](../use-cases/index.md)
nombra al actor que inicia el objetivo. Los
[modos y efectos](06-operation-modes-and-effects.md) concentran las reglas funcionales;
la arquitectura y OpenAPI describen su realización. Estas fuentes se
complementan y no se repiten aquí como otra matriz.

Personal de almacén especializa a Usuario registrado; Administrador del sistema
especializa a Personal de almacén y hereda sus asociaciones, incluida autenticación.
Las asociaciones compartidas se dibujan sólo en el actor general; los objetivos
exclusivos, como ajustes administrativos y consulta de movimientos, se asocian al
administrador. Esta generalización funcional no sustituye la comprobación de permisos.

Solicitantes, aprobadores, asesores, receptores y proveedores
pueden participar en un documento sin convertirse por ello en actores con acceso. Las
lecturas auxiliares para selectores tampoco conceden mantenimiento del catálogo ni
sustituyen los controles de acceso del sistema.
