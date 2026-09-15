# 15. Decisión antes de crear otro flujo

1. **¿Es listar/crear/editar con el mismo contrato del navegador?** Configurar
   `createCrudApplication`.
2. **¿Es una salida con encabezado, detalles y devolución?** Configurar
   `createIssueApplication` y conservar requests/servicios por contexto.
3. **¿Es un catálogo de sólo lectura para DataTable?** Configurar
   `createDataTableListController`.
4. **¿Participa en una escritura compuesta?** Recibir y propagar `tx` mediante `getDb`.
5. **¿Notifica un cambio de inventario confirmado?** Reutilizar
   `emitInventoryUpdated` después de la mutación.
6. **¿La UI ignora el recurso que la consume?** Reutilizar o extraer a `ui`, `plugins` o
   `views/shared`; si conoce el recurso, mantenerla con su propietario.
7. **¿Sólo cambia material por merma u otro contexto?** Parametrizar primero; separar
   únicamente reglas, permisos, persistencia o lenguaje que sean realmente distintos.

### Módulos de formulario enfocados

La UI transversal de formularios se divide por responsabilidad y no se concentra en
un archivo barril: `ui/forms/formErrorsUI.js` presenta y limpia errores, `ui/forms/formStateUI.js`
inicializa el formulario y controla el estado de sus campos, y `ui/forms/detailFormUI.js`
coordina los controles repetidos de las tablas de detalle. Los consumidores importan
directamente `ui/forms/totalsSummaryUI.js` para los acumulados.

El registro transversal del envío vive en `ui/forms/formUI.js`: depende del DOM, muestra
errores y controla el botón, por lo que es una responsabilidad de presentación y no un
caso de uso de `application`. Recibe `sendRequest` como colaboración para que los
formularios de cada recurso sigan delegando la operación de aplicación correspondiente.

Los reportes sí representan casos de uso de aplicación. Como todos adaptan la respuesta
del request al mismo contrato de archivo, `createReportApplication.js` concentra esa
traducción y los módulos de reporte por dominio se limitan a configurarla con su servicio
de transporte. Así se conservan las fronteras y rutas de cada dominio sin duplicar el
flujo.

Una operación específica de un solo CRUD permanece privada en su flujo. No se exportan
wrappers de una sola llamada como API compartida, porque no aportan reutilización y
ocultan el propietario real del comportamiento.

### Inicialización y dependencias de DataTable

Las tablas de detalle generan su encabezado y sus columnas en la función de
inicialización del contexto, mediante los constructores compartidos. No se escribe un
encabezado provisional al cargar el módulo: esa escritura duplica la configuración,
puede ejecutarse antes de que exista el elemento y queda reemplazada al iniciar el
DataTable. Los imports se limitan a las dependencias realmente consumidas; cuando una
refactorización mueve una responsabilidad a un constructor o componente compartido,
se retiran también los imports residuales del consumidor.
