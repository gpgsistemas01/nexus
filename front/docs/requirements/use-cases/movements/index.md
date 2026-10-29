# Movimientos e informes de historial: casos de uso

Cada ficha describe un objetivo completo con actor, disparador, precondiciones, pasos, alternativas, excepciones y postcondiciones. Los identificadores de negocio se mantienen dentro de esta familia funcional. La [plantilla de casos](../index.md) define la estructura común.

| Caso | Objetivo |
| --- | --- |
| [CU-ALM-07](cu-alm-07.md) | Consultar movimientos de materiales. |
| [CU-ALM-08](cu-alm-08.md) | Generar reporte de movimientos de materiales. |
| [CU-ALM-15](cu-alm-15.md) | Consultar movimientos de mermas. |
| [CU-ALM-16](cu-alm-16.md) | Generar reporte de movimientos de mermas. |
| [CU-ALM-23](cu-alm-23.md) | Consultar movimientos de consumibles. |
| [CU-ALM-24](cu-alm-24.md) | Generar reporte de movimientos de consumibles. |

## Realización y verificación del cliente

La [guía de realización Vue](../../../architecture/views/development/frontend-technical-documentation/02-warehouse.md) describe captura, permisos de interfaz, contratos y propietarios del estado de esta familia. Las pruebas de navegador de esta familia están en `warehouse.spec.ts, catalogs.spec.ts, records.spec.ts y movements.spec.ts`.
