# 9. Alcance de datos y calidad

La visión tampoco duplica los enunciados de datos o calidad. Los ámbitos de
[persistencia e integridad](../requirements-specification/04-unified-catalog-by-scope/06-persistence-and-integrity-of-information.md#46-persistencia-e-integridad-de-información)
y de [operación y calidad](../requirements-specification/04-unified-catalog-by-scope/07-operation-and-quality-of-the-product.md#47-operación-y-calidad-del-producto)
son sus fuentes normativas.

| Área | Requisitos normativos | Alcance resumido |
| --- | --- | --- |
| Identidad e integridad de datos | `RD-001` a `RD-010` | Identificadores, precisión, relaciones, historia, temporalidad, estados y separación `Person`/`User`. |
| Seguridad | `RC-SEG-001` a `RC-SEG-004` | Credenciales, rutas protegidas, tipos de contenido y secretos. |
| Datos y pruebas | `RC-DAT-001`, `RC-DAT-002`, `RC-PRU-001`, `RC-PRU-002` | Migraciones reproducibles, base de pruebas aislada y cobertura por nivel. |
| Mantenibilidad y documentación | `RC-MAN-001`, `RC-MAN-002`, `RC-DOC-001` | Organización por dominio, reutilización y documentación sincronizada. |
| Observabilidad y despliegue | `RC-OBS-001`, `RC-OBS-002`, `RC-DES-001`, `RC-DES-002` | Logs estructurados, confidencialidad y separación runtime/migraciones. |
| Compatibilidad y usabilidad | `RC-COM-001`, `RC-COM-002`, `RC-USA-001`, `RC-USA-002` | Runtime soportado, contrato de contenido y respuesta visible de la interfaz. |
| Rendimiento y disponibilidad | `RC-REN-001` a `RC-REN-003`; `RC-DIS-001`, `RC-DIS-002` | Paginación vigente y objetivos medibles todavía pendientes. |

La regla de singularidad se aplica igualmente a `RD-*`, `RN-*` y `RC-*`: una restricción
o atributo recibe otro identificador cuando puede incumplirse, aprobarse o comprobarse
independientemente. Varias propiedades inseparables de una misma garantía pueden
permanecer en un solo requisito.
