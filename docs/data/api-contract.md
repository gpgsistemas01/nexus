# Contrato de la API

Este documento es propietario del contrato HTTP y no de las reglas de negocio ni del
esquema persistente. La relación con requisitos, diseño y evidencia se consulta en el
[mapa de datos, persistencia y acceso](index.md).

## Exportación mensual de reportes

Los endpoints de exportación de compras, salidas y movimientos aceptan
`monthlyReport=true`. En ese modo ignoran los filtros aplicados al listado y consultan
el mes actual de México de forma predeterminada. El parámetro opcional `reportMonth`,
con formato `AAAA-MM`, permite consultar un mes calendario específico; un valor
ausente o inválido conserva el comportamiento seguro del mes actual.

La interfaz conserva **Mes actual** como opción explícita porque es el caso de uso
principal y evita una selección innecesaria. **Otro mes** habilita un selector mensual
Flatpickr —con valor contractual `AAAA-MM`— y **Personalizado** reutiliza los filtros
aplicados al listado; así no se mezclan un periodo calendario completo y un reporte
filtrado. El selector reutiliza los mismos tokens visuales y estados habilitado, enfocado
y deshabilitado de los campos de formulario; así el periodo permanece legible dentro
del modal sin introducir una variante de estilo exclusiva para la exportación.

## Decisión

**Sí conviene adoptar OpenAPI, pero Swagger no sustituye la documentación de
arquitectura.** OpenAPI documentaría el contrato HTTP —rutas, parámetros, payloads,
respuestas, errores y autenticación—; Swagger UI sería sólo una interfaz para consultar
y probar ese contrato.

Nexus todavía no publica un contrato OpenAPI. El
[mapa generado](../generated/code-map.md) inventaría los métodos y rutas reales, pero no
pretende inferir esquemas desde `express-validator`, DTO, controllers y servicios. Una
especificación que sólo liste endpoints daría una falsa sensación de cobertura.

## Propuesta simple

1. Crear un contrato OpenAPI 3.1 versionado, comenzando por un CRUD completo y sus
   errores; clientes o proveedores son mejores candidatos que un flujo transaccional.
2. Reutilizar componentes de esquema para paginación, errores, identificadores y
   respuestas comunes. No copiar el mismo payload entre operaciones o dominios.
3. Validar el contrato en CI y agregar pruebas de integración relacionadas con el CRUD
   documentado, siguiendo [la estrategia de pruebas](../testing/service-test-coverage.md).
4. Publicar Swagger UI sólo como visualizador del contrato. En producción debe quedar
   deshabilitado o protegido si revela operaciones internas.
5. Migrar el siguiente recurso únicamente cuando el anterior describa solicitudes,
   respuestas y errores reales. No declarar la API completa de una vez con esquemas
   incompletos.

## Cuándo implementarlo

Priorizar OpenAPI cuando exista al menos una de estas necesidades:

- integración con otro sistema o equipo;
- generación de clientes o pruebas de contrato;
- consumidores que no pueden leer el código del servidor;
- necesidad de probar endpoints desde una interfaz controlada.

Mientras la aplicación web sea el único consumidor, no es un bloqueo operativo. Aun
así, el contrato aporta valor y debe incorporarse incrementalmente en lugar de intentar
generarlo automáticamente desde rutas que no contienen toda la semántica.

## Fuente de verdad actual

Hasta adoptar OpenAPI, se consulta en este orden:

1. [mapa generado](../generated/code-map.md) para métodos y rutas;
2. `src/routes/api/` para middleware, permisos y validadores;
3. `src/validators/`, `src/dtos/` y controllers para entradas y respuestas;
4. pruebas de integración para comportamiento observable y persistencia.

## Precisión de valores decimales

Los payloads de creación y edición aceptan hasta **8 dígitos enteros y 6 decimales**
para precios, existencias, cantidades y medidas. La API conserva esos seis decimales y
la persistencia usa `DECIMAL(18,6)`; no debe interpretarse una representación visual de
dos decimales como el valor contractual almacenado.

El navegador mantiene hasta seis decimales durante captura, cálculos y envío. Las
tablas, resúmenes y cantidades de sólo lectura reutilizan `formatDecimal` o
`formatCurrency` para mostrar dos decimales. Por tanto, el redondeo es una decisión de
presentación y nunca debe aplicarse al payload antes de crear o actualizar un recurso.

## Relaciones de inventario en el cliente web

Los datos de inventario consumidos por los formularios y listados CRUD conservan las
relaciones `presentation` y `unitMeasure` como objetos. Cuando Select2 las transporta
en atributos HTML, el cliente debe deserializarlas antes de leer `name`, `symbol` o
`id`; una cadena con el nombre de la presentación no forma parte de este contrato.

## Presentación de conflictos en el cliente web

Las respuestas HTTP `409` conservan un código de error estable en `code` y una
descripción legible en `message`. El cliente muestra ambos valores en el modal de
advertencia: el código identifica el conflicto en el título y el mensaje explica la
causa en el texto normal. Si la respuesta no incluye `code`, el título usa
**Conflicto**; si no incluye `message`, el texto reutiliza el mensaje asociado al
código o el fallback general del manejador de errores.
