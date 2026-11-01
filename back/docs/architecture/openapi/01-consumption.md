# 1. Inicio rápido de la API

Use la URL del entorno. Los ejemplos Bash suponen `http://localhost:3000`, una
cuenta activa y ejecución desde `back/`. Sustituya las credenciales de muestra.

```bash
mkdir -p build
curl --cookie-jar build/api.cookies --header 'Content-Type: application/json' --data '{"name":"USUARIO","password":"CONTRASENA"}' http://localhost:3000/api/auth/login
curl --cookie build/api.cookies http://localhost:3000/api/auth/me
curl --request POST --cookie build/api.cookies --cookie-jar build/api.cookies http://localhost:3000/api/auth/refresh
```

| Solicitud | Respuesta correcta |
| --- | --- |
| Login | JSON `{"code":"SUCCESS_LOGIN"}` y dos cookies `HttpOnly`. |
| Consulta de sesión | JSON con `user`, accesos y permisos vigentes. |
| Refresh | Texto `OK` y cookies renovadas. |

Las operaciones protegidas usan `accessToken`; sólo refresh usa `refreshToken`.
El archivo `build/api.cookies` conserva la sesión y está ignorado por Git; elimínelo
al terminar. En producción use HTTPS. Para navegador, use el mismo origen o el proxy
configurado; las cookies son `SameSite=Lax`.

Envíe cuerpos como `application/json`. Obtenga los UUID y versiones del entorno;
los ejemplos de OpenAPI son ficticios. Consulte los
[errores y reintentos](api-contract.md#errores-globales-y-códigos-públicos) antes de
repetir una escritura.
