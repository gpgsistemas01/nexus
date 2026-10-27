# Pruebas del frontend Vue

Esta colección documenta diseño, casos críticos y evidencia funcional del cliente.
Aplica el [plan propio de Vue](01-test-plan.md), que adapta 29119-2, -3 y -4 sin
declarar conformidad. Los [requisitos y casos de uso locales](../requirements/index.md)
contienen su especificación y flujos completos.

## Orden de lectura

1. [Plan de pruebas](01-test-plan.md): alcance, riesgos, niveles, técnicas y criterios de ejecución.
2. [Diseño y trazabilidad](02-test-design.md): condiciones DP y evidencia asociada, agrupadas en [diseños por ámbito](design/index.md).
3. [Registro de casos](03-test-cases.md): datos, pasos, resultado esperado y limpieza de las fichas CP.
4. [Cobertura por caso de uso](04-use-case-coverage.md): objetivos representados y límites de evidencia.
5. [Preparación de sistema](05-system-tests.md): ambiente aislado, ejecución y limpieza con API/base reales.

El resultado de una corrida se conserva como EP en CI o revisión. El plan precede
al diseño; el caso concreta sus datos; la cobertura relaciona esa evidencia con los
objetivos funcionales. La preparación de sistema se consulta al ejecutar ese nivel.

## Niveles y oráculos

| Evidencia | Qué comprueba | Límite |
| --- | --- | --- |
| Vitest/Vue Test Utils/jsdom | Reglas, composables, estado, contratos y datos enviados. | No ejecuta un navegador ni Prisma real. |
| Playwright/Chromium con API simulada | Interacción, rutas, formularios, cookies del navegador y solicitudes observadas. | El servidor simulado no acredita autorización, cálculo persistido ni rollback reales. |
| Playwright contra Vue, Express y PostgreSQL reales | Login, alta y lectura persistida de cliente, reportes reales de usuarios/clientes/proveedores, refresh y cierre mediante los routers de la aplicación. | Un recorrido representativo no demuestra todos los CU, roles ni transacciones de inventario. |
| Integraciones de `back/tests` | HTTP, reglas del servidor y persistencia según cada harness. | Revisar sus límites; un harness sin middleware no demuestra autorización de la ruta de producción. |

Las fichas selectivas complementan el código; no transcriben cada `it`. Los IDs
anteriores de diseño se conservan. Las condiciones con resultados independientes
se especifican en subcasos separados, aunque compartan una prueba ejecutable.

## Ejecución y resultado

Desde la raíz: `npm --prefix front run test:unit` para unitarias. La preparación y
ejecución de Playwright se mantienen en [README](../../README.md#pruebas-de-navegador);
su configuración fija Chromium, un worker y el servidor Vite local.
`npm --prefix front run test:e2e:system` es independiente: requiere la base aislada,
migraciones y dependencias de ambas aplicaciones según [la preparación](05-system-tests.md).

Para cada revisión se registra en CI o en la solicitud de cambio el comando, commit
o estado local identificado, Node/herramientas, navegador cuando corresponda, fecha,
resultado real, conteos y fallos/bloqueos. Los reportes viven en
`front/build/test-results`; no se versiona una tabla de aprobaciones por cada corrida.
Una prueba que pasa no convierte una brecha funcional en un requisito aceptado.
