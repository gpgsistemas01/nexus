# Volver a generar documentos existentes

No es necesario eliminar manualmente un resultado antes de ejecutar nuevamente los comandos:

- `npm run docs:export -- <paquete> <formato>` escribe los editables en
  `build/docs/docx/` y los PDF en `build/docs/pdf/`; reemplaza el archivo de la misma combinación de
  paquete y formato y conserva la caché de diagramas de `build/docs/diagrams/` para evitar
  conversiones repetidas;
- `npm run docs:architecture` vuelve a escribir los Markdown derivados que administra el
  generador;
- `npm run docs:screenshots` es el único flujo que hace una limpieza completa: después de validar
  la configuración, elimina automáticamente `docs/user-manual/images/` y genera de nuevo todo el
  inventario. No elimine esa carpeta por separado ni intente conservar capturas parciales.

Una exportación no elimina otros paquetes o formatos de `build/docs/`. Por ejemplo, volver a
generar `pdf/manual-almacen.pdf` no borra `docx/manual-almacen.docx`. Separar las carpetas evita
mezclar entregables editables y finales y permite conservar ambos durante la revisión. Antes de
entregar, seleccione el archivo recién generado y, si va a compartir la carpeta completa, retire de
ella los resultados antiguos que no formen parte de la entrega. Nunca elimine los Markdown fuente
de `docs/` para regenerar un documento.

Para generar todos los documentos al mismo tiempo, use `todos`. El comando valida primero las
fuentes e imágenes de los seis paquetes y después crea un archivo independiente por paquete:

```bash
npm run docs:export -- todos docx
```

El resultado no es un único documento combinado: los dos manuales por actor, requisitos, datos,
arquitectura y pruebas se crean dentro de `build/docs/docx/`. Para generar los seis PDF, use
`npm run docs:export -- todos pdf`; los PDF quedan en `build/docs/pdf/` y también se conservan
los seis DOCX intermedios.
