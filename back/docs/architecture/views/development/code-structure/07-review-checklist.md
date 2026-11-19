# 7. Lista de revisión del código y sus diagramas

Al cambiar el código, Codex o cualquier contribuidor debe actualizar estos diagramas cuando:

1. se agrega, elimina o mueve una ruta API o web;
2. cambia la cadena `middleware → controller → DTO → service → Prisma`;
3. un dominio comienza o deja de colaborar con inventario, referencias, auditoría o
   notificaciones;
4. se crea, reemplaza o retira una fábrica CRUD, listado o componente compartido;
5. cambia el límite transaccional de corrección, cancelación, surtimiento o devolución;
6. cambia un contrato de configuración, una clave de respuesta o un callback compartido;
7. una extracción modifica ownership o consumidores, siguiendo el
   [procedimiento de refactorización](../reuse-and-refactoring/04-refactoring-and-extension.md);
8. cambia el cliente generado, el adaptador Prisma, la selección de URL o la propagación de `tx`;
9. cambia el puente de eventos, los listados suscritos o la renovación coordinada de sesión.

Se comprueba que cada figura tenga identificador, pregunta, alcance, leyenda y fuente
verificable. Los consumers, argumentos y efectos se contrastan con imports y contratos;
las referencias no se conservan si el mecanismo dejó de tener uso. Se renderizan las
figuras modificadas y se revisa una exportación DOCX/PDF representativa.

Si cambian rutas, imports entre áreas o Prisma, se ejecuta `npm run docs:architecture`
para actualizar la evidencia generada. Siempre se ejecuta `npm run docs:check` para
comprobar sincronización y contratos; la revisión curada explica los hechos verificados.

## Comprobaciones contra código

`npm run docs:check` regenera en memoria rutas, imports y datos para contrastarlos con los archivos versionados. Incluye las alternativas de rutas declaradas en arreglos y comprueba la cobertura de OpenAPI. En secuencias arquitectónicas, verifica que los métodos estén referenciados en los archivos de sus participantes o en una vinculación explícita entre configurador y fábrica y que las peticiones HTTP explícitas coincidan con rutas registradas del router identificado.

Estas comprobaciones son estáticas: no prueban el orden de ejecución, las condiciones de un callback ni el valor que efectivamente retorna una transacción. Esos puntos requieren lectura del código y las pruebas pertinentes. Al revisar un cambio, comprobar también la propiedad de helpers, el payload, el resultado observado, el momento del commit y los efectos posteriores; las figuras deben mostrar la implementación disponible y distinguir cualquier pendiente funcional.

Las vistas de datos se generan desde Prisma. El paquete de publicación es `datos`; los
demás capítulos arquitectónicos se publican en `arquitectura`.
