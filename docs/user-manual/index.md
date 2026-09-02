---
title: Manual de usuario de Nexus
document-version: 0.1
system-version: 1.0.0
status: Borrador
---

# Manual de usuario

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
resultado**. Cada paso muestra la captura estable correspondiente y advierte si modifica
existencias o genera un archivo. Esa entrada divide el recorrido por grupo funcional y ofrece
guías específicas para administrador, almacén y usuarios de consultas y reportes.

Los identificadores, nombres, orden, casos de uso cubiertos y datos de prueba necesarios se
definen en el [inventario de capturas](screenshot-inventory.md). El inventario sigue el recorrido
real de las vistas y es la fuente para la automatización; no se deben agregar imágenes aisladas
sin incorporarlas también a esa secuencia.

## Solución de problemas

Consulte el [catálogo de mensajes de error](error-messages.md) para identificar cómo se presenta
cada tipo de fallo, qué información conservar y cuándo debe intentarse nuevamente la operación.

- Si una opción no aparece, solicite validar rol, departamento y permiso; no intente otra cuenta.
- Si una operación falla, conserve el mensaje y la referencia mostrada, y evite repetir una
  escritura hasta confirmar su estado.
- No incluya contraseñas, cookies ni datos personales en una captura de soporte.
