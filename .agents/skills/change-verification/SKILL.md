---
name: change-verification
description: Revisa cambios de Nexus y verifica su comportamiento, trazabilidad y controles defensivos.
---

# Revisión y verificación de cambios

1. Revisa el diff frente al requisito y a los contratos vigentes. Sigue las llamadas hasta las capas y consumidores afectados.
2. Comprueba validación, permisos, redacción de datos sensibles, reintentos, concurrencia y atomicidad donde correspondan.
3. Selecciona las pruebas con los planes de backend y frontend. Ejecuta las comprobaciones exigidas en los `AGENTS.md` aplicables y registra sus resultados.
4. Comprueba la documentación afectada. Informa hallazgos con archivo, impacto, condición observable y evidencia, además de las comprobaciones pendientes.
