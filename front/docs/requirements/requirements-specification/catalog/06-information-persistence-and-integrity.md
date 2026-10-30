# 4.6 Persistencia e integridad de información

| ID | Requisito | Estado |
| --- | --- | --- |
| RD-001 | Las entidades con identificador individual deben utilizar UUID. Las asociaciones y recibos con clave compuesta deben conservar la combinación de identificadores definida en el esquema de datos. | Implementado |
| RD-002 | Cantidades, existencias, dimensiones, costos e importes deben persistirse con `Decimal(18,6)`. Los pesos de cono, total, neto unitario y total de referencia de Rollo deben usar `Decimal(5,2)`. | Implementado |
| RD-003 | Recepciones, salidas y movimientos deben conservar mediante claves foráneas sus relaciones de encabezado y detalle. | Implementado |
| RD-004 | Correcciones, cancelaciones, devoluciones y ajustes deben representarse con registros relacionados, sin sobrescribir el hecho histórico. | Implementado |
| RD-005 | Los modelos que declaran auditoría temporal deben conservar `createdAt` y `updatedAt`. | Implementado |
| RD-006 | Los catálogos maestros que declaran `isActive` deben retirarse mediante estado cuando la eliminación física no esté permitida. | Implementado |
| RD-007 | Persona debe representar participantes del negocio y Usuario la cuenta autenticada; los accesos pertenecen a la cuenta y las responsabilidades organizacionales a la persona, sin sustituirse entre sí. | Implementado |
| RD-008 | Las referencias documentales y las identidades de catálogo marcadas como únicas no deben duplicarse. | Implementado |
| RD-009 | Las fechas del negocio deben conservarse separadas de las marcas técnicas de creación y actualización. | Implementado |
| RD-010 | Los documentos y detalles deben persistir estados explícitos del proceso en lugar de inferirlos desde marcas temporales. | Implementado |
| RD-011 | Las escrituras simultáneas de una salida o compra deben conservar cantidades, estados, totales y saldos trazables. Una operación rechazada no debe dejar cambios parciales en documento, detalles, existencias, movimientos o costos. | Implementado |

## Comprobación de datos

Las referencias técnicas de esta sección son restricciones de representación, no
atributos obligatorios de los diagramas conceptuales. Persona y Usuario corresponden a
`Person` y `User` en el modelo persistente. Las garantías se revisan en el
modelo y diccionario de datos
y mediante pruebas de persistencia aisladas.

- Para `RD-002`, comprobar que cantidades, costos e importes conservan la precisión
  declarada sin convertirla en una tolerancia de negocio inventada.
- Para `RD-004` y `RD-008`, verificar conservación del hecho anterior y rechazo de
  duplicados, tanto después de una operación válida como después de un rechazo.
- Para `RD-009` y `RD-010`, comprobar fechas y estados explícitos del proceso;
  una marca técnica de creación no reemplaza la fecha del negocio ni prueba surtimiento.
- Para `RD-011`, ejecutar solicitudes coincidentes sobre la misma fila en PostgreSQL
  aislado y comprobar respuestas HTTP, persistencia, historial y rollback con
  `warehouseConcurrencyControllerDbTest.js`. El bloqueo se aplica al guardar; no reserva
  el documento mientras el usuario mantiene abierto un formulario ni identifica
  reenvíos de entradas independientes como una misma operación.

## Criterios de fechas del negocio

- **CA-RD-009-1:** Compras y Salidas deben interpretar la fecha y hora capturadas en
  `America/Mexico_City`, convertirlas a UTC para el intercambio y volver a mostrarlas
  en esa zona al abrir el documento.
- **CA-RD-009-2:** una fecha inexistente, como 30 de febrero, debe rechazarse antes
  del envío; no debe normalizarse silenciosamente a otro día.
