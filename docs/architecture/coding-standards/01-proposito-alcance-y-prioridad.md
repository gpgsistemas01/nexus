# 1. Propósito, alcance y prioridad

Este documento es la fuente de verdad única para las convenciones de código de Nexus.
Las decisiones de arquitectura explican responsabilidades y patrones; las reglas de
nombres, formato, imports, exports y organización de un archivo se mantienen aquí para
no crear estándares parciales o contradictorios.

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
