# Pruebas del frontend Vue

Esta colección documenta diseño, casos críticos y evidencia funcional del cliente.
Aplica el [plan propio de Vue](05-test-plan.md), que adapta 29119-2, -3 y -4 sin
declarar conformidad. Los [requisitos y casos de uso locales](../requirements/index.md)
contienen su especificación y flujos completos.

## Capítulos

1. [Diseño y contratos de pruebas Vue](01-test-design.md).
2. [Registro selectivo de casos de prueba Vue](02-test-cases.md).
3. [Cobertura Vue por caso de uso y brechas](03-use-case-coverage.md).
4. [Preparar y ejecutar pruebas de sistema](04-system-tests.md).
5. [Plan de pruebas del frontend Vue](05-test-plan.md).

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
migraciones y dependencias de ambas aplicaciones según [la preparación](04-system-tests.md).

Para cada revisión se registra en CI o en la solicitud de cambio el comando, commit
o estado local identificado, Node/herramientas, navegador cuando corresponda, fecha,
resultado real, conteos y fallos/bloqueos. Los reportes viven en
`front/build/test-results`; no se versiona una tabla de aprobaciones por cada corrida.
Una prueba que pasa no convierte una brecha funcional en un requisito aceptado.
