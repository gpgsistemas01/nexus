# 4. Imágenes y capturas

Las imágenes se guardan en `docs/<familia>/images/<módulo>/NN-descripcion.png`. El número fija
el orden narrativo, no la identidad del requisito. Toda imagen debe tener texto alternativo,
referencia desde el contenido y resolución legible; no debe contener credenciales ni datos
personales reales. Requisitos, arquitectura y pruebas usan sus propias carpetas.

El manual usa `docs/user-manual/images/`. `scripts/captureManualScreenshots.js` automatiza
capturas con Playwright a partir de un estado de autenticación de prueba. El script recorre un
inventario explícito de módulos, espera un elemento estable y sólo después captura. Los modales
requieren una acción propia; no se debe usar una demora arbitraria. La automatización es
repetible, pero no se ejecuta en producción ni durante `npm start`. Cada PNG representa el área
visible del navegador con el tamaño fijado por el script; no concatena el contenido situado fuera
de la pantalla. Cuando hay un modal, conserva también el contexto visible de la página en lugar de
recortar únicamente el cuadro de diálogo.

Playwright es una herramienta opcional de desarrollo y no se incluye en producción. Se configuran
`DOCS_BASE_URL` y, para páginas protegidas, `DOCS_STORAGE_STATE` con una sesión de datos ficticios. El inventario cubre
los listados principales; cada modal o paso nuevo agrega al mismo script una acción localizada y otra captura
numerada. El acceso puede capturarse sin sesión; el resto debe fallar si la cuenta no posee el
permiso que el manual pretende demostrar.

Playwright **no se ejecuta junto con Pandoc**. Primero, y sólo cuando cambian las pantallas,
`docs:screenshots` abre la aplicación y actualiza las imágenes; después `docs:export`
lee esas imágenes ya existentes. Pandoc genera DOCX sin Playwright; para PDF, el exportador
convierte después ese DOCX con LibreOffice. La instalación y configuración de estas herramientas
pertenecen a la [guía operativa de exportación](../document-export-guide/03-preparar-las-herramientas.md#3-preparar-las-herramientas).

`docs:screenshots` coordina el generador con una instancia local de Nexus: comprueba si ya responde,
la inicia y espera cuando hace falta, y al terminar detiene sólo el proceso que creó. No cambia el
inventario ni convierte la captura en parte de la exportación documental.
