# Diseño de pruebas: Movimientos

La [guía de diseño](../02-test-design.md) define las tablas DP y sus relaciones con los casos. Esta ficha agrupa condiciones del mismo dominio o contrato.

## Movimientos: diseño de comprobación

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-MOV-001` | CU-ALM-07, 15, 23; historial separado e identidad correcta | Unitario/navegador; particiones por recurso, tipo y contrato | Cada vista consulta su endpoint; materiales usan ID del material y merma su ID; conserva fecha, diez columnas, signo, cero y saldos nulos; una cantidad incompleta se rechaza. | [movementServiceTest.ts](../../../tests/unit/modules/movements/movementServiceTest.ts); [movements.spec.ts](../../../tests/e2e/movements.spec.ts) |
| `DP-VUE-MOV-002` | RF-REP-001; proveedor primero y filtros | Unitario/navegador; transiciones y fronteras de fechas | Sin proveedor no consulta recursos; al cambiar limpia selección y descarta respuesta tardía. Buscar aplica borrador y reinicia página; limpiar restaura filtros; fechas iguales y bisiestas válidas, inversión y fechas inexistentes rechazadas. | [movementServiceTest.ts](../../../tests/unit/modules/movements/movementServiceTest.ts); [movements.spec.ts](../../../tests/e2e/movements.spec.ts) |
| `DP-VUE-MOV-003` | CU-ALM-08, 16, 24; alcance de exportación | Adaptador/navegador; decisiones por modo y fronteras de mes | Mes actual/específico omiten filtros; personalizado usa filtros aplicados, excluye paginación y borrador. Mes inválido no solicita archivo ni muestra error al abrir. Descarga reutiliza validación MIME compartida. | [movementServiceTest.ts](../../../tests/unit/modules/movements/movementServiceTest.ts); [movements.spec.ts](../../../tests/e2e/movements.spec.ts) |
| `DP-VUE-MOV-004` | Acceso y navegación Vue | Navegador/composable; particiones por permisos y viewport | Cuenta exclusiva entra al historial, sin permiso se bloquea antes de API; faltando lectura auxiliar no pide opciones, faltando reportes oculta exportar; menú Vue, recarga y 320/390 px sin desbordamiento global. | [movementServiceTest.ts](../../../tests/unit/modules/movements/movementServiceTest.ts); [movements.spec.ts](../../../tests/e2e/movements.spec.ts) |

Especificación: `tests/unit/modules/movements/`, `tests/e2e/movements.spec.ts` y sus
fixtures. `inventoryListTest.ts` comprueba pausa, foco y carga
visible de la recarga compartida; la suite de Almacén comprueba su consumidor.
La API simulada comprueba la integración del cliente, no la persistencia, autorización
real ni contenido del Excel del servidor. Las brechas de integración de mermas
se mantienen en la matriz del backend.
