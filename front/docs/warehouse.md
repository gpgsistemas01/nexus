# Almacén en Vue

## Acceso y alcance

Inicia Express y Vite en terminales separadas desde la raíz:

```bash
npm --prefix back run dev
```

```bash
npm --prefix front run dev
```

Abre `http://localhost:5173/inicio-sesion` y usa una cuenta existente. La configuración
local de Express permanece en `back/.env`; las dependencias se instalan en cada
aplicación. Consulta la [preparación de archivos ignorados](../../README.md#archivos-locales-ignorados-y-cambio-de-estructura).

| Ruta | Operaciones implementadas |
| --- | --- |
| `/almacen/materiales` | Consulta, filtros, paginación, columnas originales, alta, edición de metadatos, ajuste de stock y eliminación permitida por el servidor. |
| `/almacen/consumibles` | El mismo flujo, sin captura de dimensiones. |
| `/almacen/mermas` | Consulta, filtros, paginación, detalles, alta desde material del proveedor, edición de metadatos, ajuste y entrada de stock. No existe eliminación de mermas en la API. |

El botón Excel utiliza el reporte existente con tipo, búsqueda y alcance
activos/con stock/activos o con stock. El backend exporta todos los proveedores del
tipo seleccionado; cuando se filtra un proveedor la interfaz aclara esa diferencia.
El menú principal sólo enlaza estas vistas Vue. Compras, Salidas, Movimientos y
Catálogos no se enlazan desde este frontend ni se migran sus formularios.

## Patrones y propietario del estado

Las [decisiones de arquitectura](architecture.md) aplican a toda la implementación:

- `app/layouts/AppLayout` coordina la sesión y navegación. `InventoryPage` crea el estado
  del recurso y conecta filtros, tabla y editor; `InventoryEditorPage` conecta la captura.
- `InventoryTable`, `InventoryEditor`, `RemoteSelect`, `InventoryRowActions` y `app/components/AppNavigation` reciben
  props tipadas y emiten intenciones. Sólo mantienen estado visual local, como el
  diálogo de referencias históricas, y no conocen HTTP, almacenamiento ni autenticación.
- `useInventory` coordina permisos y apertura del editor; `useInventoryList`
  controla consultas y `useInventoryReport` la descarga; `useInventoryEditor`
  integra VeeValidate; `useRemoteOptions` comparte catálogos paginados y búsquedas
  con cancelación. Los formularios mantienen estado por instancia, sin stores.
- `inventoryService`, `inventoryCatalogService` e `inventoryReportService` separan
  los contratos HTTP; `mappers/inventoryMapper.ts` adapta DTOs a filas de presentación. `apiClient` centraliza cookies, errores y renovación de sesión.
- `formModel.ts` conserva listas explícitas de campos enviados por operación;
  `formFields.ts` reutiliza los controles que realmente comparten los tres módulos.

La adaptación usa estado reactivo, props/eventos, RouterLink y ciclos de vida de
Vue. No carga DataTables, Select2, Swal ni listeners EJS para administrar los mismos
controles. La consulta se actualiza manualmente, al recuperar el foco y cada 30 s
mientras la página está visible y no hay un editor abierto. No suscribe Socket.IO.

La [revisión de interfaz y HTTP](ui-and-http.md) detalla los encabezados originales,
la carga automática de opciones, las bibliotecas elegidas y los propietarios de código.

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
fuera de `front/`, conforme a [la guía de despliegue](login.md#proxy-y-despliegue).

## Verificación

`npm --prefix front run check` comprueba lint, tipos, unitarias y build.
`npm --prefix front run test:e2e` recorre controles reales en Chromium con API
simulada: permisos, altas, edición, conflictos, navegación y recuperación.
El [diseño selectivo de casos](tooling.md#pruebas-de-almacén) conserva sus riesgos y
oráculos. Esas pruebas no afirman persistencia: los contratos HTTP/Prisma se
comprueban separadamente con las pruebas existentes del backend y PostgreSQL aislado.
