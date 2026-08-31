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

La captura se incorpora después de ejecutar `npm run docs:screenshots` en un entorno de prueba.
Su ruta esperada es `docs/manual-usuario/images/acceso/01-login.png`; no se versiona una imagen
de relleno. El archivo Markdown sólo debe referenciarla cuando exista una captura real y
revisada, para no bloquear la exportación ni introducir binarios ficticios.

## Módulos

Las secciones de entradas, salidas, inventario, materiales, mermas, clientes, proveedores,
personas y usuarios se documentarán con la secuencia **propósito → precondiciones → recorrido
principal → alternativas → errores → resultado**. Cada acción debe referenciar una captura
estable y advertir si modifica existencias o genera un archivo.

## Solución de problemas

- Si una opción no aparece, solicite validar rol, departamento y permiso; no intente otra cuenta.
- Si una operación falla, conserve el mensaje y la referencia mostrada, y evite repetir una
  escritura hasta confirmar su estado.
- No incluya contraseñas, cookies ni datos personales en una captura de soporte.
