# CP-VUE-QTY-001-01 — cantidades enteras de PIEZA

## Diseño y trazabilidad

`RF-VUE-006/007/009/010`; `DP-VUE-QTY-001`. Particiones entero/fracción y
presentación PIEZA/ROLLO. El resultado se observa en la captura y en las solicitudes.

| Caso | Precondiciones y datos | Acción | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- |
| `CP-VUE-QTY-001-01` | Compra COM-001 con una partida PIEZA de cantidad 2; API simulada y permiso de gestión. Cantidad correcta 1.5 y después 1; costo 1.25. | Abrir corrección, enviar 1.5, corregir a 1 y confirmar. | La fracción permanece visible con error; no hay request ni confirmación. El entero envía `{quantity: 1, costPerUnitType: 1.25}` una vez y vuelve al documento actualizado. | Contexto de Playwright descartado; sin base de datos. |

[purchases.spec.ts](../../../tests/e2e/purchases.spec.ts) comprueba ese recorrido.
Las unitarias de Compras, Salidas e Inventario amplían recursos y campos;
[issues.spec.ts](../../../tests/e2e/issues.spec.ts) representa la devolución en los
tres recursos. El rechazo HTTP y la ausencia de efectos parciales se comprueban en
`CP-INT-QTY-001` del [backend](../../../../back/docs/testing/automated-test-case-index.md).
