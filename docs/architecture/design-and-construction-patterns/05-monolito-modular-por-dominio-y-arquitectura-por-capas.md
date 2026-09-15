# 1. Monolito modular por dominio y arquitectura por capas

Nexus se despliega como una aplicación, pero organiza responsabilidades por dominio y
capa. El recorrido habitual es:

```text
ruta/middleware → controller/DTO → servicio de dominio → Prisma → PostgreSQL
```

En el navegador, `services` encapsula HTTP, `application` expresa operaciones del caso
de uso y `pages` compone comportamiento visual. Esto se parece a MVC en algunos puntos,
pero no se declara un MVC estricto: los servicios de dominio, DTO, JavaScript del
navegador y eventos no encajan en tres componentes únicos.

La correspondencia MVC útil es parcial: EJS y los módulos de UI son la **Vista**;
routers/controllers Express cumplen la entrada del **Controlador**; Prisma y los
servicios administran estado y reglas que, en conjunto, se aproximan al **Modelo**.
Nexus aplica por ello un **MVC web extendido dentro de una arquitectura por capas**, no
un segundo patrón arquitectónico que sustituya al monolito modular. No falta crear una
clase `Model` ni trasladar reglas a controllers para «completar» MVC.

**Regla de construcción:** un recurso nuevo conserva el mismo dominio y nombre a través
de sus capas. No se crea una carpeta horizontal nueva sólo para una operación CRUD.
