# 1. Estructura exportable

Cada paquete comienza con su título y tabla de datos generales. Las colecciones
usan el `index.md` de su familia; el contrato API comienza directamente en
`architecture/openapi/api-contract.md` y se publica como documento independiente.
Las fuentes curadas permanecen en su sección y `build/docs/` recibe los resultados
ignorados por Git. Los paquetes no dependen de archivos binarios versionados.
Antes de publicar, revise lo siguiente:

- un enlace o una imagen ausente hace fallar `--check`;
- Mermaid permanece como fuente Markdown; durante la exportación, el script entrega a Pandoc las
  imágenes PNG de los diagramas en lugar de copiar el código y conserva esos recursos generados
  bajo `build/docs/` para su revisión. Esto también aplica a una copia de trabajo de Windows que
  use finales de línea CRLF. Si un editor o una integración serializa accidentalmente todo el
  contenido de un bloque en una sola línea con secuencias literales `\n`, el exportador las
  restaura como saltos de línea antes de invocar Mermaid CLI;
- las figuras experimentales de participantes de secuencia se normalizan a participantes
  rectangulares durante la publicación, porque algunas versiones de Mermaid/Chromium producen
  coordenadas `NaN` o infinitas al rasterizarlas; el exportador también rechaza explícitamente esa
  geometría si Mermaid la reporta, en vez de incorporar una imagen dañada. Cada imagen reutilizable
  conserva una marca de validación; una imagen de una ejecución anterior que no tenga esa marca se
  vuelve a generar y no puede ocultar el error en una exportación posterior;
- una captura generada sólo se incorpora a la carpeta de publicación después de ser revisada y existir en la estación
  que ensambla el documento.

Las imágenes siguen el mismo criterio de pertenencia que los documentos y se organizan
como `<familia>/images/<sección>/NN-descripcion.ext`. Por ejemplo:

```text
docs/
├── requirements/
│   ├── index.md
│   └── images/casos-de-uso/
├── architecture/
│   └── images/componentes/
├── testing/
│   └── images/evidencias/
└── user-manual/
    ├── actors/
    │   ├── administrator.md
    │   └── warehouse.md
    └── images/areas/
```

Las carpetas de imágenes se crean al incorporar la primera imagen real. No se agregan
archivos binarios de relleno ni `.gitkeep`; cada imagen versionada debe estar referenciada
por un Markdown de su misma familia.
