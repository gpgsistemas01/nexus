# Casos: Autenticación y navegación

Cada procedimiento identifica sus casos de uso, controles, errores posibles y captura de referencia.

## Acceso

**Propósito.** Autenticar una cuenta autorizada y reconocer la navegación disponible.

<a id="CAP-AUT-01-LOGIN"></a>
### CAP-AUT-01-LOGIN — Inicio sesion

**Casos:** `CU-AUT-01`.

**Errores posibles:** [Acceso y autorización](../error-messages.md#errores-acceso).

**Controles que debe usar:** Campos **Nombre de usuario** y **Contraseña**, casilla **Recordar credenciales** y botón **Ingresar**.

1. Antes de usar los controles, compruebe que la pantalla inicial coincida con la captura:

   ![CAP-AUT-01-LOGIN: inicio sesion](../images/acceso/01-inicio-sesion.png)

2. Escriba la cuenta asignada en el campo **Nombre de usuario** y la clave en **Contraseña**.
3. Si corresponde, marque la casilla **Recordar credenciales** y seleccione el botón **Ingresar**.

## Página no encontrada

**Propósito.** Reconocer una dirección que no corresponde a una página disponible.

<a id="CAP-ERR-404-NOT-FOUND"></a>
### CAP-ERR-404-NOT-FOUND — Pagina no encontrada

**Casos:** Transversal.

**Errores posibles:** [Error 404](../error-messages.md#error-404).

**Controles que debe usar:** Botón **Volver**; no capture datos ni modifique manualmente la dirección para buscar una opción restringida.

1. Antes de usar los controles, compruebe que la pantalla inicial coincida con la captura:

   ![CAP-ERR-404-NOT-FOUND: pagina no encontrada](../images/errores/01-pagina-no-encontrada.png)

2. En la página de error, seleccione el botón **Volver** para regresar mediante la navegación de Nexus.
