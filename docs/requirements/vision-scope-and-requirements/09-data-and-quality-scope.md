# 9. Alcance de datos y calidad

Las necesidades de calidad se expresan aquí desde sus consecuencias para usuarios y
operación. Sus obligaciones y comprobaciones pertenecen a los ámbitos normativos de
[persistencia e integridad](../requirements-specification/04-unified-catalog-by-scope/06-information-persistence-and-integrity.md)
y [operación y calidad](../requirements-specification/04-unified-catalog-by-scope/07-product-operation-and-quality.md).

| Necesidad | Requisitos normativos relacionados | Resultado esperado o límite |
| --- | --- | --- |
| Información íntegra y trazable | `RD-001` a `RD-010` | Conservar identidades, cantidades, relaciones, estados e historia; distinguir persona de cuenta. |
| Acceso seguro | `RC-SEG-001` a `RC-SEG-004` | Proteger credenciales y datos; rechazar operaciones no autorizadas y evitar exposición de secretos. |
| Cambios comprobables | `RC-DAT-001`, `RC-DAT-002`, `RC-PRU-001`, `RC-PRU-002` | Actualizar datos de forma reproducible y verificar cambios en pruebas aisladas; la cobertura tiene brechas conocidas. |
| Mantenimiento y documentación | `RC-MAN-001`, `RC-MAN-002`, `RC-DOC-001` | Mantener reglas consistentes y documentación útil para revisar cambios. |
| Diagnóstico y operación | `RC-OBS-001`, `RC-OBS-002`, `RC-DES-001`, `RC-DES-002` | Reconocer fallos sin divulgar información confidencial y controlar las condiciones de puesta en servicio. |
| Compatibilidad e interacción | `RC-COM-001`, `RC-COM-002`, `RC-USA-001`, `RC-USA-002` | Operar en el entorno soportado, acceder a acciones en pantallas angostas y comprender errores sin perder el contexto. |
| Rendimiento y disponibilidad | `RC-REN-001` a `RC-REN-003`; `RC-DIS-001`, `RC-DIS-002` | Consultar listados paginados cuando el flujo lo admite; tiempos, concurrencia, disponibilidad y recuperación aún requieren acuerdo. |

ISO/IEC 25010:2023 se utiliza como vocabulario de revisión, no como evidencia de que
cada característica del modelo tenga un compromiso aprobado en Nexus. No se prometen
SLA, tiempos máximos, RTO o RPO sin medida, contexto y aceptación explícitos. La
[aplicación de calidad](../../governance/standards-application/04-application-of-iso-iec-25010-to-requirements-of-quality.md)
y el capítulo 10 registran esos límites.
