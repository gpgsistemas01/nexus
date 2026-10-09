# 7. Lista de revisión manual

Al cambiar el código, Codex o cualquier contribuidor debe actualizar estos diagramas cuando:

1. se agrega, elimina o mueve una ruta API o web;
2. cambia la cadena `middleware → controller → DTO → service → Prisma`;
3. un dominio comienza o deja de colaborar con inventario, referencias, auditoría o
   notificaciones;
4. se crea, reemplaza o retira una fábrica CRUD, listado o componente compartido;
5. cambia el límite transaccional de corrección, cancelación, surtimiento o devolución;
6. cambia un contrato de configuración, una clave de respuesta o un callback compartido;
7. una extracción modifica ownership o consumidores, siguiendo el
   [procedimiento de refactorización](../design-and-construction-patterns/16-refactoring-and-extension.md);
8. cambia el puente de eventos, los listados suscritos o la renovación coordinada de sesión.

Se comprueba que cada figura tenga identificador, pregunta, alcance, leyenda y fuente
verificable. Los consumers, argumentos y efectos se contrastan con imports y contratos;
las referencias no se conservan si el mecanismo dejó de tener uso. Se renderizan las
figuras modificadas y se revisa una exportación DOCX/PDF representativa.

Después de la revisión manual también se ejecuta `npm run docs:architecture` para
actualizar el inventario técnico y `npm run docs:check` para detectar diferencias. Ambos
pasos son complementarios: el script comprueba evidencia enumerable y este documento
conserva la explicación comprensible.
