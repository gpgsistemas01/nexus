# 4. Aplicación de ISO/IEC 25010 a requisitos de calidad

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
