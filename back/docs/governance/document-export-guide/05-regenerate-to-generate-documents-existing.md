# 5. Regenerar documentos existentes

Regenerar reemplaza sólo la salida elegida en `build/docs/docx/` o `build/docs/pdf/`.
Los Markdown originales permanecen en `docs/`. Los archivos generados no se versionan.

Si cambian rutas, imports o Prisma, ejecute `npm run docs:architecture` antes de
`npm run docs:check`. Después exporte el paquete afectado con `docs:export`.
