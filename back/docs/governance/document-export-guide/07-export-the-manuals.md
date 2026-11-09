# 7. Exportar los manuales Vue

Los manuales, cuentas, capturas y archivos de publicación pertenecen a `front/`.
Desde la raíz se ejecuta `npm --prefix front run docs:manuals -- --profile <id>`;
para todas las cuentas configuradas, `npm --prefix front run docs:manuals -- --all`.
Los archivos de cuentas y credenciales son locales e ignorados por Git.

La captura usa una sesión autorizada del entorno de prueba y bloquea escrituras.
La preparación de imágenes no crea operaciones para simular datos. Cada cuenta
conserva imágenes completas de su revisión y reanuda las pendientes.

Consulte [manuales por acceso](../../../../front/docs/governance/06-manuals-by-access.md)
y los [comandos vigentes](../../../../front/docs/development/00-commands.md).
