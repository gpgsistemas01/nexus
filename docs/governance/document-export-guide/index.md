# Guía de exportación documental

Este documento concentra la preparación, validación y generación de los paquetes documentales.
La organización y las fuentes de verdad permanecen en el [índice de documentación](../README.md).

## Propósito y alcance

Esta guía vive aquí —y no en el `README.md` raíz— porque Pandoc, las plantillas y los
motores PDF son herramientas del flujo documental, no requisitos para ejecutar Nexus.
La exportación y la generación de capturas se ejecutan sólo en desarrollo o CI y por eso
sus comandos se mantienen fuera de la guía operativa de la aplicación.

Pandoc y Playwright intervienen en etapas distintas y ninguno sustituye al otro:

| Herramienta | Finalidad | Comando del proyecto |
| --- | --- | --- |
| Node.js y dependencias (`npm ci`) | Ejecutan los scripts del repositorio. | Todos los comandos `npm run docs:*`. |
| Playwright y Chromium (instalación automática) | Abren Nexus y generan las capturas del manual. Sólo se necesitan al actualizar imágenes. | `npm run docs:screenshots` |
| Mermaid CLI (instalación automática) | Convierte cada bloque Mermaid en una imagen temporal para la exportación. | `docs:export` lo instala temporalmente cuando debe generar un diagrama y todavía no está disponible. |
| Pandoc (herramienta del sistema) | Ensambla el Markdown y las imágenes existentes, convierte la navegación del paquete en hipervínculos internos y genera el DOCX. | `npm run docs:export -- <paquete> <formato>` |
| LibreOffice (instalación automática) | Convierte a PDF el DOCX que acaba de generar el exportador. | Sólo `docs:export` con formato `pdf`; si falta, el comando intenta instalarlo con el gestor de paquetes del sistema. |

Una extensión de Playwright para Visual Studio Code tampoco reemplaza estas herramientas: puede
facilitar la ejecución desde el editor, pero el script de capturas requiere el paquete `playwright`
y la exportación final continúa requiriendo el ejecutable `pandoc`.

Al generar capturas, el comando instala temporalmente el paquete de Node.js si no está disponible y
comprueba la instalación del ejecutable de Chromium compatible. No modifica `package.json` ni
`package-lock.json`. No se instala una extensión dentro del navegador habitual ni es suficiente
con instalar la extensión de Playwright para Visual Studio Code.

## Contenido

1. [1. Estructura exportable](01-estructura-exportable.md)
2. [2. Enlaces e imágenes](02-enlaces-e-imagenes.md)
3. [3. Preparar las herramientas](03-preparar-las-herramientas.md)
4. [4. Comandos](04-comandos.md)
5. [5. Volver a generar documentos existentes](05-volver-a-generar-documentos-existentes.md)
6. [6. Flujo general de exportación](06-flujo-general-de-exportacion.md)
7. [7. Exportar los manuales](07-exportar-los-manuales.md)
8. [8. Actualizar las capturas del manual](08-actualizar-las-capturas-del-manual.md)
9. [9. Ejemplos de exportación](09-ejemplos-de-exportacion.md)
