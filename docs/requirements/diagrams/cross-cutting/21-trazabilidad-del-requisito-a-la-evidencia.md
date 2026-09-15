# Trazabilidad del requisito a la evidencia

```mermaid
flowchart LR
    requirement["Requisito"] --> route["Ruta web / API"]
    route --> validation["Permiso y validadores"]
    validation --> controller["Controlador / DTO"]
    controller --> service["Servicio de dominio"]
    service --> schema["Prisma / migración"]
    validation --> unit["Pruebas unitarias en ubicación paralela<br/>validadores · DTO · controlador · servicio · interfaz CRUD"]
    route --> integration["Integración CRUD HTTP + Prisma<br/>tests/integration/controllers/*DbTest.js"]
    schema --> integration
    route --> generated["Mapa generado y<br/>comprobación de CI"]
```

Al modificar un requisito se revisan su ruta, autorización, validación, persistencia y
pruebas relacionadas. La ubicación y estrategia de estas últimas se detalla en
[Estrategia y cobertura de pruebas](../../../testing/service-test-coverage.md).
