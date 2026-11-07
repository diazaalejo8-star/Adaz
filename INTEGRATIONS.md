# ADAZ: integración de JACOB, Spotify y conexiones sociales

Este repositorio es una PWA estática de GitHub Pages. No contiene claves privadas ni está conectado a cuentas externas por defecto. La aplicación local puede seguir funcionando sin activar ninguna integración.

## Qué permite esta versión

- Spotify: abre un enlace o playlist de Spotify. El control avanzado usa OAuth Authorization Code con PKCE y funciones de Spotify Web API; requiere registrar tu propia app de desarrollador y tener Spotify Premium para controlar la reproducción.
- Nube: sube una instantánea de tu progreso a tu propia tabla privada Supabase, pero únicamente después de configurar un proyecto, iniciar sesión y activar de forma explícita la copia automática. Es una copia unidireccional desde este dispositivo; la restauración desde la nube es una acción aparte y reemplaza los datos locales después de pedir confirmación.
- JACOB: envía una consulta y el resumen local autorizado de ADAZ —incluidos Aestel Business, ADAZ Health, Academy y agenda— a una Supabase Edge Function; esa función llama a la OpenAI API. La conversación se guarda localmente y el acceso es bajo demanda.
- ChatGPT: la aplicación no puede conectarse a tu historial privado de ChatGPT ni subir mensajes a esta conversación automáticamente. El botón Preparar resumen para ChatGPT descarga un archivo que tú puedes adjuntar manualmente aquí. El uso de la OpenAI API tiene facturación independiente del plan de ChatGPT.

## A. Spotify: abrir música primero

1. En ADAZ, abre IA y conexiones.
2. Pega el enlace de una playlist, álbum o artista en el campo de Spotify y guarda. El botón Abrir música en Spotify abre ese enlace; esto no necesita el acceso avanzado.
3. Para control avanzado, crea una app personal en el Spotify Developer Dashboard: https://developer.spotify.com/dashboard
4. Sigue la guía de OAuth Authorization Code with PKCE: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
5. Registra como Redirect URI exactamente la dirección que muestra ADAZ, normalmente https://diazaalejo8-star.github.io/Adaz/. La URI del Dashboard y la de la app deben coincidir exactamente.
6. Copia el Client ID público (no hay que poner un client secret en la app) y pulsa Conectar control de Spotify. Acepta permisos y vuelve a ADAZ.
7. Abre Spotify en un dispositivo y empieza una reproducción una vez. En ADAZ pulsa Actualizar dispositivo / canción, elige el dispositivo si aparece y prueba Reproducir esta lista con un enlace real de playlist, álbum o artista.

Condiciones actuales: Spotify anunció que las apps nuevas de Development Mode requieren Premium para el propietario, admiten hasta cinco usuarios autorizados y tienen un conjunto limitado de endpoints. Las funciones de reproducción remota son para Premium y necesitan un dispositivo Spotify Connect disponible. Si no tienes Premium o Spotify no autoriza tu app, la integración simple para abrir Spotify seguirá disponible. La sesión OAuth se guarda localmente en este dispositivo; úsalo solo en un dispositivo privado. Desconectar Spotify borra el token de ADAZ, pero no revoca el permiso en la cuenta de Spotify; revócalo también desde las apps conectadas de tu cuenta si lo necesitas.

## B. Supabase: cuenta privada y base de datos

Necesitas un proyecto Supabase. En ADAZ > IA y conexiones, introduce el Project URL y la publishable key (o anon key pública) de tu proyecto. No utilices la secret key ni service-role key en el navegador.

1. En el Dashboard de Supabase abre SQL Editor y ejecuta todo el archivo supabase/schema.sql. Esto crea adaz_snapshots con Row Level Security y una tabla de control de uso de IA.
2. En Authentication > URL Configuration, añade a las Redirect URLs permitidas: https://diazaalejo8-star.github.io/Adaz/
3. En Authentication > Providers, verifica que Email está activo. Supabase enviará un enlace de acceso; ábrelo desde el mismo teléfono/computador en que usarás ADAZ. El servicio de correo puede necesitar configuración adicional.
4. En ADAZ guarda la configuración y pulsa Probar configuración; solicita el enlace de acceso con tu correo.
5. La sincronización está apagada por defecto. Marca el consentimiento Acepto sincronizar automáticamente mis datos de ADAZ solo cuando hayas revisado los datos que se subirán. Sincronizar ahora permite hacer una copia manual.

La tabla de progreso guarda el estado completo de la app: tareas, registros académicos, datos de negocio/finanzas, entrenamiento, bienestar y revisiones. No incluyas información que no quieras guardar en una base remota. Puedes desactivar la sincronización en cualquier momento. Desactivar no elimina copias ya almacenadas en Supabase: debes borrarlas en el Dashboard o con una acción explícita de borrado.

Si eres menor de 18 años, pide permiso y apoyo a tu padre, madre o tutor antes de configurar la API, la facturación o enviar datos personales a servicios externos. No introduzcas datos sensibles en campos de demostración.

## C. Desplegar el copiloto seguro

El navegador no debe llamar directamente a la OpenAI API con una API key. La clave se guarda exclusivamente en Secrets del lado del servidor. Consulta las recomendaciones oficiales sobre seguridad de API keys de OpenAI: https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety

1. En tu proyecto de Supabase abre Edge Functions y crea una función llamada adaz-planner.
2. Copia el archivo supabase/functions/adaz-planner/index.ts al editor de la función.
3. En la configuración de Secrets de Edge Functions establece OPENAI_API_KEY (una API key propia) y, opcionalmente, OPENAI_MODEL. No compartas esa clave por chat ni la guardes en el repositorio. El código usa gpt-6-astra como nombre por defecto; si tu cuenta de API no dispone de ese modelo, cambia OPENAI_MODEL a uno habilitado en tu proyecto.
4. Si quieres permitir que el copiloto investigue información actual al necesitarla, añade la variable de servidor ADAZ_ENABLE_WEB_SEARCH=true. Esto habilita la herramienta web_search de Responses API y puede aumentar el coste; si no la configuras, el copiloto trabaja con el resumen de ADAZ y el conocimiento del modelo sin búsqueda en vivo.
5. Deja la validación JWT activada. La función requiere sesión autenticada, valida el usuario con Supabase Auth, aplica un límite de ocho consultas por usuario por hora y utiliza store:false en la petición a la Responses API.
6. En ADAZ guarda el Project URL, la publishable/anon key y la URL de función https://TU-PROYECTO.supabase.co/functions/v1/adaz-planner.
7. Inicia sesión, marca Acepto compartir el resumen actual de ADAZ al pedir análisis de IA y realiza una consulta de prueba. La función recibe el estado de ADAZ en ese momento; la API cobra según tu propia configuración de facturación.

La integración consulta al modelo únicamente cuando pulsas Consultar copiloto. Los datos pueden sincronizarse automáticamente a Supabase, pero no se generan consultas de IA por cada casilla marcada, lo que evita gastos imprevisibles.

## D. Diseño basado en investigación y experiencia real

ADAZ prioriza funciones que aparecen repetidamente en la evidencia sobre herramientas de hábitos: registro de conducta, objetivos específicos, recordatorios elegidos por la persona y feedback de progreso. El diseño evita convertir cada minuto en una tarea obligatoria porque las funciones de gamificación demasiado exigentes y las aplicaciones sobrecargadas pueden aumentar la fricción. Esto es una orientación de diseño; no demuestra que ADAZ vaya a producir resultados por sí sola.

Fuentes:
- Zhu et al., Digital Behavior Change Intervention Designs for Habit Formation: Systematic Review, Journal of Medical Internet Research (2024): https://www.jmir.org/2024/1/e54375/
- Potential associations between behavior change techniques and engagement with mobile health apps: a systematic review (2023): https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1227443/full
- Experiencias comunitarias sobre simplicidad y fricción en apps de productividad (testimonios, no evidencia experimental): https://www.reddit.com/r/ProductivityApps/comments/1nq3pu9/whats_the_simplest_productivity_app_that_actually/
- Spotify OAuth PKCE: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
- Spotify Web API, requisitos y permisos: https://developer.spotify.com/documentation/web-api
- OpenAI API key safety: https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
- OpenAI Responses API / conversation state: https://developers.openai.com/api/docs/guides/conversation-state

## E. Verificación

Antes de considerar la integración terminada:
- prueba crear sesión y solicitar enlace de acceso en Supabase;
- comprueba que un registro se sincroniza y que solo ese usuario puede leerlo;
- prueba una consulta al copiloto y revisa los límites de uso;
- prueba Spotify con una playlist real y un dispositivo activo;
- comprueba que ADAZ sigue abriendo y guardando datos si el usuario no conecta nada;
- no compartas ni subas capturas que contengan tokens o claves privadas.


## F. JACOB — agente de ADAZ

JACOB utiliza la Edge Function existente adaz-planner. La versión de código actualizada:
- personaliza las instrucciones para Aestel Business, Marketing, Academy, Health y planificación;
- incorpora a la instantánea de contexto los módulos Aestel, Health, Academy y Timeline;
- mantiene autenticación de Supabase, límite de consultas y la API key exclusivamente en el servidor;
- usa gpt-6.1-sol como modelo predeterminado, modificable mediante OPENAI_MODEL en Supabase Secrets.

Para activarlo:
1. Despliega de nuevo supabase/functions/adaz-planner/index.ts desde el proyecto Supabase.
2. En Edge Function Secrets configura OPENAI_API_KEY y, si quieres, OPENAI_MODEL=gpt-6.1-sol.
3. En ADAZ configura el Project URL, la publishable/anon key y la URL de la función; inicia sesión y acepta el consentimiento solo después de revisar qué datos se compartirán.
4. Envía una consulta de prueba sobre Aestel Business y comprueba que JACOB no invente métricas.

El código de JACOB ya está en el repositorio, pero no estará operativo desde la app hasta que la función se despliegue y los secretos estén configurados. La facturación de la OpenAI API es independiente de ChatGPT. Define límites de gasto en el proyecto antes de usarlo de forma frecuente.

## G. Aestel Business — Instagram y TikTok

La versión actual implementa una cola local de borradores y una aprobación interna. Aprobar un borrador significa únicamente que quedó marcado como aprobado para revisión y publicación manual dentro de ADAZ; no publica ni edita ninguna cuenta externa.

Para Instagram:
- La cuenta de destino debe ser profesional (Business o Creator según la API y función elegida).
- Se necesita registrar una app en Meta for Developers, implementar el flujo de autorización y solicitar los permisos mínimos para los datos y acciones que se desean usar.
- Revisa la documentación: https://developers.facebook.com/docs/instagram-platform/

Para TikTok:
- La Display API y Content Posting API son productos distintos. Consultar perfil/vídeos requiere los scopes correspondientes; publicar directamente requiere el scope video.publish, consentimiento del creador, revisión/auditoría de la app y cumplimiento de sus reglas.
- Los clientes no auditados tienen restricciones de visibilidad para contenido publicado.
- Revisa el inicio de Content Posting API: https://developers.tiktok.com/docs/en/content-posting-api-get-started
- Revisa Display API: https://developers.tiktok.com/docs/en/display-api-overview

Diseño previsto para producción:
1. Registrar apps en los portales de desarrollador y configurar HTTPS redirect URI.
2. Usar Authorization Code + PKCE y comprobar state en el callback.
3. Intercambiar códigos y mantener refresh tokens cifrados en el backend; no guardar client secrets ni tokens sociales en JavaScript, GitHub, localStorage o APK.
4. Obtener scopes aprobados y respetar la revocación.
5. Antes de publicar, presentar el canal, texto, multimedia, visibilidad y hora exactos. Exigir una confirmación independiente justo antes de cada publicación.
6. Registrar el ID de publicación y resultado de la API; permitir cancelar borradores y desconectar cuentas.

La PWA es un cliente público y no puede proteger client secrets. La guía vigente de OAuth para apps de navegador recomienda Authorization Code + PKCE y una arquitectura backend/BFF cuando se necesita custodiar tokens: https://www.rfc-editor.org/rfc/rfc10017.html

No introduzcas contraseñas, códigos 2FA o tokens en ADAZ ni en el chat. Antes de autorizar una cuenta social, compartir datos o configurar servicios con cobro, revisa los permisos y condiciones con tu padre, madre o acudiente y cumple las reglas de edad de la plataforma.

## H. Seguridad de Spotify

El control avanzado usa OAuth PKCE. La versión actual mantiene tokens de Spotify solo en memoria y elimina un token persistente heredado si lo encuentra; por ello puede ser necesario volver a autorizar Spotify al cerrar o recargar ADAZ. La opción Abrir música sigue disponible sin control remoto.

## I. Nuevos datos incluidos en respaldos

Los respaldos JSON y la instantánea de nube incluyen ahora:
- Aestel Business: registros de ventas y borradores.
- ADAZ Health: hábitos y notas opcionales.
- Academy: progreso gamificado.
- Timeline: actividades planificadas.

Los registros de salud y negocio pueden ser privados. Mantén la sincronización desactivada salvo que realmente quieras compartirlos con tu propio proyecto Supabase y hayas revisado el consentimiento.


## JACOB — guía paso a paso de activación

Consulta también **JACOB-ACTIVACION.md** en la raíz del repositorio. Incluye el orden recomendado: aplicar el SQL privado, desplegar la Edge Function, guardar OPENAI_API_KEY en Supabase Edge Function Secrets, configurar Redirect URLs, iniciar sesión en ADAZ y probar una consulta.

El backend utiliza GPT-6.1 Sol (gpt-6.1-sol) por defecto, límite de 8 consultas por usuario y hora y máximo de 1.400 tokens de salida por respuesta. Esto reduce el tamaño de cada respuesta, pero no representa un límite mensual de gasto. La cuenta API y cualquier forma de pago deben ser administradas por un adulto responsable; la facturación de API es independiente de ChatGPT.

Supabase provee actualmente SUPABASE_PUBLISHABLE_KEYS y SUPABASE_SECRET_KEYS como variables de entorno predeterminadas. El código de JACOB las utiliza con fallback a las claves heredadas. No pegues claves secretas de Supabase en ADAZ o GitHub.

JACOB recibe resumen de tareas, estudio, Aestel Business, Academy, agenda y recordatorios cuando el usuario inicia sesión y acepta el consentimiento. Los registros personales de gimnasio, natación, sueño y alimentación permanecen en el dispositivo y se excluyen del resumen enviado.
