# 6. Pipeline de middleware

Express construye cada endpoint como una secuencia de funciones. Nexus reutiliza esa
capacidad como pipeline: autenticación, validación de campos, consolidación de errores,
autorización y controller se ejecutan en el orden declarado por la ruta.

No se denomina automáticamente *Chain of Responsibility*: los middleware no eligen
libremente otro manejador; forman una tubería definida por Express. La propiedad que se
debe conservar es el **orden visible y revisable**, con seguridad y validación en el
servidor antes de la mutación.

**Pruebas:** los casos negativos verifican que una entrada o sesión inválida no alcance
el servicio ni escriba datos; la integración CRUD atraviesa el pipeline real.
