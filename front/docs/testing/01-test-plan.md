# 1. Plan de pruebas del frontend Vue

## Control documental

Estado: En revisión. Responsable: Equipo Nexus. Versión de la colección: [entrada documental](../index.md).

Los comandos y las rutas de esta guía son relativos a `front/`.

## Objetivo y alcance

Este plan define la estrategia del cliente: rutas, captura, estado reactivo, contratos, selección, errores, interacción, descargas y compilación. Es suficiente para decidir dónde ubicar y cómo diseñar una prueba Vue sin abrir el plan de Express. Los requisitos están en la [especificación local](../requirements/requirements-specification/client-specification.md) y los recorridos en las fichas `CU-*`.

La fuente ejecutable son `front/tests`, sus fixtures y aserciones. El [diseño](02-test-design.md) conserva riesgos/condiciones; el [registro](03-test-cases.md) añade fichas selectivas para casos críticos. Este plan adopta conceptos de 29119-2/-3/-4 sin declarar conformidad integral ni un porcentaje mínimo de cobertura.

## Niveles y entornos

| Nivel | Herramienta y ubicación | Oráculo y límite |
| --- | --- | --- |
| Funciones y composables | Vitest, Vue Test Utils y jsdom; `tests/unit`. | Valores, payload, error, transición, cancelación y aislamiento. DOM simulado no demuestra comportamiento de Chromium. |
| Transporte del cliente | Adaptador HTTP de prueba dentro de unitarias. | Ruta/método/parámetros, normalización y respuesta esperada. No es una petición a Express/Prisma reales. |
| Navegador con API simulada | Playwright/Chromium; `tests/e2e`. | Interacción con Vue/Vuetify reales, rutas, formulario, teclado, móvil y requests. El mock no demuestra autorización o stock reales. |
| Sistema | Playwright; `tests/system`, Vue, Express y PostgreSQL aislado. | Cookie/login/refresh/cierre reales, alta persistida de cliente y reportes XLSX representativos. No cubre automáticamente todos los estados o transacciones. |
| Comprobación estática/documental | ESLint, Prettier, vue-tsc, Vite y `docs:check`. | Contratos de tipos, fronteras configuradas, compilación, referencia generada y enlaces. No sustituye una prueba funcional. |

`test:e2e` inicia Vite en 5173 y puede reutilizar un servidor de desarrollo permitido por su configuración. Sistema usa procesos propios en 5175/3107 y una base dedicada. La [preparación del sistema](05-system-tests.md) comprueba URLs y limpieza antes de iniciar. Nunca se usa la base habitual de desarrollo como base de prueba.

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

## Forma de documentar diseño, casos y ejecución

El diseño identifica la condición; el caso establece datos y resultado esperado;
la ejecución registra qué ocurrió. En pruebas automatizadas, archivo, fixtures y
títulos describen la especificación ejecutable. El registro selectivo añade una
identidad estable a condiciones críticas sin copiar toda la suite.

### 1. Diseño y trazabilidad

Esta tabla identifica **qué se necesita probar** antes de enumerar datos. Una fila puede
representar una condición de cobertura o un grupo homogéneo de casos, pero no debe mezclar
resultados independientes.

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-<DOM>-NNN` | `RF-*`, `RN-*`, `CU-*` o riesgo identificado | Unitario, integración, sistema o aceptación; técnica elegida | Particiones y representantes, fronteras, combinaciones factibles o transiciones y su oráculo | `CP-*` o ruta/grupo automatizado |

El esquema SQL es un objeto de prueba y manual/automatizada es una forma de ejecución;
ninguno constituye por sí mismo un nivel. Un diseño puede repartir condiciones entre
niveles si cada uno aporta evidencia diferente.

### 2. Especificación del caso y datos

Cada caso que requiere ficha documental registra al menos los datos de entrada y el
resultado esperado que permiten
decidir objetivamente si pasa. En operaciones de escritura, los datos de prueba deben
identificar los valores que se intentan registrar y el resultado esperado debe indicar
tanto la respuesta que devuelve el sistema como los datos que deben quedar persistidos
o la ausencia de escritura. No basta con anotar «registro correcto» o únicamente el
código HTTP. Los valores sensibles se reemplazan por fixtures o referencias
reproducibles; no se copian credenciales ni datos personales reales.

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-<DOM>-NNN-01` | Estado, permisos, fixture y ambiente requeridos | Valores concretos que se envían o registran, clase de equivalencia o frontera y su procedencia | Operación reproducible o nombre del `it` | Respuesta esperada (estado y contenido relevante) y datos persistidos; ante rechazo, error y ausencia de efectos | Restauración requerida o `No aplica` |

### 3. Registro de ejecución y resultado real

El resultado esperado pertenece al diseño y no se sobrescribe después de ejecutar. El
resultado real se agrega en el registro de ejecución para conservar discrepancias y
repeticiones.

| Ejecución | Caso / suite | Revisión y ambiente | Fecha UTC y responsable | Resultado real | Estado | Evidencia / defecto |
| --- | --- | --- | --- | --- | --- | --- |
| `EP-NNN` | ID del caso, `SU-*`, ruta o comando focalizado | Commit, Node/Vitest, SO y servicios usados | Fecha y persona o CI | Conteos y observación obtenida | Aprobado, fallido, bloqueado o no ejecutado | Salida de CI, consulta verificable o incidencia |

El [registro selectivo de casos automatizados](03-test-cases.md) registra las
fichas que justifican documentación adicional. El [resumen por caso de
uso](04-use-case-coverage.md) registra únicamente su trazabilidad funcional. Los
resultados reales se conservan en CI o en la solicitud de cambio, no en un archivo
versionado.

## Cobertura CRUD mínima

| Operación | Evidencia del cliente | Condiciones relevantes |
| --- | --- | --- |
| Consultar/listar | Query admitida, filas/conteos, estado visible y ausencia de escritura. | Filtros, paginación, vacío, error, permiso y respuesta tardía. |
| Crear | Captura válida, payload del modo, código confirmado y UI posterior. | Vacío/fronteras, duplicado, relaciones, auxiliar y doble envío. |
| Actualizar | Payload explícito, versión original y captura conservada ante rechazo. | Conflicto, campos protegidos, fallo recuperable y desmontaje. |
| Eliminar/cancelar | Confirmación, operación correcta y estado posterior. | Cancelar sin request, fallo sin éxito falso y transición no admitida. |

Sólo se documentan operaciones disponibles. En sistema se comprueba además el estado
persistido y la ausencia de efectos parciales cuando el escenario lo requiera. Las
simulaciones observan requests/estado del cliente, no garantizan el resultado SQL.

## Responsables y gestión de incidencias

Desarrollo identifica riesgo, mantiene fixtures y actualiza DP/CP; revisión comprueba
oráculos, trazabilidad y límites; CI conserva ejecución/artefactos. El responsable de
aceptación evalúa el resultado funcional y pendientes, sin confundir build con aceptación.
Un defecto registra revisión, pasos/datos, esperado, real y evidencia reproducible,
con secretos y datos personales excluidos.

## Entrada, suspensión y salida

Se inicia con instalación reproducible, configuración compatible y datos/servicios del
nivel elegido. Sistema requiere validación de aislamiento y migraciones antes de crear
fixtures. Suspender un escenario si el entorno no permite garantizar aislamiento,
falla su preparación o falta un servicio requerido; registrar el bloqueo y continuar
comprobaciones independientes. Reanudar con la causa corregida, sin tratar el tiempo
transcurrido como resultado aprobado.

La salida exige casos pertinentes aprobados, fallos investigados, límites documentados
y evidencia asociada a la revisión. Un porcentaje o conteo no decide suficiencia por sí
solo. Las pruebas se retiran sólo por regla obsoleta, duplicidad demostrada o riesgo
aceptado, identificando la cobertura que permanece.

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

No se deduce cobertura total de conteos aprobados ni rendimiento de producción por el tiempo de la suite. Las brechas funcionales/de evidencia permanecen en la [matriz local](04-use-case-coverage.md).
