# 1. Recorrido extremo a extremo de una interacción

El recorrido se lee enlazando las dos realizaciones del mismo caso. Para consultar
proveedores, empieza en [frontend `CU-CAT-01`](frontend-code-sequences/catalogs/cu-cat-01.md#cu-cat-01)
y continúa en [backend `CU-CAT-01`](backend-code-sequences/catalogs/cu-cat-01.md#cu-cat-01).

La primera secuencia identifica el módulo de entrada, el adaptador de tabla, el núcleo
DataTable, la aplicación, el request y el cliente HTTP. La flecha `GET /api/warehouse/suppliers`
llega al router que constituye la frontera de la segunda secuencia. Desde allí se siguen
los archivos de autenticación, controller y servicio hasta la persistencia, y después
la respuesta vuelve al callback AJAX que actualiza la tabla.

Cada participante técnico de esas secuencias corresponde a un archivo. La plantilla
EJS aporta el HTML antes de ejecutar el módulo JavaScript; no comparte su línea de vida.
El navegador y la base de datos son límites externos. La estructura general permanece
en el [diagrama de componentes](../logical/01-components-and-reuse.md#componentes-y-conexión-entre-frontend-y-backend),
y el contrato de los intercambios permanece en la documentación API y en OpenAPI.
Así se conserva el recorrido completo mediante referencias a sus fuentes, sin añadir
una tercera secuencia de capas agrupadas que repita ambos casos.
