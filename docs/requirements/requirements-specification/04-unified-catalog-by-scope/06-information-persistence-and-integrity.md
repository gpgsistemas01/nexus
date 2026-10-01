# 4.6 Persistencia e integridad de información

| ID | Requisito y forma de comprobación | Estado |
| --- | --- | --- |
| RD-001 | Las entidades persistentes deben usar UUID como identificador técnico cuando así lo define el modelo común. | Implementado |
| RD-002 | Cantidades, existencias, dimensiones, costos e importes deben persistirse con `Decimal(18,6)`. | Implementado |
| RD-003 | Recepciones, salidas y movimientos deben conservar mediante claves foráneas sus relaciones de encabezado y detalle. | Implementado |
| RD-004 | Correcciones, cancelaciones, devoluciones y ajustes deben representarse con registros relacionados, sin sobrescribir el hecho histórico. | Implementado |
| RD-005 | Los modelos que declaran auditoría temporal deben conservar `createdAt` y `updatedAt`. | Implementado |
| RD-006 | Los catálogos maestros que declaran `isActive` deben retirarse mediante estado cuando la eliminación física no esté permitida. | Implementado |
| RD-007 | `Person` debe representar participantes del negocio y `User` la cuenta autenticada; una identidad no sustituye a la otra. | Implementado |
| RD-008 | Las referencias documentales y las identidades de catálogo marcadas como únicas no deben duplicarse. | Implementado |
| RD-009 | Las fechas del negocio deben conservarse separadas de las marcas técnicas de creación y actualización. | Implementado |
| RD-010 | Los documentos y detalles deben persistir estados explícitos del proceso en lugar de inferirlos desde marcas temporales. | Implementado |
