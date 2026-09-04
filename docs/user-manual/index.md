---
title: Manual de usuario de Nexus
subtitle: "Versión documental 0.2 · Sistema 1.0.0 · Estado: En revisión"
author: Equipo Nexus
date: 2026-09-04
document-version: 0.2
system-version: 1.0.0
status: En revisión
---

# Manual de usuario

Los metadatos anteriores generan la portada al exportar con Pandoc; el título Markdown
se conserva como encabezado de la versión navegable en el repositorio. La portada no es
una imagen ni depende de Playwright.

## Antes de comenzar

Este manual se prepara para personal autorizado. Requiere un navegador compatible, la URL del
entorno y una cuenta asignada. Las opciones visibles dependen del rol y el área; una ausencia de
opción no se debe resolver compartiendo credenciales.

## Acceso

1. Abra la URL de Nexus.
2. Capture sus credenciales y seleccione **Iniciar sesión**.
3. Compruebe que se muestre la página autorizada para su cuenta.

La captura se genera al ejecutar `npm run docs:screenshots` en un entorno de prueba. El script
elimina primero el directorio de imágenes y vuelve a crear el juego completo, por lo que una
exportación nunca debe mezclar capturas de ejecuciones distintas.

## Módulos

Las secciones de entradas, salidas, inventario, materiales, mermas, clientes, proveedores,
personas y usuarios se presentan en los [procedimientos y casos](procedures.md), siguiendo la
secuencia **propósito → precondiciones → recorrido principal → alternativas → errores →
resultado**. Cada procedimiento muestra la captura estable al aparecer la pantalla que representa
y advierte si modifica existencias o genera un archivo. Esa entrada divide el recorrido por grupo
funcional y ofrece guías específicas para administrador, almacén y usuarios de consultas y reportes.

Los identificadores, nombres, orden, casos de uso cubiertos y datos de prueba necesarios se
definen en el [inventario de capturas](screenshot-inventory.md). El inventario sigue el recorrido
real de las vistas y es la fuente para la automatización; no se deben agregar imágenes aisladas
sin incorporarlas también a esa secuencia.

### Continuidad de consultas y exportaciones

Los reportes **no se documentan como un módulo independiente del manual**, porque la
interfaz no ofrece un recorrido general de reportes. Cada exportación se explica como el
último paso del módulo donde el usuario consultó y filtró la información:

- materiales y su reporte de inventario;
- proveedores y clientes con su exportación desde el listado;
- mermas y su reporte de inventario;
- compras y su reporte mensual;
- salidas de material o merma y el reporte del mismo contexto;
- personas y usuarios con su exportación desde el listado;
- movimientos de material o merma y su reporte correspondiente.

Así se conserva la continuidad **abrir módulo → consultar → filtrar → exportar → recibir
archivo** sin obligar al lector a saltar a una sección artificial de reportes. El grupo
`REP` de requisitos sigue siendo válido para trazabilidad normativa, pero no define la
navegación ni la estructura del manual.

## Solución de problemas

Consulte el [catálogo de mensajes de error](error-messages.md) para identificar cómo se presenta
cada tipo de fallo, qué información conservar y cuándo debe intentarse nuevamente la operación.

- Si una opción no aparece, solicite validar rol, departamento y permiso; no intente otra cuenta.
- Si una operación falla, conserve el mensaje y la referencia mostrada, y evite repetir una
  escritura hasta confirmar su estado.
- No incluya contraseñas, cookies ni datos personales en una captura de soporte.
