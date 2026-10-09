---
title: Manual del administrador del sistema
subtitle: "Nexus · Área: Sistemas · Versión documental 0.5 · Sistema 1.0.0 · Estado: En revisión"
author: Equipo Nexus
date: 2026-10-09
---

# Manual del administrador del sistema

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 0.5 | 1.0.0 | En revisión | 2026-10-09 | Equipo Nexus |

Esta guía le ayuda a conocer la operación y preparar los accesos de otras
personas. Comience por [primeros pasos](../overview.md); después revise personas,
cuentas y catálogos antes de acompañar una operación de almacén.

## Responsabilidades y límites

- Administra cuentas, contraseñas, personas y asignaciones de rol y departamento.
- Puede ejecutar los recorridos operativos del Personal de almacén y administra las consultas,
  altas, ediciones, cambios de estado y exportaciones de proveedores y clientes.
- Administra los catálogos auxiliares, realiza los ajustes de existencia autorizados y consulta los
  historiales de movimientos.
- Debe usar únicamente las acciones concedidas por el servidor; pertenecer al área Sistemas no
  sustituye la comprobación de permisos de cada solicitud.

## Su primer recorrido acompañado

1. Entre con su cuenta y abra **Menú principal**. Identifique **Personas**, **Usuarios**,
   **Catálogos**, **Almacén**, **Compras**, **Salidas** y **Movimientos**.
2. Consulte una [persona](../cases/identity-access/01-cap-ida-per-01-list.md) conocida.
   Revise su nombre y asignaciones de área y rol. Una persona no es una cuenta.
3. Consulte su [usuario](../cases/identity-access/04-cap-ida-usr-01-list.md) y la persona
   vinculada. Prepare una cuenta nueva sólo cuando la incorporación esté autorizada.
4. Reconozca los [catálogos auxiliares](../cases/catalogs/index.md#catálogos-auxiliares).
   Antes de agregar una opción, busque si ya existe.
5. Consulte un artículo en **Almacén** y siga su folio en una compra y una salida.
   Distinga solicitud, recepción, surtido y devolución antes de intervenir.
6. Revise [Movimientos](../cases/reports/index.md) para comprobar qué operación
   cambió la existencia y descargue un reporte del periodo requerido.
7. Acompañe al personal con el [recorrido de almacén](warehouse.md) y confirme
   que cada cuenta vea las opciones que necesita. Termine con **Cerrar sesión**.

## Salidas de consumibles

Desde **Salidas → Consumibles**, siga el [recorrido de salidas de consumibles](../cases/issues/15-cap-sal-con-01-walkthrough.md): consulta (`CU-SAL-15`), registro (`CU-SAL-16`), edición de encabezado (`CU-SAL-17`), edición de detalles (`CU-SAL-18`), surtido (`CU-SAL-19`), devolución (`CU-SAL-20`) y reporte Excel (`CU-SAL-21`). La creación y las acciones de cada registro parten de la consulta.

## Curso de inducción: Sistemas

**Dirigido a:** Administrador del sistema con acceso asignado al área **SISTEMAS**.

**Objetivo:** al terminar, podrá preparar accesos, mantener los catálogos autorizados,
acompañar la operación y comprobar los cambios de inventario con su historial.

| Sesión | Aprenda y practique con su instructor | Evidencia de aprendizaje |
| --- | --- | --- |
| 1. Acceso y alcance | Inicie sesión y reconozca sus opciones y las diferencias con una cuenta de almacén. | Identifica las funciones administrativas y los controles exclusivos de su actor. |
| 2. Personas y cuentas | Consulte una persona ficticia y su cuenta; prepare un alta autorizada en capacitación. | Comprueba la vinculación, rol, área y estado sin confundir persona con usuario. |
| 3. Catálogos | Busque y mantenga una opción de apoyo, un cliente y un proveedor de práctica. | Evita duplicados y explica los efectos de desactivar un registro. |
| 4. Operación | Siga los módulos de Almacén, Compras y Salidas con documentos ficticios. | Distingue recepción, solicitud, surtido y devolución y comprueba sus efectos. |
| 5. Control de existencia | Revise un ajuste autorizado y los movimientos de materiales y mermas. | Relaciona el cambio de existencia con su motivo e historial. |
| 6. Reportes y soporte | Descargue un reporte del periodo solicitado y acompañe una cuenta de almacén. | Verifica alcance y permisos y distingue un rechazo de acceso de un error de captura. |

Use los módulos de **Usuarios**, **Personas**, **Catálogos**, **Clientes**,
**Proveedores**, **Almacén**, **Compras**, **Salidas** y **Movimientos** como material de
cada sesión. Las capturas de Sistemas conservan sus controles administrativos aunque
el procedimiento operativo también exista en el manual de almacén.

**Evaluación final:** prepare un acceso ficticio con el rol y área indicados por el
instructor, explique los límites de esa cuenta y rastree un cambio de existencia desde
su folio hasta el historial. El instructor verifica cada resultado y repasa los pasos
pendientes antes de asignarle una administración real.
