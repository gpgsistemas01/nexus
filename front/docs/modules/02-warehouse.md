# 2. Almacén en Vue

## Propósito y fuentes

Describe para desarrollo la realización de inventarios en
[warehouse](../../src/modules/warehouse), vinculada con los
[casos ALM](../../../back/docs/requirements/use-cases/catalogs/index.md).
La evidencia del cliente está en [warehouse.spec.ts](../../tests/e2e/warehouse.spec.ts)
y las pruebas unitarias del módulo. El [índice Vue](../index.md) distingue esta guía
de los requisitos normativos y las garantías del servidor.

## Acceso y alcance

La alternativa de duplicado de `CU-ALM-10` conserva una diferencia funcional:
Vue no abre automáticamente Agregar stock trasladando la captura. Se registra
como [BRE-VUE-001](../testing/03-use-case-coverage.md#brechas-y-decisiones-pendientes),
sin declarar que el recorrido completo de la ficha ya se cumple en el cliente.

Inicia Express y Vite en terminales separadas desde la raíz:

```bash
npm --prefix back run dev
```

```bash
npm --prefix front run dev
```

Abre `http://localhost:5173/inicio-sesion` y usa una cuenta existente. La configuración
local de Express permanece en `back/.env`; las dependencias se instalan en cada
aplicación. Consulta la [preparación de archivos ignorados](../../../README.md#archivos-locales-ignorados-y-cambio-de-estructura).

| Ruta | Operaciones implementadas |
| --- | --- |
| `/almacen/materiales` | Consulta, filtros, paginación, columnas originales, alta, edición de metadatos, ajuste de stock y eliminación permitida por el servidor. |
| `/almacen/consumibles` | El mismo flujo, sin captura de dimensiones. |
| `/almacen/mermas` | Consulta, filtros, paginación, detalles, alta desde material del proveedor, edición de metadatos, ajuste y entrada de stock. No existe eliminación de mermas en la API. |

El botón Excel utiliza el reporte existente con tipo, búsqueda y alcance
activos/con stock/activos o con stock. El backend exporta todos los proveedores del
tipo seleccionado; cuando se filtra un proveedor la interfaz aclara esa diferencia.
El menú principal agrupa estas vistas Vue en un acordeón «Almacén», con iconos
para Materiales, Consumibles y Mermas. En escritorio empieza como barra de iconos;
pulsar Almacén o el botón de menú abre el panel detallado. Clic fuera, Escape o
elegir una ruta lo cierra y conserva la barra compacta sin desplazar la página.
En móvil el botón abre el panel sobre la página y al cerrarlo queda oculto.
El acordeón admite teclado, estado expandido accesible y sólo las rutas permitidas.
El grupo [Catálogos](03-catalogs.md) agrega las seis vistas administrables para
`catalogs:manage`. [Compras](06-purchases.md) se implementa como documento separado
y reutiliza el alta de artículos sin stock inicial. [Salidas](07-issues.md) tiene
sus propias pantallas Vue; el menú del cliente no enlaza sus vistas EJS.
Los historiales tienen su propia sección de [Movimientos en Vue](05-movements.md).

## Patrones y propietario del estado

Las [decisiones de arquitectura](../architecture/01-structure-and-boundaries.md) aplican a toda la implementación:

- `app/layouts/AppLayout` coordina la sesión y navegación. `InventoryPage` crea el estado
  del recurso y conecta filtros, tabla y editor; `InventoryEditorPage` conecta la captura.
- `InventoryTable`, `InventoryFilters`, `InventoryEditor`, `InventoryFormField`, `RemoteSelect`, `InventoryRowActions` y `app/components/AppNavigation` reciben
  props tipadas y emiten intenciones. Sólo mantienen estado visual local, como el
  diálogo de referencias históricas, y no conocen HTTP, almacenamiento ni autenticación.
- `useInventory` coordina permisos y apertura del editor; `useInventoryList`
  configura consultas sobre `shared/composables/usePagedList` y conserva la política
  de recarga; `useInventoryReport` controla la descarga; `useInventoryEditor`
  integra VeeValidate y comparte la interacción de campos mediante `useFormInteraction`.
  `useRemoteOptions` adapta `shared/composables/useRemoteLookup` a los catálogos paginados y búsquedas
  con cancelación. Los formularios mantienen estado por instancia, sin stores.
- `inventoryService`, `inventoryCatalogService` e `inventoryReportService` separan
  los contratos HTTP; `mappers/inventoryMapper.ts` adapta DTOs a filas de presentación. `apiClient` centraliza cookies, errores y renovación de sesión.
- `formModel.ts` conserva listas explícitas de campos enviados por operación;
  `formFields.ts` reutiliza los controles que realmente comparten los tres módulos.

La adaptación usa estado reactivo, props/eventos, RouterLink y ciclos de vida de
Vue. No carga DataTables, Select2 ni listeners EJS para administrar los mismos
controles. SweetAlert2 confirma eliminaciones y muestra avisos de éxito; el modal
de captura pertenece a Vuetify/VeeValidate. La consulta se actualiza manualmente y
se comprueba cada 30 s, al recuperar el foco y al volver a una pestaña visible.
La recarga automática sólo consulta si han pasado al menos 30 s desde el último
intento, la página está visible y no hay editor, confirmación ni consulta activa.
Conserva las filas visibles y muestra «Actualizando datos…» sin activar el estado
de carga de la tabla; si los datos son iguales conserva su referencia. Un fallo
conserva la tabla y permite reintentar. La actualización manual y el guardado no
esperan ese intervalo. No suscribe Socket.IO ni retrasa la primera lectura.

Los campos se registran en VeeValidate. Abrir el modal, recuperar datos y mover el
foco sin modificar un campo no muestra errores. El blur valida campos modificados
o una captura ya enviada; Guardar valida el formulario completo. La validación
definitiva de Express se conserva.

La [revisión de interfaz y HTTP](../architecture/03-ui-and-http.md) detalla los encabezados originales,
la carga automática de opciones, las secciones y campos recuperados del modal,
los estilos, las bibliotecas elegidas y los propietarios de código.

## Reglas y contratos conservados

Los alias de Vite y TypeScript importan validadores desde
`back/src/public/js/utils/validations/validators.js`, cálculos de vista previa desde
`back/src/shared/inventory/wasteMeasurements.js` y permisos desde su constante pública.
Son fuentes ya públicas para EJS; no se copian reglas ni se importa código privado
de servicios, repositorios, Prisma o Express en el navegador.

El frontend comprueba captura para dar respuesta inmediata. Express vuelve a validar
campos, identidad, pertenencia, permisos y estado y calcula los valores que persiste.
Los permisos recibidos de `/api/auth/me` sólo determinan navegación y controles
visibles: modificar el navegador no concede permisos al servidor.

La fila de materiales/consumibles tiene dos identificadores: la relación con el
proveedor y el material. La baja usa el identificador de la relación; edición y
ajuste usan el del material junto con `supplierId`. Edición conserva
`expectedVersion` y `expectedMaterialVersion` de la lectura; el ajuste conserva
la versión del saldo leído. Un conflicto no consulta una versión nueva para reenviar
la captura anterior: ofrece cerrar, actualizar y revisar.

Las altas de merma en rollo capturan peso de cono, peso total y peso del rollo
completo. Muestran dimensiones y neto estimados usando las funciones públicas.
Envían dimensiones y pesos capturados, sin `weightKg` ni referencias de muestras
históricas como valores autoritativos. La edición de metadatos no reescribe medidas,
pesos ni stock. Para una merma ya existente, el mensaje del servidor indica usar
Agregar stock: cierra el alta, localiza la merma y revisa su entrada de stock.

## Recuperación de capturas de merma

Alta y entrada de stock guardan el cuerpo y `operationId` antes de enviarlos, bajo
`nexus:waste-operation:<usuario>:<acción>:<merma>`, la misma clave que usa EJS en el
mismo origen. Una respuesta incierta conserva esa captura y bloquea modificaciones.
**Recuperar captura** vuelve a enviar exactamente el mismo cuerpo e identificador,
incluso después de cerrar el editor o recargar. No crea una operación nueva.

Sólo una confirmación o un rechazo definitivo permiten limpiar la captura. Si el
almacenamiento está bloqueado no se envía una nueva alta/entrada de merma, para
evitar perder la posibilidad de recuperarla. No borres esa clave como solución a
un fallo de red. La API garantiza la idempotencia y la transacción; deshabilitar
el botón en Vue no sustituye esas garantías.

## Ejecución y despliegue

Vite y Nginx sirven las rutas del frontend con el fallback de Vue Router.
Sólo `/api` y la acción `/cerrar-sesion` conservan el proxy del mismo origen y
las cookies HttpOnly; no se integran vistas EJS al frontend.

La construcción Docker usa la raíz del repositorio como contexto para incluir
únicamente los módulos públicos compartidos y sus dependencias explícitas. La
imagen final contiene Nginx y assets; no contiene el backend. Para Vercel/Render
estático deben configurarse los proxies antes del fallback y permitir esas fuentes
fuera de `front/`, conforme a [la guía de despliegue](01-authentication.md#proxy-y-despliegue).

## Verificación

`npm --prefix front run check` comprueba lint, tipos, unitarias y build.
`npm --prefix front run test:e2e` recorre controles reales en Chromium con API
simulada: permisos, altas, edición, conflictos, navegación y recuperación.
El [diseño selectivo de casos](../testing/01-test-design.md#pruebas-de-almacén) conserva sus riesgos y
oráculos. Esas pruebas no afirman persistencia: los contratos HTTP/Prisma se
comprueban separadamente con las pruebas existentes del backend y PostgreSQL aislado.

Los selectores `RemoteSelect` y `useSelectedOption` pertenecen a `shared` y se
reutilizan en Identidad. Los reportes comparten `requestExcel` y `useFileExport` con
[Identidad y Directorio comercial](04-identity-and-directory.md), conservando sus
filtros y alcances de inventario.
