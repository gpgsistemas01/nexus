# Plan de pruebas

## Objetivo y alcance

Este plan acepta cambios de Nexus mediante evidencia de los flujos que registran o
consultan datos. La [estrategia de pruebas](service-test-coverage.md) define técnicas y
ubicación; este documento establece la cobertura CRUD mínima y la ejecución.

Cada prueba nueva debe identificar el requisito o regla, la operación CRUD y el dato o
efecto observable. No se agrega cobertura sólo para aumentar conteos ni para fijar
detalles de HTML, estilos, selectores, eventos o estructura de archivos.

Como marco selectivo se usa **ISO/IEC/IEEE 29119-2** para separar planificación,
diseño, ejecución, reporte y cierre, e **ISO/IEC/IEEE 29119-3** para recordar la
información mínima de los artefactos. Nexus no declara conformidad: adopta un vocabulario
comprensible y conserva la evidencia ejecutable en el repositorio.

| Actividad inspirada en ISO 29119 | Aplicación sencilla en Nexus | Evidencia |
| --- | --- | --- |
| Planificar | Delimitar requisito, riesgo, nivel, ambiente y criterio de salida. | Incidencia y este plan. |
| Diseñar | Preparar precondiciones, datos, pasos y resultados esperados, incluidos alternos y errores. | Prueba o caso manual trazado a `RF-*`, `RN-*` o `CU-*`. |
| Ejecutar | Registrar comando, versión/commit, ambiente y resultado real. | Salida de Vitest/CI y consultas Prisma. |
| Informar | Distinguir aprobado, fallido, bloqueado y no ejecutado. | Resumen de solicitud de cambio. |
| Cerrar | Confirmar criterios, defectos pendientes y evidencia conservada. | Revisión de la entrega. |

Una prueba se redacta como **Dado / Cuando / Entonces** cuando mejora la lectura, sin
forzar una biblioteca BDD. Alternativas y excepciones se mantienen como casos separados
para que un fallo señale una causa concreta.

## Cobertura CRUD mínima

Sólo se cubren operaciones disponibles en el producto. Una eliminación puede ser una
cancelación o transición de estado, según el dominio.

| Operación | Evidencia principal | Casos relevantes |
| --- | --- | --- |
| Consultar/listar | respuesta HTTP y datos devueltos | filtros, paginación, vacío, acceso y límites |
| Crear | respuesta y lectura posterior con Prisma | validación, duplicado, relaciones y ausencia de escritura parcial |
| Actualizar | respuesta y valores persistidos | inexistente, conflicto, campos conservados y efectos atómicos |
| Eliminar/cancelar | estado o ausencia consultable | transición inválida, relaciones protegidas y reversión de efectos |

Los catálogos pueden reutilizar preparación y casos tabulados, pero cada contexto debe
demostrar su router, configuración y persistencia. Los documentos operativos añaden
stock, movimientos, detalles y rollback cuando esos efectos formen parte del flujo.

## Niveles y ubicación

| Nivel | Ubicación | Uso |
| --- | --- | --- |
| Unitario | `tests/unit/<ruta paralela al código>` | reglas, límites, decisiones y transformaciones de un registro o consulta |
| Integración | `tests/integration/controllers` | CRUD por HTTP con servicios reales y comprobación mediante Prisma |
| Esquema | migraciones sobre `DATABASE_TEST_URL` | restricciones, relaciones y atomicidad no demostrables con mocks |
| Documentación | `npm run docs:check` | documentos generados sincronizados con código y Prisma |

No se crea un nivel unitario para componentes visuales o infraestructura incidental.
Si un helper compartido coordina datos CRUD, se prueba una vez en la ruta paralela a su
módulo y los contextos reutilizan ese contrato.

## Registro de aplicación de pruebas unitarias

Además del código, esta tabla registra **cómo** se aplica el nivel unitario. La fuente
ejecutable continúa en `tests/unit`; la tabla explica intención, aislamiento y evidencia
sin copiar cada `it`. La trazabilidad funcional se mantiene en la
[matriz técnica](../architecture/traceability-matrix.md).

| Unidad / ubicación | Técnica aplicada | Resultado que se observa | Ejemplos vigentes |
| --- | --- | --- | --- |
| Servicios de dominio | Colaboradores Prisma/servicios sustituidos; entradas límite y errores por caso | Regla, argumentos, retorno y ausencia de colaboración inválida | identidad de material, consulta de movimientos, relaciones proveedor-material, reportes y mermas. |
| Controllers API | Harness Express/Supertest con servicio simulado | status/body, DTO y efecto posterior como evento de inventario | entradas, salidas, materiales, mermas y reportes de almacén. |
| Rutas y políticas | Router aislado y combinaciones tabuladas | orden/acceso positivo y rechazo antes del controller | rutas de merma y permisos rol–departamento. |
| DTO, validadores y helpers | Funciones puras con clases de equivalencia y fronteras decimales | selección, normalización, precisión, totales o error | DTO de entrada/merma, validaciones y helpers de inventario. |
| Aplicación del navegador | Requests simulados e inyección de configuración | adaptación del payload/respuesta y reutilización sin DOM | fábricas CRUD, salida y reporte; contextos y catálogos. |
| UI, plugins y utilidades del navegador | DOM mínimo o doubles de plugin; eventos observables | estado visual contractual, callback y transformación | formularios, DataTable, Select2, MDB, Flatpickr y utilidades. |

Cada incorporación registra en el nombre `describe/it` la regla o `RF/RN/CU` cuando
resulte útil, conserva preparación–ejecución–aserción y evita probar imports o detalles
privados. La salida de Vitest en CI/PR registra comando, commit, ambiente y resultado;
este documento no se marca como “aprobado” sólo porque exista el archivo.

## Cobertura prioritaria

| Capacidad | Estado / siguiente paso |
| --- | --- |
| Catálogos, clientes y proveedores | Mantener integraciones de alta y consulta; ampliar actualización o baja sólo al modificar esos flujos. |
| Salidas de merma | Mantener registro, persistencia, movimiento y rollback existentes. |
| Salidas de material | Incorporar integración HTTP de registro, entrega/devolución, stock y rollback. |
| Entradas de compra | Incorporar integración HTTP de registro, corrección, costo, movimiento y rollback. |
| Personas y usuarios | Incorporar persistencia de relaciones de rol y departamento. |
| Autorización por contexto | Mantener casos unitarios positivos y negativos por combinación rol/departamento; ventas permanece sin permisos del sistema. |
| Auditoría de escrituras | Incorporar unitarias de clasificación/sanitizado y middleware, más integración que distinga respuesta exitosa, fallida y persistencia best effort. |
| Ajustes, requisiciones y proyectos | Probar únicamente cuando exista el CRUD accesible desde controller. |
| Reportes y movimientos | Cubrir consultas, permisos, filtros y datos exportados. |

## Entrada, salida y evidencia

Antes de implementar debe existir un flujo real, una regla identificada y un ambiente
aislado si se usa Prisma. Para aceptar el cambio:

- pasan las pruebas relacionadas al CRUD afectado;
- cada escritura integrada se consulta con Prisma;
- los errores de operaciones compuestas no dejan registros parciales;
- no hay pruebas deshabilitadas ni duplicación del mismo camino feliz;
- `npm run docs:check` confirma la documentación generada.

En desarrollo se ejecutan primero las unitarias e integraciones del área. En el pull
request se ejecutan `npm run test:unit`, `npm run test:integration` con base aislada y
`npm run docs:check`. La evidencia indica comando, resultado y commit; una captura no
sustituye aserciones HTTP o Prisma.
