# 4. Convenciones mínimas adoptadas

Sin declarar conformidad total con las normas anteriores, la documentación del
repositorio debe:

1. declarar un artefacto propietario para cada decisión y distinguir contenido
   normativo, vista complementaria y evidencia generada;
2. mantener identificadores estables y trazabilidad desde requisitos y casos de uso
   hacia la evidencia, sin copiar la misma regla normativa en varios documentos;
3. redactar criterios observables y verificables, diferenciando requisito, evidencia,
   estado y decisión pendiente;
4. presentar como implementado sólo aquello que tenga evidencia suficiente y conservar
   el responsable de la validación funcional fuera del estado técnico;
5. actualizar las vistas curadas afectadas y regenerar los inventarios derivados con
   `npm run docs:architecture` cuando cambie su fuente;
6. agrupar los casos de uso por capacidad funcional y conservar identificadores con el
   formato `CU-<GRUPO>-<SECUENCIA>` en el catálogo y en todos sus diagramas; estos grupos
   no se confunden con los paquetes documentales de publicación.

La convención de grupos e identificadores pertenece a la documentación normativa de
requisitos, porque define trazabilidad y estructura del modelo. No se duplica en
`AGENTS.md`: ese archivo contiene instrucciones operativas para quienes modifican el
repositorio y ya exige mantener sincronizados los documentos relacionados.

### Títulos y vocabulario técnico

Cada documento conserva un único título de nivel 1, específico y coherente con el
nombre mostrado en el índice. Las secciones usan niveles consecutivos y no repiten el
título del documento. Los nombres literales del código, rutas, variables, bibliotecas y
patrones reconocidos permanecen en inglés y entre comillas invertidas cuando procede;
la explicación se redacta en español.

Se prefieren **importación**, **exportación**, **controlador**, **servicio**, **ruta de
la API**, **interfaz**, **existencias**, **registros**, **rama** y **solicitud de cambio**
en lugar de mezclar *import*, *export*, *controller*, *service*, *endpoint*, *UI*,
*stock*, *logs*, *branch* y *pull request* dentro de una oración en español. Se permite
el término original cuando identifica una carpeta, una función, un permiso, una opción
de una herramienta o un concepto sin traducción inequívoca; no se traducen los
identificadores del código.
