# 2. Diseño y contratos de pruebas Vue

Estos diseños selectivos conservan los IDs `DP-*` y grupos `CP-*` existentes.
No equivalen a fichas completas de cada caso automatizado. Las
[fichas críticas](03-test-cases.md) añaden estado inicial, datos, pasos, resultado
y limpieza; la [cobertura por caso de uso](04-use-case-coverage.md) distingue
regla del cliente, persistencia y brechas. El [plan propio del frontend](01-test-plan.md) define alcance, niveles, técnicas,
preparación, criterios y evidencia. La [especificación local](../requirements/requirements-specification/client-specification.md)
y las fichas `CU-*` contienen las obligaciones observables del cliente.

## Diseños por dominio y contrato

- [Acceso, sesión y navegación](design/01-access.md).
- [Inventario y captura de merma](design/02-inventory.md).
- [Catálogos, identidad y directorio](design/03-records.md).
- [Movimientos](design/04-movements.md).
- [Compras](design/05-purchases.md).
- [Salidas](design/06-issues.md).
- [Contratos y componentes transversales](design/07-shared.md).
- [Recuperación y recorrido de sistema](design/08-system.md).

## Fichas selectivas vinculadas

| Diseño existente | Ficha que concreta datos, pasos y oráculo |
| --- | --- |
| `DP-VUE-AUTH-002` | [CP-VUE-AUT-001](cases/cp-vue-aut-001.md). |
| `DP-VUE-SESSION-001` | [CP-VUE-SESSION-001-01](cases/cp-vue-session-001-01.md). |
| `DP-VUE-SESSION-002` | [CP-VUE-SESSION-002-01](cases/cp-vue-session-002-01.md). |
| `DP-VUE-CAT-002` | [CP-VUE-CAT-002-01](cases/cp-vue-cat-002-01.md). |
| `DP-VUE-COM-003` | [CP-VUE-COM-003-01](cases/cp-vue-com-003-01.md). |
| `DP-VUE-ISS-002` | [Surtido](cases/cp-vue-iss-002-01.md), [devolución por interfaz](cases/cp-vue-iss-002-02.md) y [frontera/reintento unitario](cases/cp-vue-iss-002-03.md). |

Las demás condiciones conservan sus casos ejecutables y los grupos documentados
en cada ámbito; no se declara completa la ficha documental de cada variante existente.
