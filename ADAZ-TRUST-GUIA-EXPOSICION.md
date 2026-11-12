# ADAZ TRUST — guía para exponer la propuesta

Versión de trabajo: 12 de noviembre de 2026.

## 1. Mensaje central

ADAZ TRUST no propone vigilar a la familia ni demostrar que una persona nunca se equivoca. Propone convertir los compromisos en acuerdos claros, compartir únicamente información autorizada y revisar los avances en conversaciones breves. La meta es que la responsabilidad sea observable y que la autonomía aumente gradualmente.

Frase de apertura:
> No les pido que confíen sin razones. Les propongo construir razones observables para confiar.

## 2. Qué es el sistema

- **ADAZ Personal:** espacio del estudiante para organizar calendario, estudio, salud/actividad, negocio y revisión semanal.
- **ADAZ Family:** panel independiente para el adulto invitado; permite aceptar un vínculo, ver resúmenes que el estudiante publica, consultar permisos y conversar planes de salida.
- **Supabase:** servicio compartido previsto para autenticación y almacenamiento de resúmenes con permisos por cuenta.
- **Dos APK de prueba:** paquetes Android separados para ADAZ Personal y ADAZ Family; ambos abren sus respectivas páginas HTTPS del mismo proyecto.

No decir que es una única APK con datos sincronizados en tiempo real. La arquitectura actual utiliza dos aplicaciones y una capa backend común, que debe configurarse y probarse.

## 3. Qué datos se comparten y qué no

El estudiante decide qué categorías habilitar y cuándo publicar el resumen. Las categorías son:
- Estudio: minutos, número de sesiones y áreas generales.
- Hábitos: conteo de compromisos completados, sin títulos privados.
- Oro Lámina: número de actividades, sin nombres de clientes ni valores monetarios.
- Entrenamiento: número de sesiones, sin métricas físicas ni notas.
- Planes de salida: lugar, compañía y horario introducidos manualmente.

No se comparten por defecto conversaciones, contraseñas, notas privadas, datos detallados de salud, clientes, importes comerciales, ubicación GPS o seguimiento en segundo plano. Los resúmenes académicos/actividad se publican como **declarados**, no como verificados por terceros.

## 4. Guion oral de 28 diapositivas

1. **Portada:** presenta ADAZ TRUST como propuesta de confianza, acuerdos y autonomía; no como producto de vigilancia.
2. **Propuesta central:** organizar, compartir y revisar con reglas comunes.
3. **Reto familiar:** reducir malentendidos sobre horarios, tareas y compromisos; evitar tanto la falta de información como el control excesivo.
4. **Principios:** claridad, proporcionalidad, reciprocidad, privacidad y progreso.
5. **ADAZ Personal:** muestra el calendario, las sesiones de estudio, actividad, negocio y registro de avances.
6. **ADAZ Family:** muestra una vista resumida para el adulto, con invitación, acuerdos y revisiones.
7. **Arquitectura:** explica que hay dos aplicaciones con cuentas distintas y una capa de backend compartida. La integración completa depende de configurar y validar Supabase.
8. **Flujo de información:** el estudiante registra; el permiso limita las categorías; el estudiante publica; el familiar consulta el resumen autorizado.
9. **Privacidad:** no se accede a mensajes, contraseñas, cámara, micrófono ni ubicación continua.
10. **Estados:** declarado = autorreporte; corroborado = evidencia pertinente, si el sistema futuro la incorpora; pendiente = falta revisar. En la implementación actual de resúmenes, solo se aceptan declarado y pendiente.
11. **Salidas:** explicar destino, compañía y horarios manualmente; avisar si cambia el plan; confirmar llegada. No hay GPS.
12. **Revisión semanal:** reservar 15 minutos para reconocer avances, entender dificultades y ajustar acuerdos.
13. **Piloto de 30 días:** empezar pequeño, revisar qué funciona y retirar datos que no aporten valor.
14. **Autonomía progresiva:** revisar a los 30, 60 y 90 días. No es una recompensa automática: se acuerda según el contexto.
15. **Evidencia 2025:** la meta-análisis de Bradshaw y colegas reunió 238 estudios y 126.423 participantes. Apoyo a la autonomía se asoció con bienestar (r=.30); control psicológico con malestar (r=.26). Son asociaciones, no prueba causal.
16. **Evidencia diaria 2022:** 159 díadas neerlandesas informaron durante 100 días. Calidez y apoyo a la autonomía se asociaron con bienestar en la mayoría de las familias; no significa que una app produzca ese efecto.
17. **Comunicación 2020:** meta-análisis de 32 estudios; la divulgación voluntaria del adolescente se asoció mejor con el conocimiento parental que la mayoría de estrategias parentales, con calidez como elemento importante.
18. **Aprendizaje:** práctica de recuperación y práctica espaciada son técnicas con respaldo; ADAZ Academy puede calendarizarlas y registrar errores.
19. **ICFES:** Saber 11 tiene cinco pruebas: Lectura Crítica, Matemáticas, Sociales y Ciudadanas, Ciencias Naturales e Inglés, además de cuestionario socioeconómico. Verificar siempre la guía de la convocatoria vigente.
20. **Matemáticas y Lectura:** trabajar interpretación/representación, formulación/ejecución, argumentación; en lectura, comprender, inferir y evaluar textos.
21. **Sociales, Ciencias e Inglés:** análisis de perspectivas y contexto; indagación y explicación basada en evidencia; comprensión de vocabulario y textos.
22. **IELTS Academic:** cuatro habilidades: Listening (~30 min), Reading (60), Writing (60), Speaking (11–14); duración total aproximada 2 h 45 min.
23. **Competencias IELTS:** Listening y Reading para comprender; Writing y Speaking para producir con coherencia, vocabulario, gramática y pronunciación.
24. **Medicina:** ruta introductoria de ciencias, método científico, lectura de evidencia, ética y exploración vocacional; no sustituye el currículo universitario.
25. **Oro Lámina:** inventario, ventas, costos, pedidos, márgenes, proveedores y decisiones comerciales con registros verificables.
26. **ADAZ Academy:** un calendario que combina ICFES, IELTS, Medicina y Negocios, con repasos y revisiones. El horario debe poder ajustarse.
27. **Calidad del contenido:** indicar fuente, año, convocatoria, competencia, dificultad y explicación; separar contenido oficial, simulacro autorizado y ejercicios originales. No atribuir a ICFES o IELTS preguntas creadas por IA.
28. **Decisión:** pedir un piloto de 30 días, con acuerdos de privacidad, responsabilidades y revisión semanal.

## 5. Demostración práctica

1. Abrir ADAZ Personal y mostrar su botón ADAZ Family.
2. Abrir ADAZ Family en el dispositivo del adulto.
3. Confirmar que ambos usan cuentas distintas.
4. Crear una invitación vinculada al correo del adulto y entregar el código directamente.
5. El adulto acepta con el correo invitado.
6. Activar solo una o dos categorías que la familia haya acordado.
7. Publicar un resumen de prueba y verificar qué aparece en el panel familiar.
8. Revocar el vínculo para demostrar que el acceso se puede retirar.

No usar información real hasta ejecutar las migraciones y probar las políticas de acceso con dos cuentas de prueba.

## 6. Estado técnico que debe explicarse con honestidad

**Existe en el repositorio:**
- ADAZ Personal como PWA y sitio publicado.
- ADAZ Family como página separada.
- Acceso desde Personal hacia Family.
- Código de invitaciones vinculado al correo, vencimiento de siete días y cuentas separadas.
- Permisos por categoría, apagados inicialmente para nuevos vínculos.
- Publicación manual de resúmenes y etiqueta de evidencia 'declared'.
- Formularios de planes de salida manuales, sin GPS.
- Migraciones SQL para tablas y políticas RLS, guardadas en el repositorio.
- Compilación Android de prueba de Family completada; compilación con dos sabores Personal + Family en proceso de validación en GitHub Actions.

**Pendiente antes de usar con datos reales:**
- Ejecutar en el proyecto Supabase las tres migraciones SQL en orden.
- Configurar la URL pública del proyecto y la clave publishable/anon; nunca usar service_role en la app.
- Confirmar redirect URLs de autenticación y verificar dos cuentas.
- Probar que el adulto no acceda a categorías apagadas, que no pueda modificar registros del estudiante y que revocar el vínculo retire el acceso.
- Probar en dos dispositivos Android y validar la navegación.
- Generar y distribuir un build firmado de lanzamiento si algún día se requiere una instalación estable; los APK debug son para pruebas.

**No existe todavía:**
- Monitoreo oculto, GPS o acceso a conversaciones.
- Verificación automática independiente de todas las actividades.
- Sincronización de todos los datos de ADAZ (salud detallada, finanzas, clientes, notas privadas).
- Publicación automática a redes sociales.
- Una garantía de que nunca ocurrirá un error o una declaración falsa.

## 7. Preguntas que podrían hacer los padres

**¿Esto garantiza que nunca habrá mentiras?**  
No. Ninguna app puede garantizarlo. El sistema separa autorreportes de evidencia y facilita conversaciones sobre hechos concretos.

**¿Pueden ver todo lo que hago en el teléfono?**  
No. ADAZ TRUST no lee mensajes ni activa GPS, cámara o micrófono. Comparte solamente las categorías acordadas y publicadas.

**¿Pueden cambiar los permisos?**  
El estudiante puede revisar, desactivar categorías o revocar un vínculo. Los límites y excepciones deben conversarse entre todos.

**¿La conexión funciona ya?**  
El código y las migraciones están en GitHub, pero la sincronización real depende de aplicar SQL y probar Supabase. No se debe decir que está operativa hasta superar esas pruebas.

**¿Qué pasa si el plan cambia?**  
Se avisa por el canal familiar acordado; ADAZ no rastrea ni detecta automáticamente el cambio.

**¿Y si una semana no se cumple algo?**  
Se registra con honestidad, se explica el obstáculo y se revisa el acuerdo. Una casilla pendiente no define el carácter de alguien.

## 8. Referencias científicas y oficiales

- Bradshaw, E. L. et al. (2025). *Disentangling autonomy-supportive and psychologically controlling parenting: A meta-analysis of self-determination theory's dual process model across cultures*. American Psychologist, 80(6), 879–895. https://doi.org/10.1037/amp0001389
- Bülow, A. et al. (2022). *Universal ingredients to parenting teens: parental warmth and autonomy support promote adolescent well-being in most families*. Scientific Reports, 12, 16836. https://doi.org/10.1038/s41598-022-21071-0
- Liu, D., Chen, D., & Brown, B. B. (2020). *Do Parenting Practices and Child Disclosure Predict Parental Knowledge? A Meta-Analysis*. Journal of Youth and Adolescence, 49, 1–16. https://doi.org/10.1007/s10964-019-01154-4
- Dunlosky, J. et al. (2013). *Improving Students' Learning With Effective Learning Techniques*. Psychological Science in the Public Interest, 14(1), 4–58. https://doi.org/10.1177/1529100612453266
- ICFES. Guía de orientación Saber 11°, 2026-2. https://www.icfes.gov.co/evaluaciones-icfes/saber-11/guia-de-orientacion-examen-saber-11/
- IELTS. IELTS Academic test format. https://ielts.org/take-a-test/test-types/ielts-academic-test

## 9. Cierre recomendado

“Mi propuesta no es que dejen de preocuparse ni que renuncien a poner límites. Es que acordemos qué información importa, qué privacidad se respeta y cómo revisamos el progreso. Probémoslo durante 30 días. Al final decidimos juntos, a partir de lo que realmente haya funcionado.”
