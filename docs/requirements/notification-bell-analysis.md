# Decisiones para aplicar la campana de notificaciones

## Estado y propósito

La campana se implementará como una **bandeja de pendientes operativos** entre las áreas
solicitantes y almacén. No será un historial general de actividad ni reemplazará los
mensajes de validación y resultado de SweetAlert.

Su propósito será:

1. avisar a almacén cuando otra área registre una solicitud de salida;
2. informar que un detalle no puede surtirse por existencia insuficiente;
3. avisar cuando una recepción, devolución o ajuste vuelva suficiente la existencia;
4. mantener visible el surtimiento parcial mientras quede cantidad pendiente.

La participación de otras áreas en el registro de salidas todavía está propuesta. La
campana se habilitará junto con los permisos que permitan a cada área crear y consultar
sus propias solicitudes.

## Fuente de verdad

La bandeja se calculará desde las salidas, sus detalles, el estado de surtimiento y las
existencias actuales. No se restaurará inicialmente el modelo `Notification` ni se creará
un CRUD independiente de notificaciones.

Esta decisión permite que:

- un aviso exista mientras la condición operativa siga pendiente;
- una reconexión reconstruya la bandeja aunque el navegador haya perdido eventos;
- atender o cancelar la salida actualice el aviso sin sincronizar otro registro;
- las reglas de autorización y disponibilidad permanezcan en el servidor.

Una marca leído/no leído, retención o historial independiente sólo se incorporará si más
adelante existe un requisito de auditoría de comunicaciones. Abrir un aviso no lo elimina:
desaparece o cambia cuando el CRUD o la acción de salida resuelve su condición.

## Pendientes que mostrará la campana

| Pendiente | Destinatario | Acción | Cuándo cambia o desaparece |
| --- | --- | --- | --- |
| Nueva solicitud | Almacén | Revisar la salida | Cambia según la disponibilidad o el surtimiento de sus detalles |
| Existencia insuficiente | Almacén y área solicitante | Consultar el detalle pendiente | Cambia cuando la existencia cubre la cantidad pendiente o se cancela el detalle |
| Existencia disponible | Almacén y área solicitante | Continuar el surtimiento | Desaparece al surtir o cancelar; vuelve a insuficiente si deja de alcanzar |
| Surtimiento parcial | Almacén y área solicitante | Consultar lo entregado y pendiente | Desaparece al completar o cancelar la cantidad pendiente |

El surtimiento completo no incrementará el contador de almacén porque ya no requiere una
acción. El área solicitante conocerá el resultado mediante la actualización de su tabla
de salidas.

La disponibilidad se evaluará contra la **cantidad pendiente del detalle**, no sólo con
`stock > 0`. Los avisos cambiarán al pasar entre existencia suficiente e insuficiente; no
se generará un aviso nuevo por cada movimiento de inventario.

Las salidas de material y de merma reutilizarán la misma bandeja y el mismo contrato. Cada
contexto conservará sus consultas de existencia, conversiones y reglas de movimientos.

## Actualización en tiempo real

Se reutilizarán la conexión Socket.IO y el publicador de inventario existentes. No se
creará una conexión exclusiva para la campana ni se emitirá una vez para la tabla y otra
para la bandeja.

Se publicará una señal por cambio de dominio, después del `commit`, y todos los
consumidores interesados reaccionarán a ella:

- `issues:updated` cuando se cree o cambie una salida;
- `materials:updated` cuando cambie una existencia de material;
- `wastes:updated` cuando cambie una existencia de merma.

Las tablas continuarán actualizándose con estas señales y la campana volverá a consultar
sus pendientes. Los eventos de movimientos existentes se conservarán por compatibilidad,
pero la campana no dependerá de ellos.

El payload será una invalidación mínima:

```json
{
  "context": "material",
  "source": "goods-issue-created",
  "entityType": "goods-issue",
  "entityId": "uuid-de-la-salida",
  "updatedAt": "2026-08-31T15:00:00.000Z"
}
```

No se enviarán por Socket.IO cantidades, costos, nombres de personas, detalles ni el
documento completo. El evento informa que algo cambió; el navegador obtiene los datos
vigentes y autorizados desde la API.

Las conexiones deberán autenticarse y agruparse en salas por usuario o departamento antes
de habilitar el acceso de otras áreas. Aunque el evento sea dirigido, la API volverá a
validar que el usuario pueda consultar la salida.

## Consulta y comportamiento del cliente

La API expondrá una consulta paginada de pendientes visibles con su contador, por ejemplo
`GET /api/warehouse/issue-alerts?cursor=...`. Las altas, ediciones, surtimientos,
devoluciones y cancelaciones continuarán usando el CRUD y las acciones existentes de
salidas.

Al recibir una señal, el navegador deberá:

1. consultar nuevamente los pendientes autorizados;
2. reemplazar la bandeja usando el identificador estable de cada salida o detalle;
3. actualizar el contador de pendientes accionables;
4. conservar la información anterior y permitir reintento si falla la consulta.

Una señal repetida sólo provocará otra sincronización y no duplicará elementos. La misma
consulta se ejecutará al cargar la página y al reconectar el socket.

## Presentación e interacción

La campana será un botón accesible con un badge de `1` a `99+`, oculto cuando no haya
pendientes. Al activarla abrirá un menú, sin navegar ni interrumpir el formulario actual.
No abrirá automáticamente modales ni mensajes SweetAlert al recibir un evento.

Cada elemento mostrará:

- icono y etiqueta de tipo;
- título: «Nueva solicitud», «Existencia insuficiente» o «Existencia disponible»;
- referencia de la salida y resumen operativo;
- área relacionada y fecha de actualización;
- acción explícita: `Revisar`, `Surtir` o `Consultar`.

El color será complementario: rojo para imposibilidad de surtir, ámbar para pendiente y
verde para disponibilidad recuperada. El texto y el icono conservarán siempre el
significado sin depender del color.

Al seleccionar un elemento se validará nuevamente el permiso y se abrirá el flujo
existente de salidas filtrado por `entityId`. La campana no surtirá ni modificará stock
directamente.

### Navegación desde el aviso

Sí, cada aviso permitirá moverse a la página necesaria mediante un enlace interno
construido por el cliente desde `entityType`, `entityId` y una acción conocida. El payload
del socket no enviará una URL.

| Contexto | Página | Ejemplo de destino |
| --- | --- | --- |
| Salida de material | `/salidas/materiales` | `/salidas/materiales?issueId=<uuid>&action=review` |
| Salida de merma | `/salidas/mermas` | `/salidas/mermas?issueId=<uuid>&action=review` |

Las únicas acciones admitidas serán:

- `review`: abrir la salida en consulta para una solicitud nueva o sin existencia;
- `supply`: abrir el flujo existente de surtimiento cuando haya disponibilidad y el
  usuario posea el permiso correspondiente;
- `view`: abrir sólo consulta para el área solicitante.

La página leerá `issueId` y `action`, consultará la salida por identificador y reutilizará
el modal existente en el modo permitido. Para ello se añadirá la lectura individual
`GET /api/warehouse/goods-issues/:id` y su equivalente
`GET /api/warehouse/waste-issues/:id`, pues actualmente el frontend sólo dispone del
listado para recuperar documentos.

La API decidirá el modo efectivo: recibir `action=supply` no concede permiso para surtir.
Si el usuario sólo puede consultar, se abrirá en modo vista; si la salida no existe o no
es visible para su departamento, la página mostrará el error autorizado y no abrirá el
modal. Al cerrar el modal se retirarán `issueId` y `action` de la URL mediante
`history.replaceState` para que actualizar la página no lo abra nuevamente.

El botón general «Ver pendientes» navegará a la página correspondiente con los filtros de
estado, contexto y departamento autorizados, sin abrir un documento específico.

## Reutilización y construcción

La implementación reutilizará:

- `emitInventoryUpdated` y la conexión Socket.IO existente;
- el CRUD, los estados y las acciones de salidas;
- el control compartido `button.ejs`;
- las utilidades de petición, manejo de errores y formato de fechas;
- el proceso común de salidas para material y merma, conservando sus diferencias de
  contexto.

El módulo de interfaz de la bandeja será propio porque administra contador, carga y
sincronización; no se mezclará con SweetAlert.

## Verificación requerida

Las pruebas respetarán la ubicación y las estrategias definidas en la documentación de
pruebas:

- unitarias para autorización, filtros y transición entre existencia suficiente e
  insuficiente;
- controller para contrato HTTP, paginación y rechazo de acceso cruzado;
- integración CRUD para demostrar que otra área crea una salida, almacén la consulta, el
  surtimiento cambia el pendiente y una reposición vuelve atendible un detalle;
- interfaz para contador, estado vacío, eventos repetidos, error de consulta, reconexión y
  navegación por `issueId` en material y merma;
- lectura individual para respuestas `200`, `403` y `404`, además de impedir que el query
  parameter eleve el modo por encima del permiso efectivo.

Antes de implementar sólo queda definir qué áreas podrán registrar salidas, si consultarán
únicamente sus documentos o los de todo su departamento y qué usuarios de almacén podrán
atenderlas.
