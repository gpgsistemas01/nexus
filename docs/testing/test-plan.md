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

## Cobertura prioritaria

| Capacidad | Estado / siguiente paso |
| --- | --- |
| Catálogos, clientes y proveedores | Mantener integraciones de alta y consulta; ampliar actualización o baja sólo al modificar esos flujos. |
| Salidas de merma | Mantener registro, persistencia, movimiento y rollback existentes. |
| Salidas de material | Incorporar integración HTTP de registro, entrega/devolución, stock y rollback. |
| Entradas de compra | Incorporar integración HTTP de registro, corrección, costo, movimiento y rollback. |
| Personas y usuarios | Incorporar persistencia de relaciones de rol y departamento. |
| Autorización por contexto | Mantener casos unitarios positivos y negativos por combinación rol/departamento; ventas permanece sin permisos del sistema. |
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
