# 2. Diseño y contratos de pruebas Vue

Cada diseño `DP-*` identifica un riesgo, la condición que se probará, el nivel y la
técnica elegidos. Enlaza sus casos `CP-*` o las pruebas ejecutables que los cubren.
El [plan](01-test-plan.md#1-diseño-y-trazabilidad) define el formato.

## Diseños por dominio y contrato

- [Acceso, sesión y navegación](design/01-access.md).
- [Inventario y captura de merma](design/02-inventory.md).
- [Catálogos, identidad y directorio](design/03-records.md).
- [Movimientos](design/04-movements.md).
- [Compras](design/05-purchases.md).
- [Salidas](design/06-issues.md).
- [Contratos y componentes transversales](design/07-shared.md).
- [Recuperación y recorrido de sistema](design/08-system.md).

El [registro de casos](03-test-cases.md#fichas) reúne las fichas detalladas y su
diseño asociado. La [cobertura por caso de uso](04-use-case-coverage.md) permite
consultar qué recorridos tienen evidencia y cuáles conservan brechas.

Para KILOGRAMOS/METRO LINEAL, `purchaseTest.ts` e `issueTest.ts` verifican captura de `0.75`, conversión `1 × 1` y costo total automático para esas presentaciones con medidas `1 × 1`. El recorrido de costo total de `purchases.spec.ts` comprueba captura fraccionaria, importes y payload; las integraciones de API comprueban stock real de compras y entregas parciales (`CP-INT-QTY-002`).
