# 3. Preparar las herramientas

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
3. Mermaid CLI se instala automáticamente cuando el paquete contiene un diagrama que aún debe
   renderizarse. La instalación es temporal y no modifica `package.json` ni `package-lock.json`. Si
   el entorno no tiene acceso al registro de npm, puede prepararse manualmente con:

   ```bash
   npm install --no-save @mermaid-js/mermaid-cli
   ```

   El exportador detecta los bloques `mermaid`, prepara el CLI cuando hace falta, incorpora las
   imágenes PNG al documento y conserva una copia visual en `build/docs/diagrams/`. El código
   empleado para generar cada imagen queda en
   `build/docs/diagram-sources/`, separado de los PNG. Las fuentes Markdown no se modifican. Si el
   paquete no contiene diagramas, esta herramienta no se invoca. Los nombres se derivan del
   contenido de cada diagrama: una exportación posterior reutiliza los PNG que ya coincidan y sólo
   convierte diagramas nuevos o modificados. Para forzar su regeneración completa, elimina
   `build/docs/diagrams/` antes de exportar.
4. DOCX no requiere otra herramienta. Para PDF, el exportador genera primero ese mismo DOCX y
   después lo convierte con LibreOffice en modo no interactivo. Así DOCX y PDF recorren la misma
   maquetación y ya no se necesita TeX Live ni configurar `DOCS_PDF_ENGINE`.

   Si `soffice` no está disponible, el comando intenta instalar LibreOffice con `apt-get` en
   Debian o Ubuntu, Homebrew en macOS y WinGet en Windows. La instalación se realiza únicamente al
   solicitar PDF y reutiliza una instalación existente en las siguientes ejecuciones. En Linux,
   una cuenta sin privilegios utiliza `sudo`.

   Si el equipo no dispone de uno de esos gestores o la cuenta no puede instalar paquetes, instala
   [LibreOffice desde su sitio oficial](https://www.libreoffice.org/download/download-libreoffice/)
   en el mismo sistema donde se ejecutará el comando:

   - **Windows:** la instalación con WinGet se solicita en modo silencioso y no interactivo. La
     conversión utiliza `soffice.com`, la variante de consola de LibreOffice, y oculta ventanas de
     proceso adicionales para que la exportación continúe sin pedir cerrar `office.exe` ni pulsar
     Enter. Los avisos de seguridad del propio sistema operativo, si aparecen, todavía requieren la
     autorización correspondiente.
   - **Debian o Ubuntu:** ejecuta `sudo apt-get install libreoffice`. Si no dispones de `sudo`,
     solicita la instalación al administrador.
   - **macOS:** instala LibreOffice y agrega el ejecutable de la aplicación al `PATH` si la terminal
     no reconoce `soffice`.

   Comprueba la instalación con `soffice --version` y ejecuta normalmente:

   ```powershell
   npm run docs:export -- todos pdf
   ```

   El comando conserva ambos resultados, `build/docs/docx/<paquete>.docx` y
   `build/docs/pdf/<paquete>.pdf`. Si el ejecutable tiene otro nombre o no está en `PATH`, define su
   ruta en `DOCS_PDF_CONVERTER`; por ejemplo, en PowerShell:

   ```powershell
   $env:DOCS_PDF_CONVERTER = "C:\Program Files\LibreOffice\program\soffice.com"
   npm run docs:export -- todos pdf
   ```

   Si una configuración existente apunta a `soffice.exe`, el exportador usa automáticamente el
   ejecutable de consola `soffice.com` de la misma carpeta. La comprobación del conversor tiene un
   tiempo límite para que un proceso de LibreOffice que no responda no deje la exportación
   bloqueada indefinidamente. Tanto esa comprobación como la conversión eliminan `PYTHONHOME` y
   `PYTHONPATH` sólo del entorno del subproceso de LibreOffice. Esto evita que una instalación de
   Python configurada en la terminal interfiera con el Python integrado de LibreOffice y muestre
   el aviso `Could not find platform independent libraries <prefix>`; las variables de la terminal
   y del proceso principal no se modifican.

   Adobe Reader sólo visualiza el resultado. La conversión automatizada usa LibreOffice porque
   proporciona un ejecutable invocable de forma uniforme; Word o Acrobat todavía pueden usarse
   para convertir manualmente el DOCX conservado.

5. Valida siempre el paquete con `--check` antes de generar el archivo.

La portada **ya se genera** con `title`, `subtitle`, `author` y `date` del encabezado YAML del
primer Markdown de cada paquete; esos datos pueden variar sin crear una plantilla. Un DOCX también
se genera directamente sin definir `DOCS_REFERENCE_DOC`. Esa variable es opcional y sólo se usa
si la organización ya dispone de un archivo `.docx` de referencia para aplicar tipografías,
márgenes, encabezados o estilos corporativos al resultado; no contiene ni reemplaza los datos de
la portada.
