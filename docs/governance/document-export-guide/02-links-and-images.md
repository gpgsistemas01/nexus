# 2. Enlaces e imágenes

Las referencias y los hipervínculos se declaran en los Markdown fuente, no se agregan manualmente
después de crear el DOCX. Así una sola fuente conserva la misma navegación en el repositorio,
DOCX y PDF. Se aplican estas reglas:

| Recurso | Qué debe declararse en el Markdown | Qué no debe declararse |
| --- | --- | --- |
| Imagen versionada, incluida una captura | `![texto alternativo](ruta/relativa.png)` dentro de la sección que la explica. | Una ruta absoluta de la estación de trabajo o un enlace a la propia imagen. |
| Diagrama Mermaid | Un encabezado descriptivo seguido de un bloque cercado `mermaid`. El encabezado es la referencia y se convierte en la leyenda al exportar. | Una ruta hacia el PNG generado: ese archivo no existe en las fuentes versionadas y lo crea el exportador bajo `build/docs/diagrams/`. |
| Referencia hacia otra sección del mismo archivo | Un enlace Markdown al ancla, por ejemplo `[preparación](#preparar-las-herramientas)`. | Una ruta al archivo fuente. |
| Referencia hacia otro Markdown incluido en el paquete | Un enlace Markdown relativo, por ejemplo `[casos de uso](requirements/use-cases/index.md)`. El exportador lo convierte en una referencia interna única al ensamblar el paquete. | Un enlace hacia el archivo `.md` dentro del DOCX o PDF. |
| Sitio externo | Una URL absoluta `https://` o un enlace `mailto:`. | Una ruta local o dependiente de la estación de trabajo. |
| Markdown, código u otro recurso local no incluido en el paquete | Puede conservar el enlace relativo en la fuente para navegar por el repositorio; al exportar se presenta sólo su etiqueta. | Un hipervínculo que el lector del DOCX o PDF no pueda abrir. |

- los enlaces hacia otro Markdown, código o imagen del repositorio usan rutas **relativas al
  archivo que contiene el enlace**; así funcionan en el repositorio, en otros clones y durante la
  validación;
- sólo los sitios externos usan URL absolutas `https://`;
- un hipervínculo se conserva en el documento exportado sólo cuando su destino también forma parte
  del paquete, es una sección del mismo documento o es un sitio externo. El exportador convierte la
  ruta relativa en un ancla única del paquete antes de ensamblar las fuentes; los enlaces locales
  hacia fuentes no incluidas se convierten en texto para no publicar destinos `.md`, rutas de código
  o referencias que dependan del repositorio;
- las imágenes y los diagramas renderizados sí deben tener una **referencia documental**: texto
  alternativo o leyenda que identifique la figura y una mención dentro de la sección que la
  explica. El exportador reúne esas leyendas en un **Índice de imágenes** navegable; no debe
  envolverse la imagen en otro enlace sólo para abrir el archivo;
- los diagramas Mermaid no usan instrucciones `click`: la navegación hacia otro documento se
  expresa con un enlace Markdown junto al diagrama, porque esos enlaces internos de Mermaid no
  funcionan de manera uniforme en DOCX y PDF.

`docs:export -- <paquete> <formato> --check` comprueba que las rutas locales declaradas existan y
rechaza rutas locales absolutas en enlaces e imágenes. Durante la exportación, el script puede
usar rutas absolutas únicamente dentro de su copia temporal para que Pandoc encuentre los
recursos; esas rutas no se escriben en los Markdown originales. DOCX y PDF incorporan las imágenes
dentro del documento final.

Para los bloques Mermaid, el exportador toma el encabezado Markdown más cercano y lo convierte en
la leyenda de la figura; para las capturas, el texto alternativo conserva el identificador
`CAP-*` y la operación mostrada. Pandoc utiliza esas leyendas como figuras en DOCX y PDF. Al
generar DOCX, el exportador crea una tabla de contenido y un **Índice de imágenes** estáticos y
navegables a partir de los títulos y leyendas preparados; no deja campos pendientes de
actualización al abrir el archivo en Word. Las leyendas se numeran de forma correlativa como
`Figura N. …` para que el mismo identificador y número se publiquen en DOCX y PDF, sin depender
de campos `SEQ` de Word. El PDF conserva los índices materializados primero en el DOCX. Los enlaces
Markdown entre fuentes del mismo paquete se resuelven durante el ensamblado y
quedan como hipervínculos internos: el artefacto publicado no navega hacia archivos `.md`.

Por tanto, las imágenes que existen como archivos sí tienen una referencia
`![descripción](ruta/relativa.png)` dentro del
Markdown. Los diagramas Mermaid no tienen una referencia a una imagen PNG en el Markdown: su
referencia versionada es el encabezado más el bloque Mermaid, y la referencia al PNG se crea sólo
en la copia temporal de exportación. El PNG visual queda en `build/docs/diagrams/` y su código
Mermaid se guarda por separado en `build/docs/diagram-sources/`; ambos usan el mismo identificador.
`--check` valida los contratos de las fuentes y rechaza una imagen sin texto alternativo o un bloque
Mermaid sin encabezado.

#### Carpetas técnicas de diagramas

Estas dos carpetas no contienen documentos adicionales ni entregables para el usuario:

```text
build/docs/
├── diagrams/          # Imágenes PNG renderizadas e insertadas en DOCX y PDF.
└── diagram-sources/   # Copias .mmd del código Mermaid usado para crear cada PNG.
```

- `diagram-sources/` permite revisar exactamente qué código recibió Mermaid CLI después de
  normalizar los saltos de línea del bloque Markdown;
- `diagrams/` conserva el resultado visual para revisarlo y reutilizarlo cuando el mismo diagrama
  vuelva a aparecer en otra exportación;
- el nombre hexadecimal compartido relaciona cada archivo `.mmd` con su correspondiente `.png` y
  se calcula desde el contenido del diagrama;
- ambas carpetas son resultados regenerables bajo `build/`, están ignoradas por Git y no deben
  enviarse como parte del paquete documental. Pueden eliminarse cuando no se necesite la caché; la
  siguiente exportación con diagramas las volverá a crear.
