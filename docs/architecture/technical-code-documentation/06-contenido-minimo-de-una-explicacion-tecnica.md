# 6. Contenido mínimo de una explicación técnica

Una sección técnica nueva debe ser breve y verificable. Incluye sólo los campos que
aportan información al cambio:

1. **propósito y alcance:** responsabilidad explicada y aquello que queda fuera;
2. **punto de entrada:** ruta, evento, vista o función pública desde donde comienza el
   comportamiento;
3. **colaboradores reutilizados:** middleware, DTO, servicio, helper, fábrica,
   componente o transacción ya existente;
4. **reglas y estados relevantes:** enlace al requisito propietario en vez de copiarlo;
5. **persistencia y efectos:** modelos afectados, límite transaccional y eventos, con
   enlace a la familia de datos cuando corresponda;
6. **errores y seguridad:** validaciones, permisos y errores observables que forman
   parte del contrato;
7. **evidencia:** ruta de la prueba o brecha registrada, sin declarar cobertura que no
   se haya ejecutado;
8. **mantenimiento:** cambio que obliga a revisar la explicación o el diagrama.

Los identificadores de código se escriben literalmente entre comillas invertidas y se
enlazan mediante rutas relativas estables. No se pegan cuerpos completos de funciones:
la documentación explica responsabilidades, decisiones y relaciones, mientras Git y el
código conservan el detalle de implementación.
