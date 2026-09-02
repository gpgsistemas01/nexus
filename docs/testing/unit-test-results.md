# Resultados de pruebas unitarias

## Propósito

Este registro conserva el resultado real de las ejecuciones unitarias que respaldan una
entrega. Complementa el código de `tests/unit` y la salida temporal de Vitest: no sustituye
las aserciones, el registro de CI ni las pruebas de integración.

El ambiente, las suites incluidas y las técnicas usadas para sus casos se documentan en
el [catálogo de pruebas unitarias](unit-test-catalog.md).

Cada ejecución documentada debe indicar fecha, revisión evaluada, comando, ambiente,
resultado y observaciones. Los conteos sólo describen esa revisión y no se presentan como
la cobertura de versiones posteriores.

## Última ejecución verificada

| Campo | Evidencia |
| --- | --- |
| Fecha (UTC) | 2026-09-02 |
| Revisión evaluada | `a36a483d` (código ejecutable sin cambios en la actualización documental posterior) |
| Suite ejecutada | `SU-UNIT-001` — Suite unitaria de Nexus, definida en `unit-test-catalog.md` |
| Comando | `npm run test:unit` |
| Ambiente | Linux; Node.js `v20.20.2`; Vitest `v4.1.9` |
| Resultado | **Aprobado**: 70 archivos y 280 pruebas aprobadas; 0 fallidas |
| Duración informada por Vitest | 21.92 s |
| Alcance | Archivos `tests/**/*Test.js`, excluyendo `tests/integration/**`, según `vitestConfig.js` |
| Observaciones | La ejecución mostró la advertencia de npm sobre la configuración de entorno `http-proxy`. Además, Node.js `v20.20.2` no corresponde al rango `>=22 <25` declarado por el proyecto; aunque la suite finalizó correctamente, debe repetirse con una versión admitida en CI o antes de la entrega. |

## Criterio de actualización

Se reemplaza la sección **Última ejecución verificada** al ejecutar la suite para una
nueva entrega. No se copia el detalle de cada caso: se conserva el resumen reproducible y
se enlaza la salida de CI en la solicitud de cambio cuando esté disponible. Un resultado
fallido o bloqueado se registra con ese estado y su causa; no se reutiliza un resultado
anterior para declarar aprobada una revisión distinta.
