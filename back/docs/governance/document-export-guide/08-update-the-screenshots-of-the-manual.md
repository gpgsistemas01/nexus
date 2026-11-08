# 8. Actualizar capturas de los manuales Vue

Las capturas pertenecen a `front/docs/user-manual` y al flujo por cuenta. Desde la
raíz, ejecute `npm --prefix front run docs:screenshots -- --all`; para una cuenta,
use `npm --prefix front run docs:screenshots -- --profile <id>`.

La captura utiliza sesiones y datos existentes del entorno de prueba, conserva los
permisos de la cuenta y bloquea escrituras. Un listado vacío no demuestra una función
pendiente. Revise la preparación, el selector y la captura propia antes de cambiar código.
La reanudación y las salidas se describen en la [guía Vue](../../../../front/docs/governance/06-manuals-by-access.md).
