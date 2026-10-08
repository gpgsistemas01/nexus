# 4.6 Persistencia e integridad de información

| ID | Requisito y forma de comprobación | Estado |
| --- | --- | --- |
| RD-001 | Las entidades persistentes deben usar UUID como identificador técnico cuando así lo define el modelo común. | Implementado |
| RD-002 | Cantidades, existencias, dimensiones, costos e importes deben persistirse con `Decimal(18,6)`. | Implementado |
| RD-003 | Recepciones, salidas y movimientos deben conservar mediante claves foráneas sus relaciones de encabezado y detalle. | Implementado |
| RD-004 | Correcciones, cancelaciones, devoluciones y ajustes deben representarse con registros relacionados, sin sobrescribir el hecho histórico. | Implementado |
| RD-005 | Los modelos que declaran auditoría temporal deben conservar `createdAt` y `updatedAt`. | Implementado |
| RD-006 | Los catálogos maestros que declaran `isActive` deben retirarse mediante estado cuando la eliminación física no esté permitida. | Implementado |
| RD-007 | Persona debe representar participantes del negocio y Usuario la cuenta autenticada; los accesos pertenecen a la cuenta y las responsabilidades organizacionales a la persona, sin sustituirse entre sí. | Implementado |
| RD-008 | Las referencias documentales y las identidades de catálogo marcadas como únicas no deben duplicarse. | Implementado |
| RD-009 | Las fechas del negocio deben conservarse separadas de las marcas técnicas de creación y actualización. | Implementado |
| RD-010 | Los documentos y detalles deben persistir estados explícitos del proceso en lugar de inferirlos desde marcas temporales. | Implementado |

### Comprobación de datos

Las referencias técnicas de esta sección son restricciones de representación, no
atributos obligatorios de los diagramas conceptuales. Persona y Usuario corresponden a
`Person` y `User` en el modelo persistente. Las garantías se revisan en el
[modelo y diccionario de datos](../../../architecture/views/logical/data-and-persistence/index.md)
y mediante [pruebas de persistencia aisladas](../../../testing/test-plan.md).

- Para `RD-002`, comprobar que cantidades, costos e importes conservan la precisión
  declarada sin convertirla en una tolerancia de negocio inventada.
- Para `RD-004` y `RD-008`, verificar conservación del hecho anterior y rechazo de
  duplicados, tanto después de una operación válida como después de un rechazo.
- Para `RD-009` y `RD-010`, comprobar fechas y estados explícitos del proceso;
  una marca técnica de creación no reemplaza la fecha del negocio ni prueba surtimiento.
