# 7. Lista de revisión manual

Al cambiar el código, Codex o cualquier contribuidor debe actualizar estas vistas cuando:

1. se agrega, elimina o mueve una ruta API o web;
2. cambia la cadena `middleware → controller → DTO → service → Prisma`;
3. un dominio comienza o deja de colaborar con inventario, referencias, auditoría o
   notificaciones;
4. se crea, reemplaza o retira una fábrica CRUD, listado o componente compartido;
5. cambia el límite transaccional de corrección, cancelación, surtimiento o devolución.

Después de la revisión manual también se ejecuta `npm run docs:architecture` para
actualizar el inventario técnico y `npm run docs:check` para detectar diferencias. Ambos
pasos son complementarios: el script comprueba evidencia enumerable y este documento
conserva la explicación comprensible.
