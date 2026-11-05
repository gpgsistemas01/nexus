# 5. Relación entre requisitos y casos de uso

Cada caso de uso indica sus requisitos y las reglas que afectan sus pasos. Un
requisito compartido puede apoyar varios casos sin crear un objetivo nuevo.
El [mapa por capacidad](../01-applicability-and-traceability.md) enlaza las familias,
sus manuales y diagramas.

## Reglas comunes

| Casos a los que aplican | Reglas |
| --- | --- |
| Operaciones protegidas | `RN-001` y `RN-009`: sesión y permiso. El login `CU-AUT-01` comprueba credenciales según `RF-AUT-001`; el cierre `CU-AUT-02` exige sesión. |
| Crear, editar, retirar, ajustar, corregir, cancelar, surtir, devolver o cambiar credenciales | `RN-010`: validación antes de persistir. |
| Encabezado y detalles de `CU-SAL-02/03/04`, `CU-SAL-09/10/11` y `CU-SAL-16/17/18` | `RN-019` y `RN-035`: asesor y proyecto del cliente interno. |
| Escrituras configuradas para auditoría | `RN-008`: registro del actor, la operación y los datos admitidos. |
| Operaciones que generan movimientos | `RN-002`, `RN-011` y `RN-013`: confirmación sin cambios parciales, origen y cantidades. |

## Requisitos compartidos por varios recorridos

| Requisitos | Casos relacionados |
| --- | --- |
| `RF-AUT-002` | Renovación de sesión durante cualquier operación protegida. |
| `RF-IAM-003` | `CU-IDA-06/07`: áreas y roles de las cuentas. |
| `RF-CAT-005`, `RF-CAT-019` a `RF-CAT-021` | Selectores de las altas y ediciones; mantenimiento en `CU-CAT-09` a `CU-CAT-26`. |
| `RF-REC-006` | `CU-ALM-02`, `CU-ENT-02`: una marca que distingue físicamente el material se registra como otra identidad de catálogo antes de recibirlo. |
| `RF-REC-009` | `CU-ENT-02/08`: folios de compra separados por contexto. |
| `RF-REC-010` | `CU-ENT-06/12`: contexto, archivo y hoja del reporte de compras. |
| `RF-REC-011` | `CU-ENT-01` a `CU-ENT-12`: documentos y detalles del mismo contexto. |
| `RF-ISS-007/008` | `CU-SAL-02/16`: folios confirmados del contexto de salida. La normalización de series históricas conserva año, consecutivo e identidad; no constituye una acción de pantalla. |
| `RF-WST-001` y `RF-WST-007` | `CU-ALM-09`: inventario de merma; `CU-SAL-08`: documentos de salida de merma. |
| `RF-REP-003/006/007/009/012` | `CU-ALM-14`: reporte de mermas, pesos y aviso por datos faltantes. |
| `RF-REP-011` | `CU-ALM-07/08/15/16/23/24`: movimientos y reportes por recurso. |
| `RF-MER-011` | `CU-ALM-10/11`: captura y consulta del peso unitario de Rollo, conservado al editar y mover stock. |
| `RF-MER-010/012/013` | `CU-ALM-13`: entrada trazable de merma; `CU-ALM-10`: muestra del rollo completo, pesos y dimensiones calculadas. |
| `RF-MER-001` a `RF-MER-009` | `CU-ALM-10` a `CU-ALM-12`; cantidades convertidas en `CU-SAL-12/13`. |
| `RF-ADJ-001/002` | `CU-ALM-05/12/21`: ajustes de material, merma y consumible. |
| `RF-REQ-001`, `RF-PRJ-001/002` | Sin caso vigente mientras permanezcan excluidos o modelados. |

## Equivalencias de requisitos

Los pares `RF-CAT-004` / `RF-WST-001`, `RF-CAT-016` / `RF-MER-005` y
`RF-CAT-017` / `RF-MER-003` conservan IDs históricos para la misma consulta,
restricción o edición de merma. No representan operaciones adicionales.

## Comprobación

Los requisitos `RF/RD/RN/RC-VUE-*` se definen en la
[especificación del cliente](client-specification.md). La
[cobertura de pruebas](../../testing/04-use-case-coverage.md) reúne sus
comprobaciones y las de cada caso de uso.
