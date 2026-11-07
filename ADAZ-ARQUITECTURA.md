# ADAZ · arquitectura del producto y evolución

Fecha de revisión: 7 de noviembre de 2026

## 1. Qué es ADAZ

ADAZ es una PWA instalable: la misma aplicación web se abre en navegador y puede añadirse a la pantalla de inicio o empaquetarse para Android. Mantiene una interfaz ligera, módulos JavaScript por dominio, almacenamiento local y servicios externos opcionales.

La interfaz utiliza una identidad visual propia: superficies oscuras, acento lima, tarjetas de progreso, retos breves y paneles operativos. Las referencias de experiencia son aplicaciones de aprendizaje, streaming y productividad; no se copian marcas, logotipos ni pantallas.

## 2. Módulos incluidos en esta versión

- Panel del día y rutina: tareas, recordatorios y foco.
- Academy: práctica ICFES e IELTS, micro-retos y Wordle English. Las preguntas creadas por ADAZ se identifican como originales.
- Aestel Business: registro de ventas y costos, resultado estimado, calendario de borradores, aprobaciones internas y proveedores de referencia.
- ADAZ Health: actividad de gimnasio y natación, registro opcional de hábitos alimentarios, sueño y recuperación. No calcula calorías ni recomienda restricciones.
- ADAZ Timeline: actividades planificadas y registros agrupados por día, semana y mes.
- JACOB: agente de IA bajo demanda para planificar, revisar el negocio, estudiar y analizar avances.
- Spotify: apertura de enlaces y playlists; control avanzado opcional mediante Spotify Web API.

## 3. Capas técnicas

### Interfaz PWA
index.html contiene la estructura principal y los estilos globales. Los módulos separados son adaz-extra.js, adaz-academy.js, adaz-business-health.js y adaz-integrations.js. Separar funciones por dominio reduce el acoplamiento y permite ampliar cada sección sin reconstruir toda la app.

### Funcionamiento sin conexión
sw.js precarga el shell y los archivos estáticos. Los registros se guardan localmente en el navegador:
- adaz-data-v1: tareas, estudio, negocio y entrenamientos.
- adaz-aestel-v1: ventas y borradores de Aestel.
- adaz-health-v1: hábitos y notas opcionales de Health.
- adaz-agenda-v1: agenda.
- adaz-academy-v1: progreso gamificado.

La PWA debe permitir revisar materiales y registrar actividad sin conexión. Las funciones que llaman a IA, Spotify o plataformas sociales necesitan internet.

### Sincronización y servidor
Supabase Auth identifica al usuario. La tabla privada adaz_snapshots guarda una copia JSON por usuario y aplica Row Level Security. La función Edge adaz-planner valida la sesión, aplica un límite de uso y llama a OpenAI desde el servidor. La clave de OpenAI debe vivir en Supabase Secrets; nunca en HTML, JavaScript, APK ni GitHub.

JACOB recibe un resumen local únicamente cuando el usuario inicia sesión y acepta expresamente compartirlo. No consulta el historial privado de ChatGPT. El uso de OpenAI API se factura por separado de ChatGPT.

### OAuth y credenciales
Una PWA es un cliente público: no puede proteger un client secret embebido. Las conexiones nuevas deben usar Authorization Code + PKCE. Para servicios sociales, la arquitectura de producción debe mover el intercambio y almacenamiento de tokens al backend (BFF/Edge Function), mantener secretos en el servidor, aplicar mínimo privilegio y permitir revocar conexiones. Evitar guardar tokens OAuth persistentes en localStorage; la conexión actual de Spotify conserva tokens solo en memoria y puede requerir reconexión al cerrar o recargar la app.

## 4. Aestel Business y redes sociales

La pantalla actual implementa:
- Registro manual de venta, canal, valor cobrado y costo total.
- Borradores con plataforma, fecha, formato, objetivo y texto.
- Aprobación interna, copia de texto y eliminación con confirmación.
- Fichas de proveedores Tree Gold y Beads Market Co. con enlaces para verificar cotizaciones.

La conexión directa de Instagram y TikTok no está activada. La cola de contenido funciona como planificador y centro de aprobación manual. La aprobación interna no publica nada. No se introducen contraseñas, códigos 2FA o tokens en el formulario.

Para una integración real:
1. Registrar una aplicación propia en Meta for Developers y TikTok for Developers.
2. Configurar Redirect URI HTTPS y OAuth con PKCE.
3. Solicitar solo los permisos indispensables.
4. Implementar callback y almacenamiento seguro de tokens en el backend.
5. Pasar las revisiones/auditorías requeridas por cada plataforma.
6. Probar lectura de métricas y publicación en una cuenta de prueba.
7. Mostrar el contenido exacto, canal, texto, multimedia y privacidad; exigir confirmación explícita justo antes de publicar.
8. Registrar resultado, ID de publicación y errores sin exponer tokens.

Instagram API requiere una cuenta profesional y los permisos que correspondan a la función solicitada. TikTok tiene APIs distintas para mostrar perfiles/vídeos y para publicar; el permiso de publicación y la auditoría del cliente son requisitos independientes. Las apps no auditadas tienen restricciones en la visibilidad del contenido publicado.

Al ser una persona menor de edad, cualquier cuenta, autorización de plataforma, intercambio de datos o gasto de API debe revisarse con su padre, madre o acudiente y cumplir las reglas de edad de cada servicio. No se deben sortear verificaciones.

## 5. JACOB: alcance y límites

JACOB está diseñado para:
- Analizar ventas, costos, margen, flujo de caja, pedidos y prioridades de Aestel.
- Proponer calendarios, campañas, copies, guiones y pruebas de contenido.
- Revisar ICFES, IELTS y orientación vocacional.
- Organizar rutina, estudio y bienestar con carga realista.
- Usar evidencia actual cuando la búsqueda web esté habilitada.

JACOB puede proponer cambios; no debe afirmar que cambió un perfil, publicó contenido, compró, envió un mensaje o modificó datos sin una integración efectiva y una confirmación explícita. La pantalla de aprobación de borradores es local y no sustituye el consentimiento de publicación de las plataformas.

## 6. ADAZ Health

El módulo combina el registro de entrenamiento existente (incluida natación) con la biblioteca educativa de máquinas y un registro opcional de hábitos alimentarios. La guía de máquinas no sustituye la inducción presencial de Smart Fit ni la supervisión de un entrenador.

Para una persona adolescente, el módulo evita metas de peso, calorías o restricción alimentaria. Los ejemplos de comidas son generales, no una dieta clínica ni un plan deportivo individualizado. Alergias, suplementos, crecimiento o alimentación deportiva individual deben revisarse con un profesional habilitado y un acudiente.

## 7. Banco de preguntas: escala con control de calidad

El objetivo útil no es acumular millones de reactivos sin control; es medir dominio y corregir debilidades. Un millón por cada una de las cinco pruebas ICFES y las cuatro competencias IELTS implicaría nueve millones de preguntas. Un volumen así necesita almacenamiento, curación, validación, deduplicación, control de licencias, análisis psicométrico y distribución por dificultad. No se debe generar y publicar todo automáticamente.

La arquitectura de crecimiento recomendada es un banco con estos metadatos:
- Examen y sección/competencia.
- Competencia evaluada, subtema y tipo de pregunta.
- Dificultad y tiempo esperado.
- Enunciado, opciones, respuesta y explicación.
- Fuente, licencia o condición de uso, fecha y versión.
- Autoría (oficial, abierta u original ADAZ) y estado editorial.
- Huella/hash de contenido para detectar duplicados.
- Historial de respuesta, dificultad observada y rendimiento por competencia.

Proceso editorial:
1. Capturar únicamente material oficial publicado para práctica o contenido con licencia compatible.
2. Crear reactivos originales inspirados en las competencias, sin copiar textos protegidos.
3. Validar respuesta, explicación, ambigüedades y nivel con revisión humana.
4. Detectar duplicados y versiones casi idénticas.
5. Pilotear y retirar ítems defectuosos.
6. Adaptar la práctica a errores, dificultad y repaso espaciado.
7. Auditar periódicamente el banco y mantener trazabilidad de fuente/licencia.

El contenido oficial de IELTS se utiliza mediante sus recursos de muestra y enlaces; la app no debe copiar un banco comercial protegido. Los ítems originales de ADAZ se deben marcar como tales. Ningún número de preguntas garantiza C1, band 8 ni un puntaje Saber 11; se necesita práctica representativa, retroalimentación y simulacros cronometrados.

## 8. Plan diario, semanal y mensual

La Timeline ofrece una vista diaria de tareas y registros; la vista semanal y mensual reúne tareas programadas, sesiones de estudio, actividad física, ventas y borradores de contenido. El plan debe revisarse con datos reales: cambiar la fecha no debe borrar un registro previo, y completar una tarea no debe inventar una sesión realizada.

## 9. Estado real de conexiones al 7 de noviembre de 2026

- Repositorio y PWA: los módulos nuevos están guardados en main; el service worker incluye los archivos nuevos.
- Aestel Business / Health / Timeline: código incorporado; los datos se guardan localmente.
- JACOB: instrucciones y contexto del servidor actualizados en código. Para responder desde la app falta desplegar la función en el proyecto Supabase y configurar sus secretos.
- Instagram / TikTok: panel y cola de borradores incluidos; no hay OAuth, lectura de métricas ni publicación automática configurados.
- Spotify: abrir Spotify funciona sin API. El control remoto avanzado requiere Client ID, permisos, Premium y dispositivo activo; los tokens se mantienen en memoria y se puede requerir reconectar tras recargar.
- Banco masivo: no existe todavía una base remota de millones de preguntas ni está conectado el motor de práctica a esa base.

## 10. Siguientes fases

Fase A — estabilización: probar el sitio y APK instalable en Android; verificar persistencia, exportación/importación, modo offline y navegación móvil.

Fase B — JACOB operativo: desplegar Supabase Edge Function, configurar API key como secreto, establecer límites de gasto y probar el consentimiento y los datos enviados.

Fase C — redes sociales: crear apps Meta/TikTok, conseguir permisos y auditorías, implementar OAuth server-side y aprobación por publicación.

Fase D — Academy a escala: construir el esquema de preguntas en base de datos, proceso de importación validada, buscador por competencia y análisis del desempeño.

Fase E — datos y analítica: mover datos estructurados grandes desde localStorage a IndexedDB y Postgres con sincronización, control de versiones, recuperación y exportación. No precargar millones de preguntas en el caché PWA; descargar lotes de práctica y guardar offline solo los paquetes que el usuario elija.
