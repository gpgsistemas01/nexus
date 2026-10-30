# Diseño de pruebas: Compras

## Pruebas de Compras

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-COM-001` | RF-VUE-009, RD-VUE-007 y RD-009; compra y detalles | Particiones de contexto y formato, fronteras numéricas, transiciones de captura/consulta | `purchaseTest.ts`: distingue material/consumible, rechaza documentos incompletos y fechas imposibles, conserva hora de México/proveedor/observaciones, omite detalles existentes y valores derivados; agregar exige al menos 1 y corregir admite cantidades positivas menores que 1. Cambiar proveedor limpia detalles y receptor; cerrar invalida lecturas tardías. | [purchaseTest.ts](../../../tests/unit/modules/purchases/purchaseTest.ts) |
| `DP-VUE-COM-002` | RF-VUE-009; compra y detalles | Transiciones de documento y decisiones de permisos/confirmación | `purchases.spec.ts`: alta en ambas variantes, edición incremental, consulta/corrección/cancelación explícita, filtros y reporte aplicados, acceso y móvil en Chromium con HTTP simulado. No demuestra persistencia ni autorización del servidor. | [purchases.spec.ts](../../../tests/e2e/purchases.spec.ts) |

El cambio de lectura de observaciones se cubre en la integración HTTP/Prisma
`back/tests/integration/controllers/goodsReceiptContextDbTest.js`: nulo o texto
en listado y por ID, conservación después de editar y omisión de detalles en listado,
en ambas variantes.

## Respuestas confirmadas y corrección de compras

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-MSG-001` | RD-VUE-007; código ausente o de otra operación tratado como éxito | Unitario; particiones de respuesta | `recordContractTest.ts` rechaza código omitido, genérico o de otra operación; conserva el código recibido y traduce el texto del catálogo público sin usar un mensaje HTML ajeno. | [recordContractTest.ts](../../../tests/unit/shared/http/recordContractTest.ts) |
| `DP-VUE-COM-003` | RF-VUE-009; compra y detalles | Corrección sin confirmar, pérdida de captura o totales incompletos; transiciones y particiones | `purchaseTest.ts` cubre sin cambios, cancelación, confirmación, cantidades positivas y resumen sin detalles cancelados. `purchases.spec.ts` comprueba estimación visible, cancelar sin request y confirmar una sola escritura. | [CP-VUE-COM-003-01](../cases/cp-vue-com-003-01.md) |
| `DP-VUE-REP-001` | Reporte inválido o denegado y cierre silencioso tras un error | Unitario; decisiones por alcance y permiso | `reportScopeTest.ts` valida mes antes del request, impide exportar sin permiso y conserva el diálogo tras un fallo. Compras y Movimientos conservan recorridos de descarga en navegador. | [reportScopeTest.ts](../../../tests/unit/shared/composables/reportScopeTest.ts) |

`successCodeMessages` es el catálogo público de códigos de confirmación. Los
adaptadores comparan el código recibido con el correspondiente a su operación.
Las pruebas comprueban que un código distinto no se interprete como éxito.
