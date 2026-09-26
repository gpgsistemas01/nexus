# 1. Estructura exportable

La estructura actual es válida para exportar: cada paquete comienza en el `index.md` de
su propia familia, las fuentes curadas permanecen junto a esa entrada y `build/docs/` recibe los
resultados ignorados por Git. El paquete de
requisitos comienza en `requirements/index.md`, no en una carpeta genérica de
publicaciones. Los paquetes no dependen de archivos binarios versionados. Antes de
publicar, todavía se debe revisar lo siguiente:

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
  geometría si Mermaid la reporta, en vez de incorporar una imagen dañada;
- una captura generada sólo se referencia después de ser revisada y existir en la estación
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
    ├── index.md
    └── images/entradas/
```

Las carpetas de imágenes se crean al incorporar la primera imagen real. No se agregan
archivos binarios de relleno ni `.gitkeep`; cada imagen versionada debe estar referenciada
por un Markdown de su misma familia.
