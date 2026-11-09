# 7. Exportar los manuales Vue

Los manuales, cuentas, capturas y archivos de publicación pertenecen a `front/`.
Desde la raíz se captura primero con
`npm --prefix front run docs:screenshots -- --profile <id>` y después se exporta con
`npm --prefix front run docs:manuals -- --profile <id>`. Use `--all` en lugar de
`--profile <id>` para procesar las cuentas configuradas.
Los archivos de cuentas y credenciales son locales e ignorados por Git.

La captura usa una sesión autorizada del entorno de prueba y bloquea escrituras.
La preparación de imágenes no crea operaciones para simular datos. Cada cuenta
conserva imágenes completas de su revisión y reanuda las pendientes.
La exportación sólo utiliza fuentes y capturas ya verificadas, sin abrir navegador,
iniciar servicios ni leer credenciales. Si una edición existente está incompleta,
se resuelve con el comando de capturas antes de volver a exportar.

Consulte [manuales por acceso](../../../../front/docs/governance/06-manuals-by-access.md)
y los [comandos vigentes](../../../../front/docs/development/00-commands.md).
