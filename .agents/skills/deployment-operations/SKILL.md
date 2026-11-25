---
name: deployment-operations
description: Prepara o verifica despliegues, infraestructura, observabilidad y recuperación de Nexus.
---

# Despliegue y operación

1. Consulta el plan aprobado y las vistas físicas enlazadas desde `back/docs/README.md` y `front/docs/index.md`. Revisa los Dockerfiles, Compose, la configuración de proxy y CI vigentes.
2. Identifica dependencias, secretos, permisos, puertas de despliegue y puntos de recuperación. Confirma el entorno y la autorización antes de acceder a producción.
3. En el entorno autorizado verifica arranque, proxy y HTTPS, sondas, persistencia, alertas, respaldos externos y recuperación según el alcance.
4. Registra comandos, evidencia, bloqueos y criterios de reversión. Actualiza la guía operativa afectada.
