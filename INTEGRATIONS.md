# ADAZ: integración de Spotify y copiloto con IA

Este repositorio es una PWA estática de GitHub Pages. No contiene claves privadas ni está conectado a cuentas externas por defecto. La aplicación local puede seguir funcionando sin activar ninguna integración.

## Qué permite esta versión

- Spotify: abre un enlace o playlist de Spotify. El control avanzado usa OAuth Authorization Code con PKCE y funciones de Spotify Web API; requiere registrar tu propia app de desarrollador y tener Spotify Premium para controlar la reproducción.
- Nube: sube una instantánea de tu progreso a tu propia tabla privada Supabase, pero únicamente después de configurar un proyecto, iniciar sesión y activar de forma explícita la copia automática. Es una copia unidireccional desde este dispositivo; la restauración desde la nube es una acción aparte y reemplaza los datos locales después de pedir confirmación.
- Copiloto: envía una consulta y el resumen local de ADAZ a una Supabase Edge Function; esa función llama a la OpenAI API. La conversación se guarda localmente y el acceso a la IA es bajo demanda para evitar costes por cada cambio.
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
