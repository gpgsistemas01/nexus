# 5. Volver a generar documentos existentes

No es necesario eliminar manualmente un resultado antes de ejecutar nuevamente los comandos:

- `npm run docs:export -- <paquete> <formato>` escribe los editables en
  `build/docs/docx/` y los PDF en `build/docs/pdf/`; reemplaza el archivo de la misma combinación de
  paquete y formato y conserva la caché de diagramas de `build/docs/diagrams/` para evitar
  conversiones repetidas;
- `npm run docs:architecture` vuelve a escribir los Markdown derivados que administra el
  generador;
- `npm run docs:screenshots -- --fresh` hace una limpieza completa después de validar la
  configuración. La ejecución sin esa opción conserva la secuencia ya completada y, si detecta un
  inventario parcial, reanuda desde la primera captura ausente.

Una exportación no elimina otros paquetes o formatos de `build/docs/`. Por ejemplo, volver a
generar `pdf/manuales/almacen/compras-de-material.pdf` no borra
`docx/manuales/almacen/compras-de-material.docx`. Separar las carpetas evita
mezclar entregables editables y finales y permite conservar ambos durante la revisión. Antes de
entregar, seleccione el archivo recién generado y, si va a compartir la carpeta completa, retire de
ella los resultados antiguos que no formen parte de la entrega. Nunca elimine los Markdown fuente
de `docs/` para regenerar un documento.

Para generar todos los documentos al mismo tiempo, use `todos`. El comando valida primero las
fuentes e imágenes de los seis paquetes y después crea cada archivo técnico o conjunto funcional:

```bash
npm run docs:export -- todos docx
```

El resultado no es un único documento combinado: los manuales se organizan en las carpetas
`manuales/administrador/` y `manuales/almacen/`; dentro de ellas se separan con los mismos grupos
funcionales de los casos de uso, salvo las salidas de material y de merma, que se entregan en
archivos independientes. Requisitos,
datos, arquitectura y pruebas permanecen como documentos independientes en `build/docs/docx/`.
Para generar los dos formatos, use `npm run docs:export -- todos ambos`; los PDF quedan en
`build/docs/pdf/` y los DOCX en `build/docs/docx/`, con la misma organización.
