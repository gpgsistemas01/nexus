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
├── data/          # Datos, acceso, permisos y contrato HTTP
├── governance/    # Criterios para mantener la documentación
├── user-manual/   # Entrada, capítulos e imágenes del manual
├── requirements/  # Entrada, requisitos, casos de uso e imágenes
├── styles/        # Estilos y plantillas de publicación
├── testing/       # Estrategia, cobertura y plan de pruebas CRUD
└── generated/     # Inventarios derivados; no se editan manualmente
```

| Familia | Artefacto principal | Artefactos complementarios | Evidencia generada |
| --- | --- | --- | --- |
| Arquitectura y construcción | [Arquitectura y vistas web](architecture/architecture-and-web-views.md) | [Guía técnica común](architecture/technical-code-documentation.md), referencias de [backend](architecture/backend-technical-documentation.md) y [frontend](architecture/frontend-technical-documentation.md), [diagramas vigentes del código](architecture/code-diagrams.md), [patrones aplicados](architecture/design-and-construction-patterns.md), [estándar de codificación](architecture/coding-standards.md) y [convenciones de diagramas](architecture/diagram-conventions.md) | [Mapa del código](generated/code-map.md), derivado de rutas e importaciones de `src` |
| Dominio y requisitos | [Índice y portada del paquete](requirements/index.md); la [especificación](requirements/requirements-specification.md) es la fuente normativa | [Visión y alcance](requirements/vision-scope-and-requirements.md), [dominio y casos de uso](requirements/domain-and-use-cases.md), [catálogo de casos de uso](requirements/use-case-descriptions.md), [matriz de operaciones](requirements/requirements-operations-matrix.md), [diagramas de requisitos](requirements/requirements-diagrams.md) y [glosario](requirements/business-glossary.md) | No aplica; el estado funcional requiere revisión humana |
| Datos, acceso y operación | [Mapa de datos, persistencia y acceso](data/index.md) | [Análisis de usuarios y permisos](data/database-users-and-permissions-analysis.md), [roles PostgreSQL](data/postgresql-runtime-and-migration-roles.md) y [contrato API](data/api-contract.md) | [Esquema de base de datos](generated/database-schema.md) y [diccionario técnico](generated/data-dictionary.md), derivados de `prisma/schema.prisma` |
| Pruebas | [Estrategia de pruebas](testing/service-test-coverage.md) | [Plan de pruebas](testing/test-plan.md), que concreta alcance, matriz CRUD y criterios de ejecución | No aplica; la evidencia ejecutable vive en `tests` |
| Gobierno documental | [Normas y criterios](governance/documentation-standards.md) | [Registro de aplicación de normas](governance/standards-application.md) y [convenciones de diagramas](architecture/diagram-conventions.md), compartidas también con arquitectura | No aplica |

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
   `npm run docs:export -- <paquete> html --check`; generar DOCX, PDF o HTML sólo en
   desarrollo/CI. Las capturas se actualizan mediante `npm run docs:screenshots` con un
   entorno y una sesión de prueba preparados.

No se duplica el catálogo de rutas en documentos manuales: su fuente es el mapa
generado. Los diagramas curados explican intención y no deben generarse fingiendo que
el código puede inferir decisiones de arquitectura.

## Exportar la documentación

Esta guía vive aquí —y no en el `README.md` raíz— porque Pandoc, las plantillas y los
motores PDF son herramientas del flujo documental, no requisitos para ejecutar Nexus.
El README del sistema sólo lista los comandos para que puedan descubrirse.

### Estructura exportable

La estructura actual es válida para exportar: cada paquete comienza en el `index.md` de
su propia familia, las fuentes curadas permanecen junto a esa entrada, `styles/` contiene
la presentación y `build/docs/` recibe los resultados ignorados por Git. El paquete de
requisitos comienza en `requirements/index.md`, no en una carpeta genérica de
publicaciones. Los paquetes no dependen de archivos binarios versionados. Antes de
publicar, todavía se debe revisar lo siguiente:

- un enlace o una imagen ausente hace fallar `--check`;
- Mermaid permanece como fuente Markdown y necesita renderizarse previamente si el formato
  final no admite esos bloques;
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

### Preparar las herramientas

1. Desde la raíz del repositorio, instala la versión de Node.js indicada en `package.json`
   y ejecuta `npm ci`.
2. Instala [Pandoc](https://pandoc.org/installing.html) y comprueba `pandoc --version`. En
   Debian o Ubuntu puede usarse `sudo apt-get install pandoc`.
3. Para PDF, instala un motor compatible. Se recomienda TeX Live mediante
   `sudo apt-get install texlive-xetex` y `DOCS_PDF_ENGINE=xelatex`. HTML y DOCX no lo
   necesitan.
4. Para aplicar estilos corporativos a DOCX, prepara una plantilla y define
   `DOCS_REFERENCE_DOC=/ruta/reference.docx`.
5. Valida siempre el paquete con `--check` antes de generar el archivo.

### Comandos

Los paquetes admitidos son `manual-usuario`, `requisitos`, `arquitectura` y `pruebas`.
Los formatos admitidos son `html`, `docx` y `pdf`.

```bash
# Sólo valida fuentes e imágenes; no necesita Pandoc.
npm run docs:export -- requisitos html --check

# Genera build/docs/manual-usuario.html.
npm run docs:export -- manual-usuario html

# Genera un DOCX con una plantilla opcional.
DOCS_REFERENCE_DOC=/ruta/reference.docx npm run docs:export -- arquitectura docx

# Genera un PDF con XeLaTeX.
DOCS_PDF_ENGINE=xelatex npm run docs:export -- pruebas pdf
```

La exportación se ejecuta en desarrollo o CI, nunca mediante `npm start` ni como parte del
servidor de producción. Los archivos bajo `build/docs/` son resultados regenerables y no
se versionan.
