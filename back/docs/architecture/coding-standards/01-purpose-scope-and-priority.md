# 1. Propósito, alcance y prioridad

Este estándar define las convenciones de código de Nexus.
Las decisiones de arquitectura explican responsabilidades y patrones; las reglas de
nombres, formato, imports, exports y organización de un archivo se mantienen aquí para
no crear estándares parciales o contradictorios. `AGENTS.md` contiene las instrucciones
de trabajo del repositorio; ante una discrepancia, prevalecen sus restricciones.

El estándar aplica a JavaScript del servidor y navegador, EJS, pruebas, scripts y
configuración mantenida por el proyecto. Prisma, SQL y Markdown conservan además las
convenciones propias de su lenguaje. Se aplica al código nuevo y a las líneas que se
modifican; no autoriza reformatear módulos ajenos al cambio ni mezclar una corrección
funcional con una reescritura general.

Si dos reglas parecen competir, se aplica esta prioridad:

1. contrato funcional, seguridad e integridad de datos;
2. patrón de la capa o componente compartido vigente;
3. este estándar;
4. estilo local, sólo cuando este documento no define el caso.

## Entorno y aplicación

- Usar Node.js 22–24 y módulos ES, conforme a `package.json`; CI usa Node.js 24 y la
  imagen de producción Node.js 22. Verificar la compatibilidad al añadir una API.
- Instalar desde `package-lock.json` con `npm ci`. Una dependencia nueva actualiza
  manifiesto y lockfile en el mismo cambio y debe resolver una necesidad concreta.
- Los archivos generados, dependencias y salidas de exportación se mantienen mediante
  sus herramientas; este estándar no autoriza editarlos o reformatearlos manualmente.
- Aplicar las reglas al cambio revisado. La existencia de código legado con otro estilo
  no justifica una reescritura general ni implica que todo el repositorio ya cumpla el estándar.

No hay un comando de lint o un formateador configurado en `package.json`. El formato
se revisa en el diff; las pruebas y `docs:check` no certifican el estilo del código.
