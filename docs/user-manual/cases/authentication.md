# Casos: Autenticación y navegación

Cada procedimiento identifica sus casos de uso, controles, errores posibles y captura de referencia.

## Acceso

**Propósito.** Autenticar una cuenta autorizada y reconocer la navegación disponible.

<a id="CAP-AUT-01-LOGIN"></a>
### CAP-AUT-01-LOGIN — Inicio sesion

**Casos:** `CU-AUT-01`.

**Errores posibles:** [Acceso y autorización](../error-messages.md#errores-acceso).

**Controles que debe usar:** Campos **Nombre de usuario** y **Contraseña**, casilla **Recordar credenciales** y botón **Iniciar sesión**.

1. Capture las credenciales asignadas y seleccione **Iniciar sesión**.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-AUT-01-LOGIN: inicio sesion](../images/acceso/01-inicio-sesion.png)

## Página no encontrada

**Propósito.** Reconocer una dirección que no corresponde a una página disponible.

<a id="CAP-ERR-404-NOT-FOUND"></a>
### CAP-ERR-404-NOT-FOUND — Pagina no encontrada

**Casos:** Transversal.

**Errores posibles:** [Error 404](../error-messages.md#error-404).

**Controles que debe usar:** Botón **Volver**; no capture datos ni modifique manualmente la dirección para buscar una opción restringida.

1. Conserve la dirección y regrese mediante la navegación de Nexus.
2. Compruebe que la pantalla coincida con la captura antes de continuar.

![CAP-ERR-404-NOT-FOUND: pagina no encontrada](../images/errores/01-pagina-no-encontrada.png)
