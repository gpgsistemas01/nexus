# 5. Plan de pruebas del frontend Vue

## Objetivo y alcance

Este plan define la estrategia del cliente: rutas, captura, estado reactivo, contratos, selección, errores, interacción, descargas y compilación. Es suficiente para decidir dónde ubicar y cómo diseñar una prueba Vue sin abrir el plan de Express. Los requisitos están en la [especificación local](../requirements/02-client-specification.md) y los recorridos en las fichas `CU-VUE-*`.

La fuente ejecutable son `front/tests`, sus fixtures y aserciones. El [diseño](01-test-design.md) conserva riesgos/condiciones; el [registro](02-test-cases.md) añade fichas selectivas para casos críticos. Este plan adopta conceptos de 29119-2/-3/-4 sin declarar conformidad integral ni un porcentaje mínimo de cobertura.

## Niveles y entornos

| Nivel | Herramienta y ubicación | Oráculo y límite |
| --- | --- | --- |
| Funciones y composables | Vitest, Vue Test Utils y jsdom; `tests/unit`. | Valores, payload, error, transición, cancelación y aislamiento. DOM simulado no demuestra comportamiento de Chromium. |
| Transporte del cliente | Adaptador HTTP de prueba dentro de unitarias. | Ruta/método/parámetros, normalización y respuesta esperada. No es una petición a Express/Prisma reales. |
| Navegador con API simulada | Playwright/Chromium; `tests/e2e`. | Interacción con Vue/Vuetify reales, rutas, formulario, teclado, móvil y requests. El mock no demuestra autorización o stock reales. |
| Sistema | Playwright; `tests/system`, Vue, Express y PostgreSQL aislado. | Cookie/login/refresh/cierre reales, alta persistida de cliente y reportes XLSX representativos. No cubre automáticamente todos los estados o transacciones. |
| Comprobación estática/documental | ESLint, Prettier, vue-tsc, Vite y `docs:check`. | Contratos de tipos, fronteras configuradas, compilación, referencia generada y enlaces. No sustituye una prueba funcional. |

`test:e2e` inicia Vite en 5173 y puede reutilizar un servidor de desarrollo permitido por su configuración. Sistema usa procesos propios en 5175/3107 y una base dedicada. La [preparación del sistema](04-system-tests.md) comprueba URLs y limpieza antes de iniciar. Nunca se usa la base habitual de desarrollo como base de prueba.

## Selección por riesgo y técnicas

| Riesgo | Diseño adecuado y representante |
| --- | --- |
| Cambiar de recurso/operación con payload incorrecto | Particiones por recurso y modo; Materiales/Consumibles/Mermas, alta/edición/consulta/ajuste. |
| Cantidades, pesos, saldo y longitudes | Fronteras y clases válidas/inválidas. Conservar prueba independiente de regla pura y payload cuando observan contratos distintos. |
| Recuperación o doble escritura | Transiciones pendiente → incierto → reintento/confirmación, mismo `operationId`, cancelación sin efecto y callbacks tras desmontar. |
| Acceso | Decisiones por lectura/escritura/auxiliares, ruta directa y rechazos 401/403. Un botón oculto no basta como evidencia de servidor. |
| Selectores y datos tardíos | Búsqueda → página → error/reintento, dependencia de proveedor y selección fuera de página; precarga/limpieza por ID. |
| UX y estilo funcional | Modal inicial sin errores, foco/teclado, ancho móvil, títulos/columnas y acciones disponibles. No fijar estilos internos como contrato de arquitectura. |
| Documentación generada | SFC/TypeScript reales, contratos tipados, imports, orden determinista y detección de un archivo generado desactualizado. |

`it.each`, mocks y concurrencia son mecanismos de automatización, no técnicas de diseño. Matrices extensas quedan en el nivel más pequeño que las demuestra; navegador representa consumidores y transiciones importantes sin copiar toda la matriz.

## Preparación y datos

Unitarias reutilizan fixtures de dominio y harnesses (`mountComposable`, adaptador HTTP). Cada caso restaura mocks, timers y montajes mediante el setup vigente; un composable crea estado por instancia. El Storage de jsdom se enlaza explícitamente para evitar diferencias con el Storage nativo de Node.

Navegador reutiliza las funciones `mockWarehouse`, `mockPurchases`, `mockIssues` y las fixtures del módulo. Los errores 401/403/409/503 se preparan como datos del caso; no se considera que un mock de éxito confirme una transacción de la API.

Sistema genera identificadores y cuentas de prueba, aplica migraciones a una base dedicada y elimina sólo sus filas/manifiesto según el setup. Sus credenciales no se copian a documentación ni se usa una cuenta personal. Si no existe ese ambiente, se registra el bloqueo en lugar de atribuir resultados reales a la suite simulada.

## Diseño, caso y ejecución

| Registro | Contenido mínimo |
| --- | --- |
| DP | Requisito o riesgo, condición observable, nivel, técnica y oráculo. |
| CP/caso ejecutable | Precondiciones, fixture/datos exactos, acción, resultado esperado y limpieza. Las fichas permanentes se reservan a contratos críticos. |
| EP | Commit/estado local, entorno, fecha, comando, resultado real, conteos y fallos/bloqueos. Se conserva en CI o revisión, no como aprobación perpetua de la ficha. |

CRUD se cubre según lo implementado: alta, lectura y edición; eliminación o baja lógica sólo donde existe. En operaciones críticas se comprueba también ausencia de requests/efectos al cancelar o rechazar. No se escriben pruebas que sólo repitan la implementación o delegaciones triviales.

## Ejecución

Desde `front/`:

```bash
npm run test:unit
npm run check
npm run docs:check
npx playwright install chromium
npm run test:e2e
```

`npm run check` ejecuta formato, lint, unitarias y build con tipos. La instalación de Chromium es preparación del equipo, no un paso obligatorio de cada corrida. Con un navegador instalado puede usarse `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`; CI prepara su navegador.

Para sistema, después de seguir su guía y disponer de la base aislada:

```bash
npm run test:e2e:system
```

Desde la raíz usar `npm --prefix front run ...`. Para seleccionar un caso se pasa archivo y `--grep` a Playwright, o el archivo a Vitest. No se usa watch en comprobaciones no interactivas.

## Criterios de revisión y finalización

Los casos pertinentes pasan en el ambiente declarado y conservan sus aserciones. Tipos, lint/formato, build y documentación deben corresponder al cambio. Un fallo se investiga; no se retira una aserción para convertirlo en aprobado. Una prueba retirada requiere regla obsoleta, duplicidad demostrada o límite aceptado, indicando qué cobertura permanece.

CI ejecuta Node 24.15.0 y 26.12.1 para frontend, publica JUnit en `build/test-results` y conserva sistema como ejecución separada. Las capturas y trazas fallidas son artefactos, no fuentes del producto. No se amplía repetidamente una suite ya aprobada sin cambio, fallo o preocupación nueva.

No se deduce cobertura total de conteos aprobados ni rendimiento de producción por el tiempo de la suite. Las brechas funcionales/de evidencia permanecen en la [matriz local](03-use-case-coverage.md).
