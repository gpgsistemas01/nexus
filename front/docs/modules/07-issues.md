# 7. Salidas en Vue

## Propósito y fuentes

Describe para desarrollo la realización de `CU-SAL-01..21` de
[las fichas Vue de Salidas](../requirements/04-inventory-and-document-use-cases.md#cu-vue-010) en
[issues](../../src/modules/issues). La evidencia del cliente está en
[issues.spec.ts](../../tests/e2e/issues.spec.ts); los criterios y límites de la
documentación se mantienen en el [índice Vue](../index.md).

## Alcance y navegación

`/salidas/materiales`, `/salidas/consumibles` y `/salidas/mermas` son rutas Vue
protegidas, agrupadas en Salidas dentro del menú. `/salidas` selecciona el primer recurso autorizado.

Las guardas y el menú usan `goods:issues-page-view` o `waste:issues-page-view`.
Los listados y las consultas requieren además el permiso de gestión que exige
la API existente. Surtir y devolver usan `goods:issue-details-manage` o
`waste:issues-supply`; Excel usa `warehouse:reports-read`. Express comprueba
cada operación; los controles de Vue sólo orientan la interfaz.

## Operaciones y contratos

| Estado leído del documento | Operaciones |
| --- | --- |
| Pendiente y aprobada | Editar encabezado y partidas; surtir detalles pendientes. |
| Surtido parcial y aprobada | Editar encabezado; surtir detalles aún pendientes. |
| Surtido y aprobada | Editar encabezado; devolver cantidades de detalles surtidos. |
| Cancelada o surtido cancelado | Consulta. |

El modo se resuelve después de consultar el documento por ID, evitando confiar en
el estado anterior del listado. La edición del encabezado usa `PATCH /:id/header`;
el surtido usa `PATCH /:id/details`; la devolución usa
`PATCH /:id/details/:detailId/returns`. Materiales y Consumibles usan
`/api/warehouse/goods-issues/<recurso>`; Mermas usa `/api/warehouse/waste-issues`.

El encabezado conserva cliente, asesor, área, solicitante, número de proyecto,
fecha de solicitud y observaciones. Las dependencias de cliente/asesor y
área/solicitante utilizan las reglas públicas del dominio. El cliente interno conserva
la sugerencia de proyecto por área y el filtro de coordinador; para clientes
externos se filtra asesor por Ventas/Dirección. Cambiar cliente o área limpia la
selección dependiente. El alta rápida de clientes se compone desde
`app/pages/IssueWorkspace`, sin importar páginas privadas de Directorio en Salidas.
Registrar cliente aparece también dentro del selector: precarga la búsqueda y
devuelve una opción activa confirmada mediante `DirectoryCreationPage`. Cancelar
conserva la captura de salida; no se ofrece alta desde los demás selectores.
Asesor y Solicitante consultan las personas existentes; no ofrecen alta auxiliar.

Las partidas distinguen material y proveedor; repetir el mismo par acumula su
cantidad, mientras otro proveedor conserva otra partida. Las mermas se agrupan
por ID. La tabla conserva medidas, salida, presentación y conversión; surtido
agrega cantidad de proyecto, diferencia y selección por detalle; devolución
muestra cantidades surtidas, devueltas y disponibles.

Crear/editar envía identidades y cantidades. Surtir sólo envía detalles nuevos
seleccionados con su ID y cantidad de proyecto. Devolver envía cantidad y
observaciones propias. El navegador no envía saldos, estados ni costos derivados
como autoridad: Express valida pertenencia, estado, stock y concurrencia en sus
transacciones existentes. Los códigos de éxito se comprueban con
`confirmMutation` y las constantes compartidas; el aviso presenta el mensaje del contrato.

## Responsabilidades y reutilización

- `pages` compone listados, editores, alta rápida y devolución; conecta eventos.
- `components` presenta props y emite intenciones, sin HTTP ni validación propia.
- Los composables coordinan formulario con VeeValidate, interacción, dependencias
  de selectores y transiciones de lectura/escritura. No se crea un store global.
- `services` adapta endpoints; los mappers de request y respuesta conservan sus contratos.
- `issueForm` crea valores y esquemas de validación; `issueDetails` conserva borradores
  y selección de surtido. `issueConfig` y `issueRules` separan configuración y reglas
  de presentación de los contratos tipados de `issue.ts`.

Se componen `usePagedList`, `useListSearch`, `useRemoteLookup`,
`useSelectedOption`, `useFormInteraction`, `useRecordSave`, `useReportScope`,
`useVisibleRefresh`, Axios y los marcos existentes de tablas y modales. El lector
`useDocumentRead`, extraído de Compras con su cobertura de cancelación, se comparte
con Salidas. Las reglas de negocio del backend no se trasladan al navegador.

Los filtros y el orden se aplican en servidor. Los reportes admiten mes actual,
mes específico y filtros aplicados; no heredan paginación. La actualización
silenciosa queda suspendida durante una consulta, un editor o un reporte.
Abrir el modal y mover foco no muestra errores de captura; los errores se
presentan tras edición o envío. Un rechazo conserva los datos y requiere un
reintento explícito; una devolución superior al saldo leído se bloquea antes de
consultar, sin sustituir la comprobación definitiva del servidor.

## Validación del flujo

`tests/unit/modules/issues/issueTest.ts` cubre contratos por recurso, selección de
modo, payloads, agrupación, validación de surtido/devolución y dependencias.
`tests/e2e/issues.spec.ts` ejercita Vuetify y Router con API simulada en escritorio
y móvil: alta, edición, surtido, devolución, filtros, reportes y permisos.
Estas pruebas comprueban el cliente; la persistencia y el stock conservan las
integraciones HTTP/Prisma del backend (`goodsIssueControllerDbTest`,
`wasteIssueControllerDbTest` y concurrencia de almacén).

Los selectores de inventario admiten el contrato del listado sin `material.type`: su
endpoint ya está separado por recurso. Si el campo está presente se comprueba su
compatibilidad; los documentos completos siguen exigiendo el tipo esperado.

La [revisión de responsabilidades y nombres](../patterns/08-document-responsibilities.md) explica
los propietarios, patrones y contratos tipados de escritura. Las selecciones
dependientes pertenecen a `useIssueHeaderSelection`.
