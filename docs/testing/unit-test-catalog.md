# Catálogo de pruebas unitarias

## Suite

| Campo | `SU-UNIT-001` — Suite unitaria de Nexus |
| --- | --- |
| Objetivo | Detectar regresiones en reglas, transformaciones, autorización, contratos entre capas y efectos aislables de infraestructura real. |
| Comando | `npm run test:unit` |
| Configuración | `vitestConfig.js`: incluye `tests/**/*Test.js` y excluye `tests/integration/**`. |
| Ambiente | Node.js `>=22 <25`, Vitest `4.1.9`, ambiente `node`; no requiere navegador, PostgreSQL ni servicios externos. |
| Preparación y limpieza | Fixtures y dobles locales; cada archivo restaura sus mocks o variables globales mediante sus hooks. |
| Criterio de aprobación | Todos los archivos y casos descubiertos terminan aprobados, sin errores del runner. |
| Resultado | La ejecución de CI asociada al commit conserva conteos, duración y estado. |
| Fuera de alcance | Persistencia real, migraciones, integración HTTP con servicios reales y renderizado en navegador. |

## Técnicas aplicadas

| Técnica | Grupos | Datos o condición | Resultado observado |
| --- | --- | --- | --- |
| Partición de equivalencia | `G01`, `G03`, `G05`, `G09` | Entradas válidas, inválidas, ausentes, roles, departamentos y estados. | Valor normalizado, decisión de acceso o error esperado. |
| Valores frontera | `G02`, `G04`, `G08`, `G09` | Cero, negativos, máximos, precisión decimal, fechas, páginas y colecciones vacías. | Aceptación exacta del límite o rechazo sin efectos posteriores. |
| Tablas de decisión | `G01`, `G05`, `G09` | Combinaciones materializadas con `it.each`. | Resultado definido para cada combinación. |
| Transiciones y atomicidad | `G02`, `G04`, `G07` | Estado documental, existencia, duplicidad y callbacks transaccionales. | Transición admitida o rechazo/rollback sin resultado parcial. |
| Interacción y fallos | `G02`, `G06`, `G07`, `G10` | Servicios, middleware, Prisma y herramientas sustituidos por dobles. | Argumentos, retorno, error y ausencia de colaboradores posteriores. |

Los datos concretos, precondiciones, acciones y resultados esperados de cada caso están
en sus bloques `describe`/`it` o filas de `it.each`. Los grupos siguientes son los
diseños `DP-UNIT-GNN`; sus casos ejecutables corresponden a `CP-UNIT-GNN-*`.

## Grupos y archivos vigentes

| Diseño / unidad | Archivos | Cobertura |
| --- | --- | --- |
| `DP-UNIT-G01` Permisos | `tests/unit/constants/permissionsTest.js` (1) | Acceso permitido y denegado por rol, departamento y operación. |
| `DP-UNIT-G02` Controllers de almacén | `tests/unit/controllers/api/warehouse/*Test.js` (8) | Entradas, salidas, materiales, mermas y reportes; DTO, respuestas, límites, fallos y eventos posteriores. |
| `DP-UNIT-G03` DTO | `tests/unit/dtos/*Test.js` (3) | Normalización de entradas, materiales y mermas; opcionales, identidades, partidas y decimales. |
| `DP-UNIT-G04` Inventario y transacción | `tests/unit/helpers/rollbackTransactionTest.js`, `tests/unit/inventory/*Test.js`, `tests/unit/warehouse/goodsReceiptHelpersTest.js` (4) | Commit/rollback, movimientos, existencias y detalles de compra. |
| `DP-UNIT-G05` Validación cliente | `tests/unit/public/js/utils/**/*Test.js` (4) | Colecciones de detalles y validaciones de entradas, materiales y mermas. |
| `DP-UNIT-G06` Rutas | `tests/unit/routes/**/*Test.js` (6) | Orden de middleware, autorización y enlace de controllers en rutas API y web. |
| `DP-UNIT-G07` Servicios | `tests/unit/services/**/*Test.js` (12) | Catálogos, identidad, movimientos, entradas, salidas, relaciones proveedor-material, reportes y mermas. |
| `DP-UNIT-G08` Utilidades de servidor | `tests/unit/utils/*Test.js` (5) | Fechas, filtros, paginación, reportes Excel y contratos de inventario. |
| `DP-UNIT-G09` Validadores de servidor | `tests/unit/validators/*Test.js` (6) | Catálogos, precisión decimal, detalles de compra, devoluciones, materiales y campos obligatorios. |
| `DP-UNIT-G10` Scripts documentales | `tests/unit/scripts/*Test.js` (11) | Exportación, imágenes, Mermaid, PDF y capturas del manual. |

**Total vigente:** 60 archivos. El número de casos y su estado se obtiene de la ejecución
de Vitest porque las tablas `it.each` materializan casos dinámicamente.
