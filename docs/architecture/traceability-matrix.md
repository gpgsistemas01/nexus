# Matriz de trazabilidad entre requisitos, arquitectura, código y pruebas

## Propósito y regla de lectura

Los requisitos definen **qué y por qué**; frontend y backend explican **cómo** dentro de
su límite; el contrato API une ambos; Prisma evidencia persistencia; y las pruebas
registran el resultado verificable. Ningún documento sustituye al anterior. El recorrido
bidireccional es:

`RF/RN/RC ↔ CU ↔ procedimiento del manual ↔ vista frontend ↔ API ↔ ruta/controller/servicio ↔ datos ↔ prueba`.

Esta matriz agrupa capacidades que comparten implementación. La fila no afirma cobertura
completa: “brecha” significa que existe código o requisito sin evidencia automatizada
suficiente. Los archivos exactos de rutas y exports se localizan en el mapa generado.

## Trazabilidad funcional representativa

| Requisito / caso | Frontend | Backend y datos | Diagramas | Evidencia automatizada / estado |
| --- | --- | --- | --- | --- |
| `RF-AUT-001`, `CU-AUT-01` | Login EJS, formulario, aplicación y `authService` | Ruta/controller de autenticación y credenciales | `DIA-ARQ-SEQ-001`, flujo `DIA-REQ-CU-AUT-01` | Sin integración HTTP registrada; brecha. |
| `RF-IAM-001..008`, `CU-IDA-01..07` | Personas/usuarios, modales, catálogos | Rutas admin, controllers, servicios y relaciones de acceso | Flujos `DIA-REQ-CU-IDA-*`, secuencias agrupadas de identidad | Unitarias de permisos y servicios parciales; falta persistencia integrada. |
| `RF-CAT-001..018`, `CU-CAT-01..20` | CRUD configurable de materiales, mermas, proveedores y clientes | Rutas/servicios de catálogo, ajustes y modelos relacionados | Ciclo CRUD, `DIA-FE-CU-CAT-01..20`, flujos de catálogo | Integraciones de clientes/proveedores/catálogos; controllers material/merma; brechas CRUD señaladas en plan. |
| `RF-REC-001..008`, `CU-ENT-01..05` | Entrada, detalle y modales de corrección/cancelación | `goodsReceiptService`, `detailChanges`, movimientos y transacción | `DIA-BE-CU-ENT-01..05`, alta y corrección en requisitos | Unitarias de controller/DTO/helpers; falta integración HTTP de compra. |
| `RF-ISS-001..006`, `CU-SAL-01..06` | `createIssueApplication`, formulario y devolución de material | Servicio de salida/devolución, movimiento y estados | `DIA-BE-CU-SAL-05`, `DIA-BE-ACT-001`, máquina `DIA-REQ-EST-002` | Controller unitario; falta integración HTTP con rollback. |
| `RF-WST-001..007`, `CU-SAL-07..12` | Misma fábrica de salidas con adaptadores de merma | Servicios de salida/devolución y movimientos de merma | Mismos patrones, con participantes de merma; máquina compartida | Integración `wasteIssueControllerDbTest.js` cubre documento, stock, movimientos, devolución y rollback. |
| `RN-023`, casos de alta, edición y surtimiento de almacén | Formularios conservan el modo del caso; el servidor decide vigencia | Validaciones `isActive`, snapshots históricos y servicios de compras/salidas | `DIA-REQ-ACT-001` y decisiones dentro de `CU-CAT`, `CU-ENT` y `CU-SAL` | Unitarias de helpers de compra/salida e integración de salida de merma parcial; completar integración de materiales cuando exista base de prueba. |
| `RF-REP-001..005`, `CU-REP-01..15` | Tabla, filtros y acción de exportar dentro de cada módulo propietario; `createReportApplication` es infraestructura compartida | Query, controller y generación Excel específicos del contexto consultado | Cada flujo `DIA-REQ-CU-REP-*`; sin diagrama transversal que interrumpa el recorrido del módulo | Unitarias de queries, controllers y utilidades; ampliar integración según reporte modificado. |
| `RN-008`, `RD-005` y políticas de trazabilidad | Sin responsabilidad de seguridad; sólo origina request | `auditWrites`, `auditService`, `CriticalWriteAudit` | ER `DIA-GEN-ER-001`; pipeline `DIA-API-SEQ-001` | No hay suite dedicada; probar sanitizado, escrituras exitosas/fallidas y política best effort. |

## Obligación al cambiar una capacidad

1. partir del identificador normativo y confirmar su `CU-*` y actor;
2. contrastar nombre, disparador, precondiciones, flujo principal, alternativas, excepciones y
   postcondiciones en la [ficha normativa](../requirements/use-case-descriptions.md), y actualizarla
   cuando cambie cualquiera de esos elementos;
3. revisar el [procedimiento del manual](../user-manual/procedures.md#casos-por-grupo-funcional):
   debe conservar el mismo identificador y nombre, describir los controles observables y no
   atribuir una pantalla de consulta a un caso que exige una escritura;
4. actualizar la ficha frontend si cambian interacción, payload o endpoint;
5. actualizar contrato y ficha backend si cambian middleware, DTO, regla o transacción;
6. conservar el nombre normativo junto al `CU-*` en los encabezados de las secuencias frontend y
   backend; el identificador permite comparar cobertura y el nombre hace explícito el objetivo;
7. regenerar ER/mapa si cambian Prisma, rutas o imports;
8. elegir la vista dinámica desde las matrices; si representa un caso, debe identificar
   un único `CU-*` y sus participantes concretos;
9. registrar prueba unitaria para la regla aislada y de integración para contrato,
   persistencia o rollback; actualizar la fila si se cierra una brecha.
