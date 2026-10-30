# Vista física: ejecución y construcción

Esta vista identifica los procesos que atienden las peticiones y los artefactos
que produce el build. La SPA se ejecuta en el navegador; Vite o el alojamiento
estático entrega sus archivos y deriva las peticiones a la API.

| Pregunta | Diagrama |
| --- | --- |
| ¿Qué comunica el navegador con Vite y la API local? | [Desarrollo local](runtime-and-build.md#desarrollo-local), `DIA-VUE-FIS-001`. |
| ¿Qué fuentes necesita el build y qué recibe la imagen final? | [Construcción de artefactos](runtime-and-build.md#construcción-de-artefactos), `DIA-VUE-FIS-002`. |
| ¿Qué atiende Nginx y dónde se procesa la API? | [Ejecución de la imagen frontend](runtime-and-build.md#ejecución-de-la-imagen-frontend), `DIA-VUE-FIS-003`. |

Los comandos, variables, proxy y diagnóstico se mantienen en
[Compilación y despliegue](../../../development/03-build-and-deployment.md).
