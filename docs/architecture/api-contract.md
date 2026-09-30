# Contrato de la API

La [especificación OpenAPI 3.1](openapi/openapi.json) es la referencia procesable de
métodos, rutas, parámetros, cuerpos, respuestas y autenticación. Sus fuentes modulares se
organizan por dominio bajo `docs/architecture/openapi/`; la exportación las resuelve en
un solo archivo para herramientas externas.

Las rutas registradas en `src/routes/api` son la fuente de la superficie HTTP y el
[mapa generado](views/development/code-map.md) permite contrastarlas. Validadores, DTO,
controladores y pruebas verifican el comportamiento implementado. Cuando cambia una
operación, se actualizan su definición OpenAPI, sus componentes reutilizados y las
pruebas relacionadas; `npm run docs:check` comprueba que las operaciones registradas y
publicadas permanezcan sincronizadas.

## Cobertura del contrato

Las reglas curadas de este documento **no son las únicas operaciones documentadas**.
Sólo conservan semántica transversal que OpenAPI no explica por sí solo. El contrato
completo se divide en cuatro fuentes procesables:

| Área HTTP | Operaciones y contratos propietarios |
| --- | --- |
| [`auth`](openapi/paths/auth.json) | Inicio, consulta y renovación de sesión; esquemas de autenticación. |
| [`sales`](openapi/paths/sales.json) | Clientes y su exportación. |
| [`warehouse`](openapi/paths/warehouse.json) | Materiales, mermas, proveedores, entradas, salidas, devoluciones, inventario, catálogos operativos y reportes. |
| [`admin`](openapi/paths/admin.json) | Personas, usuarios, accesos, movimientos, catálogos administrables y reportes administrativos. |

Los esquemas reutilizables viven en `docs/architecture/openapi/components/` —por
ejemplo, [esquemas comunes](openapi/components/common-schemas.json) y
[respuestas compartidas](openapi/components/responses.json)— y el documento raíz enlaza
cada `Path Item` mediante `$ref`. `npm run docs:check` resuelve esas referencias y
compara cada método/ruta con el mapa generado; por eso no se agrega una tabla manual de
endpoints en Markdown. La salida de esa validación informa el total de operaciones
cubiertas y detecta tanto rutas ausentes como definiciones obsoletas.

## Reglas contractuales complementarias

### Exportación mensual de reportes

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

### Precisión de valores decimales

Los payloads de creación y edición aceptan hasta **8 dígitos enteros y 6 decimales**
para precios, existencias, cantidades y medidas. La API conserva esos seis decimales y
la persistencia usa `DECIMAL(18,6)`; no debe interpretarse una representación visual de
dos decimales como el valor contractual almacenado.

El navegador mantiene hasta seis decimales durante captura, cálculos y envío. Las
tablas, resúmenes y cantidades de sólo lectura reutilizan `formatDecimal` o
`formatCurrency` para mostrar dos decimales. Por tanto, el redondeo es una decisión de
presentación y nunca debe aplicarse al payload antes de crear o actualizar un recurso.

Las reglas de negocio permanecen en requisitos, la estructura persistente en Prisma y
la coordinación interna en las referencias técnicas. Este documento no repite
tutoriales de JSON, criterios personales para redactar fichas ni detalles de
presentación del cliente web.

Al cambiar una ruta, un payload, una respuesta o su seguridad, se actualiza la fuente
OpenAPI del área correspondiente. Este documento se actualiza únicamente cuando cambia
alguna de las reglas complementarias que explica —el periodo de los reportes o la
precisión decimal—. Así, OpenAPI conserva el contrato verificable de cada operación y
este Markdown conserva el contexto compartido que requiere explicación adicional.
