# Flujo general de exportación

Para exportar `requisitos`, `datos`, `arquitectura` o `pruebas`:

1. Complete la [preparación de herramientas](#preparar-las-herramientas).
2. Desde la raíz del repositorio, valide fuentes, enlaces e imágenes sin generar un archivo:

   ```bash
   npm run docs:export -- <paquete> --check
   ```

3. Corrija cualquier referencia ausente y ejecute la exportación en el formato requerido:

   ```bash
   npm run docs:export -- <paquete> <docx|pdf>
   ```

4. Revise el DOCX creado en `build/docs/docx/` y, si eligió PDF, el archivo convertido en
   `build/docs/pdf/`. La portada se genera automáticamente y se conservan ambos formatos.

Si la entrega incluye toda la documentación, sustituya `<paquete>` por `todos` en los pasos 2 y
3. Antes debe comprobar también que las capturas requeridas por los dos manuales ya existan y
estén aprobadas. Actualizarlas es una acción independiente de la exportación.
