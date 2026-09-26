# 6. Flujo general de exportación

Para generar la entrega completa:

1. Complete la [preparación de herramientas](#preparar-las-herramientas).
2. Desde la raíz del repositorio, valide todas las fuentes, enlaces e imágenes sin generar archivos:

   ```bash
   npm run docs:export -- --check
   ```

3. Corrija cualquier referencia ausente y genere todos los DOCX y PDF:

   ```bash
   npm run docs:export
   ```

4. Revise el DOCX creado en `build/docs/docx/` y, si eligió PDF, el archivo convertido en
   `build/docs/pdf/`. La portada se genera automáticamente y se conservan ambos formatos. El
   exportador comprueba el estado de LibreOffice y valida que cada resultado tenga encabezado y
   cierre PDF; una salida ausente, truncada o con otro contenido se elimina y hace fallar el
   comando en vez de anunciarse como documento generado.

Antes debe comprobar también que las capturas requeridas por los dos manuales ya existan y estén
aprobadas. Actualizarlas es una acción independiente de la exportación. Para regenerar sólo una
parte o un formato durante la revisión, use
`npm run docs:export -- <paquete> <docx|pdf|ambos>`.
