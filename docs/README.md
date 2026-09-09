# Documentación de Nexus

Usa este índice para localizar la fuente de verdad de cada tema. El `README.md` de la
raíz se limita a instalación y operación básica.

## Organización de los artefactos

La documentación se organiza por **familias**. Cada familia tiene un artefacto principal,
que define la intención o la regla vigente, y artefactos complementarios, que amplían una
vista concreta sin sustituirlo. Los artefactos generados son evidencia técnica de una
fuente versionada; pertenecen a una familia, pero no contienen decisiones curadas.

Cada familia tiene una carpeta propia para que su ubicación también comunique su
responsabilidad. Como rutas técnicas del repositorio, los nombres de estas carpetas se
mantienen en inglés; los títulos, el contenido y los nombres de los paquetes exportables se
presentan en español:

```text
docs/
├── architecture/  # Arquitectura, construcción y convenciones técnicas
├── data/          # Datos persistentes, acceso y permisos
├── governance/    # Criterios para mantener la documentación
├── user-manual/   # Entrada, capítulos e imágenes del manual
├── requirements/  # Entrada, requisitos, casos de uso e imágenes
├── styles/        # Estilos y plantillas de publicación
├── testing/       # Estrategia, cobertura y plan de pruebas CRUD
└── generated/     # Inventarios derivados; no se editan manualmente
```

| Familia | Artefacto principal | Artefactos complementarios | Evidencia generada |
| --- | --- | --- | --- |
| Arquitectura y construcción | [Índice de arquitectura y construcción](architecture/index.md) | [Descripción de arquitectura](architecture/architecture-and-web-views.md), [contrato API](architecture/api-contract.md), [navegación y catálogo web](architecture/web-navigation-and-screen-catalog.md), [guía técnica común](architecture/technical-code-documentation.md), referencias de [backend](architecture/backend-technical-documentation.md) y [frontend](architecture/frontend-technical-documentation.md), secuencias de ejecución por caso del [backend](architecture/backend-code-sequences/index.md) y [frontend](architecture/frontend-code-sequences/index.md), [decisiones](architecture/decisions/index.md), [diagramas vigentes del código](architecture/code-diagrams.md), [inventario de diagramas](architecture/diagram-inventory.md), [trazabilidad técnica](architecture/traceability-matrix.md), [patrones aplicados](architecture/design-and-construction-patterns.md), [estándar de codificación](architecture/coding-standards.md) y [convenciones de diagramas](architecture/diagram-conventions.md) | [Mapa del código](generated/code-map.md), derivado de rutas e importaciones de `src` |
| Dominio y requisitos | [Índice y portada del paquete](requirements/index.md); la [especificación](requirements/requirements-specification.md) es la fuente normativa | [Visión y alcance](requirements/vision-scope-and-requirements.md), [dominio y casos de uso](requirements/domain-and-use-cases.md), [catálogo de casos de uso](requirements/use-case-descriptions.md), [matriz de operaciones](requirements/requirements-operations-matrix.md), [diagramas de requisitos](requirements/requirements-diagrams.md) y [glosario](requirements/business-glossary.md) | No aplica; el estado funcional requiere revisión humana |
| Datos, acceso y operación | [Mapa de datos, persistencia y acceso](data/index.md) | [Análisis de usuarios y permisos](data/database-users-and-permissions-analysis.md) y [roles PostgreSQL](data/postgresql-runtime-and-migration-roles.md) | [Esquema de base de datos](generated/database-schema.md) y [diccionario técnico](generated/data-dictionary.md), derivados de `prisma/schema.prisma` |
| Pruebas | [Estrategia de pruebas](testing/service-test-coverage.md) | [Plan de pruebas](testing/test-plan.md), [ambiente, estrategia y catálogo unitario](testing/unit-test-catalog.md), y [resultados unitarios](testing/unit-test-results.md) de la última ejecución verificada | La evidencia ejecutable vive en `tests`; el catálogo y el resumen versionado complementan la salida de Vitest/CI |
| Gobierno documental | [Normas y criterios](governance/documentation-standards.md) | [Buenas prácticas de organización](governance/documentation-practices.md), [registro de aplicación de normas](governance/standards-application.md) y [convenciones de diagramas](architecture/diagram-conventions.md), compartidas también con arquitectura | No aplica |

La [guía de publicación y versionado](governance/publication-and-versioning.md) define
portadas, formatos, idioma, capturas, paquetes exportables y la relación entre las
versiones del sistema y del documento. `requirements/index.md` y
`user-manual/index.md` son las entradas de sus paquetes; fijan el orden de exportación
sin separar la portada de la familia documental a la que pertenece.

Un artefacto puede apoyar más de una familia, pero conserva una sola responsabilidad. Por
ejemplo, las convenciones de diagramas gobiernan la notación y no reemplazan los diagramas
de arquitectura o requisitos. Del mismo modo, el esquema y el diccionario pertenecen a la
familia de datos: complementan el análisis curado, mientras Prisma conserva la fuente
técnica de modelos, campos y relaciones.

### Tipos de mantenimiento

| Tipo | Ubicación | Fuente de verdad | Forma de actualización |
| --- | --- | --- | --- |
| Curado | `docs/{architecture,data,governance,requirements,testing}/*.md` | Decisiones, requisitos y comportamiento revisado | Se edita junto con el cambio que altera su contenido. |
| Generado | `docs/generated/*.md` | `src` o `prisma/schema.prisma`, según la familia indicada arriba | `npm run docs:architecture`; no se edita manualmente. |
| Ejecutable | `tests` | Casos automatizados y datos de prueba | Sigue la ubicación y las estrategias definidas por la familia de pruebas. |
| Operativo | `README.md`, configuración y scripts | Código y configuración versionados | Se actualiza cuando cambia la instalación, ejecución o automatización. |

## Regla de actualización

1. Cambios en routers, imports o Prisma: ejecutar `npm run docs:architecture`.
2. Cambios de diseño, comportamiento o decisiones: editar el documento curado
   correspondiente.
3. Antes de enviar un cambio: ejecutar `npm run docs:check`. CI valida la solicitud de
   cambio y, después de fusionarla, regenera y versiona el mapa de código, el esquema de
   base de datos y el diccionario técnico en `main` si fuera necesario.
4. Antes de publicar: validar el paquete con
   `npm run docs:export -- <paquete> --check`; generar DOCX o PDF sólo en desarrollo/CI.
   Las capturas se actualizan mediante `npm run docs:screenshots` con un
   entorno y una sesión de prueba preparados.

No se duplica el catálogo de rutas en documentos manuales: su fuente es el mapa
generado. Los diagramas curados explican intención y no deben generarse fingiendo que
el código puede inferir decisiones de arquitectura.

## Exportar la documentación

Esta guía vive aquí —y no en el `README.md` raíz— porque Pandoc, las plantillas y los
motores PDF son herramientas del flujo documental, no requisitos para ejecutar Nexus.
La exportación y la generación de capturas se ejecutan sólo en desarrollo o CI y por eso
sus comandos se mantienen fuera de la guía operativa de la aplicación.

Pandoc y Playwright intervienen en etapas distintas y ninguno sustituye al otro:

| Herramienta | Finalidad | Comando del proyecto |
| --- | --- | --- |
| Node.js y dependencias (`npm ci`) | Ejecutan los scripts del repositorio. | Todos los comandos `npm run docs:*`. |
| Playwright y Chromium (instalación automática) | Abren Nexus y generan las capturas del manual. Sólo se necesitan al actualizar imágenes. | `npm run docs:screenshots` |
| Mermaid CLI (instalación opcional) | Convierte cada bloque Mermaid en una imagen temporal para la exportación. | Lo invoca automáticamente `docs:export` cuando el paquete contiene diagramas. |
| Pandoc (herramienta del sistema) | Ensambla el Markdown y las imágenes existentes y convierte la navegación del paquete en hipervínculos internos. Para DOCX, el exportador materializa la tabla de contenido y el índice de imágenes antes de invocarlo; para PDF, Pandoc los compone con el motor configurado. | `npm run docs:export -- <paquete> <formato>` |
| XeLaTeX u otro motor PDF (herramienta del sistema) | Compone el PDF solicitado por Pandoc; no se necesita para DOCX. | Sólo `docs:export` con formato `pdf`. |

Una extensión de Playwright para Visual Studio Code tampoco reemplaza estas herramientas: puede
facilitar la ejecución desde el editor, pero el script de capturas requiere el paquete `playwright`
y la exportación final continúa requiriendo el ejecutable `pandoc`.

Al generar capturas, el comando instala temporalmente el paquete de Node.js si no está disponible y
comprueba la instalación del ejecutable de Chromium compatible. No modifica `package.json` ni
`package-lock.json`. No se instala una extensión dentro del navegador habitual ni es suficiente
con instalar la extensión de Playwright para Visual Studio Code.

### Estructura exportable

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
- PDF requiere un motor adicional a Pandoc;
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

### Enlaces e imágenes

Las referencias y los hipervínculos se declaran en los Markdown fuente, no se agregan manualmente
después de crear el DOCX. Así una sola fuente conserva la misma navegación en el repositorio,
DOCX y PDF. Se aplican estas reglas:

| Recurso | Qué debe declararse en el Markdown | Qué no debe declararse |
| --- | --- | --- |
| Imagen versionada, incluida una captura | `![texto alternativo](ruta/relativa.png)` dentro de la sección que la explica. | Una ruta absoluta de la estación de trabajo o un enlace a la propia imagen. |
| Diagrama Mermaid | Un encabezado descriptivo seguido de un bloque cercado `mermaid`. El encabezado es la referencia y se convierte en la leyenda al exportar. | Una ruta hacia el PNG generado: ese archivo no existe en las fuentes versionadas y lo crea el exportador bajo `build/docs/diagrams/`. |
| Referencia hacia otra sección del mismo archivo | Un enlace Markdown al ancla, por ejemplo `[preparación](#preparar-las-herramientas)`. | Una ruta al archivo fuente. |
| Referencia hacia otro Markdown incluido en el paquete | Un enlace Markdown relativo, por ejemplo `[casos de uso](requirements/use-case-descriptions.md)`. El exportador lo convierte en una referencia interna única al ensamblar el paquete. | Un enlace hacia el archivo `.md` dentro del DOCX o PDF. |
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
de campos `SEQ` de Word. En PDF, Pandoc y el motor configurado componen ambos índices. Los enlaces
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

### Preparar las herramientas

Estos comandos pueden ejecutarse desde la terminal integrada de Visual Studio Code
(`Terminal` > `New Terminal`), abierta en la raíz del repositorio. Visual Studio Code no instala
Pandoc por sí mismo: la instalación se realiza en el mismo sistema, contenedor o entorno remoto
donde se ejecutará `npm run docs:export`.

Antes de copiar un bloque, identifique la terminal activa. Si el prompt comienza con `PS`, está en
**PowerShell** y debe usar `$env:NOMBRE = "valor"`. La instrucción `export NOMBRE=valor` pertenece
sólo a **Bash** y produce el error “`export` no se reconoce como nombre de un cmdlet” cuando se pega
en PowerShell. No mezcle líneas de ambos bloques.

Existen extensiones de Visual Studio Code que integran funciones de Pandoc, pero son opcionales y
no sustituyen la instalación requerida por este proyecto. `npm run docs:export` ejecuta el comando
`pandoc` directamente, por lo que el ejecutable debe estar disponible en la terminal mediante
`PATH`; una extensión sólo puede usarse como complemento para trabajar desde el editor.

1. Desde la raíz del repositorio, instala la versión de Node.js indicada en `package.json`
   y ejecuta `npm ci`.
2. Instala [Pandoc](https://pandoc.org/installing.html) en el sistema donde está abierta la
   terminal de Visual Studio Code y comprueba `pandoc --version`:
   - **Windows:** descarga y ejecuta el instalador oficial de Pandoc; después cierra y vuelve a
     abrir la terminal integrada. Windows no utiliza `sudo`.
   - **Debian o Ubuntu:** ejecuta `sudo apt-get install pandoc`. Si la cuenta no dispone de
     `sudo`, solicita la instalación al administrador del equipo.
3. Instala Mermaid CLI en la estación que realiza la exportación:

   ```bash
   npm install --no-save @mermaid-js/mermaid-cli
   ```

   El exportador detecta los bloques `mermaid`, incorpora las imágenes PNG al documento y conserva
   una copia visual en `build/docs/diagrams/`. El código empleado para generar cada imagen queda en
   `build/docs/diagram-sources/`, separado de los PNG. Las fuentes Markdown no se modifican. Si el
   paquete no contiene diagramas, esta herramienta no se invoca. Los nombres se derivan del
   contenido de cada diagrama: una exportación posterior reutiliza los PNG que ya coincidan y sólo
   convierte diagramas nuevos o modificados. Para forzar su regeneración completa, elimina
   `build/docs/diagrams/` antes de exportar.
4. DOCX no requiere otra herramienta. Para PDF, Pandoc necesita un programa que componga
   el PDF desde la terminal; Adobe Acrobat o Adobe Reader sirven para abrir el resultado, pero no
   realizan esa composición para este script. **XeLaTeX no es el único motor compatible**: es la
   opción recomendada por el proyecto porque maneja Unicode y texto en español directamente, está
   disponible mediante distribuciones mantenidas para Windows, Linux y macOS, y permite que todas
   las estaciones usen el mismo motor en vez de depender del predeterminado local de Pandoc.
   Instálalo en el mismo sistema donde se ejecutará Pandoc:

   - **Windows:** XeLaTeX se instala **en Windows, no dentro de este repositorio, npm, VS Code ni
     Playwright**. Descarga el instalador oficial
     [`install-tl-windows.exe`](https://mirror.ctan.org/systems/texlive/tlnet/install-tl-windows.exe),
     ejecútalo y conserva una
     instalación de TeX Live que incluya XeLaTeX. El instalador crea una carpeta del sistema como
     `C:\texlive\<versión>\` y agrega su subcarpeta `bin\windows` a `PATH`; no copies esos archivos
     dentro de `SistemaMerma`. Al terminar, cierra **todas** las terminales de VS Code, abre una
     terminal PowerShell nueva en el repositorio y ejecuta `xelatex --version`. Si PowerShell aún
     no encuentra el comando, reinicia VS Code y revisa que
     `C:\texlive\<versión>\bin\windows` esté en la variable `PATH` de Windows.
   - **Debian o Ubuntu:** ejecuta `sudo apt-get install texlive-xetex`. Si la cuenta no dispone de
     `sudo`, solicita la instalación al administrador del equipo.
   - **macOS:** descarga e instala [MacTeX](https://tug.org/mactex/mactex-download.html) y vuelve a
     abrir la terminal.

   Si la estación ya tiene otro motor admitido por Pandoc, puede reutilizarlo: no es obligatorio
   instalar XeLaTeX. Por ejemplo, una instalación existente de `pdflatex`, `lualatex` o `tectonic`
   se selecciona asignando ese nombre a `DOCS_PDF_ENGINE`. Primero compruebe que su ejecutable
   responda desde la misma terminal:

   ```powershell
   # Ejemplo en PowerShell si pdflatex ya está instalado
   pdflatex --version
   $env:DOCS_PDF_ENGINE = "pdflatex"
   npm run docs:export -- todos pdf
   ```

   El proyecto recomienda XeLaTeX para mantener un resultado reproducible, pero el exportador no
   fija ese nombre: valida y pasa a Pandoc el ejecutable indicado en `DOCS_PDF_ENGINE`. Cambiar de
   motor puede modificar tipografías, saltos de página o requerir paquetes propios de la
   distribución elegida, por lo que el PDF resultante debe revisarse antes de publicarlo.

   En todos los casos, comprueba la instalación con `xelatex --version`. Al ejecutar una
   exportación PDF, indica explícitamente al script cuál motor debe usar para que Pandoc no dependa
   del motor predeterminado de cada estación. `DOCS_PDF_ENGINE` es obligatorio para exportar PDF;
   así el script no intenta usar implícitamente `pdflatex` en una estación donde no está instalado.
   Define la variable en la misma terminal desde la que se
   ejecuta `docs:export`; no se agrega al código ni es necesario guardarla en `.env`:

   ```powershell
   # PowerShell (Windows)
   xelatex --version
   $env:DOCS_PDF_ENGINE = "xelatex"
   npm run docs:export -- todos pdf
   ```

   ```bash
   # Bash (Linux, macOS o contenedor)
   DOCS_PDF_ENGINE=xelatex npm run docs:export -- <paquete> pdf
   ```

   El error `'pdflatex' not found` no significa que el documento requiera específicamente
   `pdflatex`: significa que Pandoc intentó usar ese motor predeterminado y no encontró su
   ejecutable. No se corrige instalando Playwright. Puede instalar el XeLaTeX recomendado o usar
   otro motor que ya tenga instalado, definir su nombre en `DOCS_PDF_ENGINE` y repetir el comando
   con el separador `--` de npm. Si sólo necesita el documento editable, genere `docx`, que no
   requiere un motor PDF.

   En PowerShell la variable permanece durante esa sesión de terminal; puede retirarla después con
   `Remove-Item Env:DOCS_PDF_ENGINE`. En Bash, la asignación mostrada sólo aplica a ese comando.
   Sustituye `<paquete>` por un valor de la tabla siguiente, por ejemplo `todos`.

5. Valida siempre el paquete con `--check` antes de generar el archivo.

La portada **ya se genera** con `title`, `subtitle`, `author` y `date` del encabezado YAML del
primer Markdown de cada paquete; esos datos pueden variar sin crear una plantilla. Un DOCX también
se genera directamente sin definir `DOCS_REFERENCE_DOC`. Esa variable es opcional y sólo se usa
si la organización ya dispone de un archivo `.docx` de referencia para aplicar tipografías,
márgenes, encabezados o estilos corporativos al resultado; no contiene ni reemplaza los datos de
la portada.

### Comandos

En los comandos, `<paquete>` significa **qué contenido se va a reunir en un solo archivo**. No es
un paquete de npm. Elija uno de estos valores:

| Valor de `<paquete>` | Contenido generado | Cuándo usarlo |
| --- | --- | --- |
| `manual-usuario` | Manual completo con todos los grupos funcionales, referencias e inventario de capturas. | Para publicar el manual general. |
| `manual-administrador` | Acceso, identidad, catálogos y reportes disponibles para Sistemas. | Para personal administrador del sistema. |
| `manual-almacen` | Acceso, catálogos, compras, salidas y reportes operativos. | Para personal de almacén y proveeduría. |
| `manual-reportes` | Acceso, consultas y exportaciones de catálogos, compras, salidas y movimientos. | Para usuarios que sólo consultan o generan reportes. |
| `requisitos` | Especificación y trazabilidad de requisitos. | Para revisión funcional. |
| `datos` | Mapa de datos, decisiones de acceso, esquema y diccionario técnico generados. | Para revisar persistencia y acceso a los datos. |
| `arquitectura` | Diseño, documentación técnica y contrato API con estructuras JSON y validaciones. | Para revisión técnica y de integraciones HTTP. |
| `pruebas` | Plan, cobertura, catálogo y resultados de pruebas. | Para evidencia de calidad. |
| `todos` | Los ocho documentos anteriores, cada uno en su propio archivo. | Para preparar una entrega documental completa con un solo comando. |

Los paquetes específicos por actor reutilizan las secciones del manual completo y omiten las que
no corresponden a ese recorrido. Los formatos de entrega admitidos son `docx` y `pdf`; Markdown
permanece como fuente navegable y por eso no se genera una copia HTML equivalente.

### Volver a generar documentos existentes

No es necesario eliminar manualmente un resultado antes de ejecutar nuevamente los comandos:

- `npm run docs:export -- <paquete> <formato>` escribe siempre en
  `build/docs/<paquete>.<formato>` y reemplaza el archivo de esa misma combinación de paquete y
  formato; conserva la caché de diagramas de `build/docs/diagrams/` para evitar conversiones
  repetidas;
- `npm run docs:architecture` vuelve a escribir los Markdown derivados que administra el
  generador;
- `npm run docs:screenshots` es el único flujo que hace una limpieza completa: después de validar
  la configuración, elimina automáticamente `docs/user-manual/images/` y genera de nuevo todo el
  inventario. No elimine esa carpeta por separado ni intente conservar capturas parciales.

Una exportación no elimina otros paquetes o formatos de `build/docs/`. Por ejemplo, volver a
generar `manual-usuario.pdf` no borra un `manual-usuario.docx` anterior. Esto permite conservar
varios formatos durante la revisión; antes de entregar, seleccione el archivo recién generado y,
si va a compartir la carpeta completa, retire de ella los resultados antiguos que no formen parte
de la entrega. Nunca elimine los Markdown fuente de `docs/` para regenerar un documento.

Para generar todos los documentos al mismo tiempo, use `todos`. El comando valida primero las
fuentes e imágenes de los ocho paquetes y después crea un archivo independiente por paquete:

```bash
npm run docs:export -- todos docx
```

El resultado no es un único documento combinado: se crean los cuatro manuales, requisitos, datos,
arquitectura y pruebas dentro de `build/docs/`. Para generar los ocho PDF, prepare XeLaTeX y use
`DOCS_PDF_ENGINE=xelatex npm run docs:export -- todos pdf`.

### Flujo general de exportación

Para exportar `requisitos`, `datos`, `arquitectura` o `pruebas`:

1. Complete la [preparación de herramientas](#preparar-las-herramientas): dependencias de
   Node.js, Pandoc y, sólo para PDF, un motor PDF.
2. Desde la raíz del repositorio, valide fuentes, enlaces e imágenes sin generar un archivo:

   ```bash
   npm run docs:export -- <paquete> --check
   ```

3. Corrija cualquier referencia ausente y ejecute la exportación en el formato requerido:

   ```bash
   npm run docs:export -- <paquete> <docx|pdf>
   ```

4. Revise el resultado creado en `build/docs/`. La portada se genera automáticamente. Si eligió
   PDF, use `DOCS_PDF_ENGINE=xelatex` como se indicó en la preparación.

Si la entrega incluye toda la documentación, sustituya `<paquete>` por `todos` en los pasos 2 y
3. Antes debe comprobar también que las capturas requeridas por los cuatro manuales ya existan y
estén aprobadas. Actualizarlas es una acción independiente de la exportación.

### Exportar los manuales

Los paquetes `manual-usuario`, `manual-administrador`, `manual-almacen` y `manual-reportes`
incluyen capturas de la aplicación, pero `docs:export` **no toma capturas ni abre Nexus**. Antes de
exportar uno de esos paquetes se requieren:

- las dependencias de Node.js y Pandoc indicadas en [Preparar las herramientas](#preparar-las-herramientas);
- un motor PDF sólo cuando el formato solicitado sea PDF;
- todos los Markdown del paquete actualizados;
- todas las imágenes referenciadas presentes en `docs/user-manual/images/`, revisadas y
  correspondientes a la versión del manual.

Si se cumplen esos requisitos, no necesita una base de datos, una sesión ni Playwright para
exportar. Valide y genere el manual:

```bash
npm run docs:export -- manual-usuario --check
npm run docs:export -- manual-usuario docx
```

Sustituya `manual-usuario` por el paquete de actor y `docx` por `pdf` cuando corresponda. Si falta una
imagen, `--check` detiene el proceso; en ese caso ejecute primero el flujo independiente siguiente.

### Actualizar las capturas del manual

Este flujo sólo se ejecuta en un clon sin las imágenes requeridas o cuando una pantalla cambió.
Su resultado son archivos PNG revisables en `docs/user-manual/images/`; **no genera DOCX ni PDF**.
Después de aprobar las imágenes, vuelva a [Exportar los manuales](#exportar-los-manuales).

El comando `npm run docs:screenshots` automatiza el ciclo de la aplicación: comprueba
`DOCS_BASE_URL`, inicia una instancia temporal de Nexus cuando no existe una, espera a que responda,
ejecuta el mismo inventario de capturas y detiene únicamente la instancia que inició. Si Nexus ya
está disponible, la reutiliza y no la detiene. La base con datos ficticios y las credenciales siguen
siendo prerrequisitos explícitos, porque el comando no debe crear datos ni guardar secretos.
Playwright y Chromium se preparan automáticamente en el mismo entorno antes de iniciar Nexus.

1. Prepare una base de prueba con los permisos y registros ficticios de
   [Datos de prueba requeridos](user-manual/screenshot-inventory.md#datos-de-prueba-requeridos).
   No utilice producción ni datos personales reales.
2. Complete la [configuración inicial de Nexus](../README.md#configuración-inicial). El comando
   automático puede iniciar y detener Nexus; si prefiere inspeccionar sus logs en otra terminal,
   inicie la aplicación manualmente:

   ```powershell
   # Terminal 1, PowerShell o Bash
   npm run dev
   ```

   Mantenga esta terminal abierta y espere el mensaje `Servidor escuchando en puerto 3000`.
3. El comando automático comprueba la página de inicio de sesión y espera hasta 30 segundos cuando
   inicia Nexus. Si administra la aplicación manualmente, abra la terminal 2 y compruébela antes de
   continuar:

   ```powershell
   # Terminal 2, PowerShell
   Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:3000/inicio-sesion"
   ```

   ```bash
   # Terminal 2, Bash
   curl --fail http://127.0.0.1:3000/inicio-sesion
   ```

   Si Nexus usa otro puerto, sustitúyalo en esta URL y después en `DOCS_BASE_URL`.
4. En la terminal 2, defina `DOCS_BASE_URL` y las credenciales de una cuenta ficticia. Elija **un
   solo bloque** y no agregue `/inicio-sesion` a `DOCS_BASE_URL`.

   ```powershell
   # PowerShell
   $env:DOCS_BASE_URL = "http://127.0.0.1:3000"
   $env:DOCS_LOGIN_NAME = "usuario-ficticio"
   $env:DOCS_LOGIN_PASSWORD = "contraseña-ficticia"
   ```

   ```bash
   # Bash
   export DOCS_BASE_URL=http://127.0.0.1:3000
   export DOCS_LOGIN_NAME=usuario-ficticio
   export DOCS_LOGIN_PASSWORD='contraseña-ficticia'
   ```

   No guarde estas credenciales en `.env` ni en archivos del repositorio. Como alternativa, defina
   sólo `DOCS_STORAGE_STATE`; no mezcle ambos mecanismos.
5. Genere las capturas. El mismo comando incluye la comprobación, el arranque y la detención de
   Nexus en el proceso:

   ```bash
   npm run docs:screenshots
   ```

   Si Nexus ya se administra por separado, el comando reutiliza esa instancia y no la detiene.
   `DOCS_CAPTURE_IDS` permite ejecutar sólo las capturas seleccionadas con el mismo flujo. Si una
   ejecución completa se interrumpe, `DOCS_CAPTURE_FROM=CAP-*` reanuda el inventario desde ese
   identificador y conserva las imágenes anteriores. No combine ambas variables.

   No interrumpa el comando: primero elimina `docs/user-manual/images/` y después genera el juego
   completo.
6. Espere el mensaje `Capturas generadas` y a que reaparezca el prompt de la terminal 2. En ese
   momento, el script ya cerró Playwright y Chromium automáticamente y puede usar el siguiente
   comando.
7. Revise los PNG conforme a
   [Revisión antes de publicar](user-manual/screenshot-inventory.md#revisión-antes-de-publicar).
   Si debe corregir el entorno, repita los pasos 5 a 7.
8. Retire las credenciales de la terminal 2:

   ```powershell
   # PowerShell
   Remove-Item Env:DOCS_LOGIN_NAME, Env:DOCS_LOGIN_PASSWORD
   ```

   ```bash
   # Bash
   unset DOCS_LOGIN_NAME DOCS_LOGIN_PASSWORD
   ```

   Si una ejecución con `DOCS_STORAGE_STATE` falla, elimine ese archivo manualmente cuando no vaya
   a reintentar; una ejecución correcta lo elimina automáticamente.
9. Si inició Nexus manualmente en la terminal 1, presione `Ctrl+C` y espere el prompt para
    detener Nexus/Nodemon. El comando automático ya detuvo su instancia temporal.
10. Exporte el manual completo en DOCX:

   ```bash
   npm run docs:export -- manual-usuario --check
   npm run docs:export -- manual-usuario docx
   ```

El límite de 30 segundos de Playwright es el tiempo máximo para que una condición de la página se
cumpla, no una pausa que el proceso deba consumir en cada captura. Si la comprobación del paso 3
responde `ERR_CONNECTION_REFUSED`, confirme que Nexus siga activo y
que la URL use el puerto anunciado. Si la captura falla esperando el botón **Nueva salida** de
salidas de merma, compruebe que la cuenta tenga `waste:issues-manage`; el acceso al listado por sí
solo no sustituye el permiso de administración. Si falla esperando `.btn-return-detail`, compruebe
el permiso de surtimiento y que exista una salida aprobada, completamente surtida y con cantidad
retornable. El script espera a que DataTables termine de cargar y recorre todas las páginas del
listado para localizar la acción requerida. Las líneas `Paso N/T`
son acciones preparatorias, no capturas duplicadas. Después de corregir los datos puede definir
`DOCS_CAPTURE_IDS=CAP-SAL-WAS-05-RETURN` para regenerar sólo la captura fallida, o
`DOCS_CAPTURE_FROM=CAP-SAL-WAS-05-RETURN` para continuar con ella y todas las posteriores; ambos
mecanismos conservan las demás imágenes.

### Ejemplos de exportación

```bash
# Sólo valida fuentes e imágenes; no necesita Pandoc.
npm run docs:export -- requisitos --check

# Genera build/docs/manual-usuario.docx.
npm run docs:export -- manual-usuario docx

# Genera en DOCX un manual con el recorrido del personal de almacén.
npm run docs:export -- manual-almacen docx

# Genera un DOCX, incluida la portada definida en el Markdown.
npm run docs:export -- arquitectura docx

# Genera un PDF después de definir DOCS_PDF_ENGINE en la misma terminal como se explicó arriba.
npm run docs:export -- pruebas pdf
```

La exportación se ejecuta en desarrollo o CI, nunca mediante `npm start` ni como parte del
servidor de producción. Los archivos bajo `build/docs/` son resultados regenerables y no
se versionan.
