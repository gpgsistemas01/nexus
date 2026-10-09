# 6. Pipeline de middleware

Express construye cada endpoint como una secuencia de funciones. Nexus reutiliza esa
capacidad como pipeline: autenticación, autorización, validación y controller se componen en el orden declarado
por cada router. Ese orden es parte del contrato: materiales valida ciertas escrituras
antes de autorizar, mientras catálogos instala autorización en `router.use` antes de
la validación de cada operación.

No se denomina automáticamente *Chain of Responsibility*: los middleware no eligen
libremente otro manejador; forman una tubería definida por Express. La propiedad que se
debe conservar es el **orden visible y revisable**, con seguridad y validación en el
servidor antes de la mutación.

**Pruebas:** los casos negativos verifican que una entrada o sesión inválida no alcance
el servicio ni escriba datos; la integración CRUD atraviesa el pipeline real.

La vista canónica `DIA-PAT-FRO-001` presenta una escritura concreta de materiales y explica sus variantes. Las secuencias de
caso no lo copian mecánicamente: muestran un middleware como participante visual sólo
si su decisión forma parte del recorrido explicado, y conservan la ruta concreta para
auditar el orden restante. La validación backend pertenece a este pipeline, mediante el
arreglo de `src/validators/forms` seguido de
`validatorMiddleware.validate(req, res, next)`; el controller recibe una entrada ya
aceptada por esa frontera y el DTO la normaliza.

Las comprobaciones del navegador son complementarias. Pueden detener el envío y
mostrar errores de manera inmediata, pero no reemplazan ni condicionan la validación
del servidor. Su colaboración se documenta en la secuencia frontend del caso cuando
produce una alternativa visible.
