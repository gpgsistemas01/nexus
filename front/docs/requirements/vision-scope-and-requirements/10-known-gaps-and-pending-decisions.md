# 10. Brechas conocidas y decisiones pendientes

La revisión documental no resuelve decisiones de negocio mediante supuestos de desarrollo.
Las siguientes decisiones requieren acuerdo; su responsable de aprobación está **por
designar**. Los interesados indicados son participantes de la revisión, no aprobadores
ya nombrados.

| Decisión pendiente | Información por acordar | Interesados para revisar | Riesgo mientras permanece abierta |
| --- | --- | --- | --- |
| Responsabilidad y aceptación | Responsable del producto, autoridad de aprobación de alcance y criterios de aceptación funcional. | Negocio, Sistemas y usuarios operativos. | Confundir evidencia técnica con aceptación de negocio. |
| Objetivos medibles | Indicador, línea base, meta, período y responsable de medición para los objetivos del capítulo 2. | Negocio y Dirección. | No poder demostrar el valor esperado. |
| Acceso de otras áreas | Participación de solicitantes y necesidades de supervisión de Dirección. | Áreas solicitantes, Dirección y Sistemas. | Inferir permisos que no forman parte del alcance vigente. |
| Contexto de proyectos | Fuente de datos, responsable y necesidad de administración futura. | Negocio y almacén. | Confundir el contexto de una salida con gestión de proyectos disponible. |
| Calidad del servicio | Tiempos, volumen, concurrencia, SLA, RTO, RPO y medios de comprobación. | Usuarios y responsables de operación técnica. | Prometer rendimiento o recuperación sin evidencia ni recursos acordados. |
| Compatibilidad de navegadores | Navegadores, versiones y dispositivos objetivo, escenarios críticos y política de soporte. La automatización actual usa Chromium. | Usuarios y Sistemas. | Deducir soporte de todos los navegadores a partir de un único motor probado. |
| Accesibilidad e interacción | Necesidades de los usuarios, tecnologías de asistencia, nivel o criterios exigibles y forma de evaluación. | Usuarios, negocio y Sistemas. | Atribuir conformidad a la biblioteca visual sin comprobar los recorridos reales. |
| Datos e historia | Clasificación de datos, retención, protección y alcance de auditoría requerido. | Negocio y Sistemas. | Que la historia disponible no satisfaga las necesidades de auditoría o conservación. |
| Preparación operativa | Responsabilidad de captura y validación de cuentas, catálogos y existencias iniciales. | Almacén y Sistemas. | Iniciar con datos o accesos incorrectos. |

La auditoría conserva evidencias con alcance desigual; su ampliación se trata en la
[vista de identidad, acceso y auditoría](../../architecture/contracts/index.md).
La cobertura automatizada tampoco es completa; el seguimiento pertenece al
[plan de pruebas](../../testing/01-test-plan.md). Estas brechas no se ocultan mediante una
redacción que prometa trazabilidad o comprobación exhaustivas.
