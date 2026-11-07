# Activar JACOB en ADAZ

Guía de despliegue para el proyecto Supabase del propietario/responsable de ADAZ. No pegues claves o tokens en GitHub, ADAZ, documentos compartidos ni conversaciones.

## Antes de empezar

Se necesitan:
- Un proyecto Supabase activo, cuyo administrador pueda gestionar Edge Functions y secretos.
- La tabla privada de ADAZ creada con el SQL del repositorio.
- Un proyecto OpenAI API con facturación habilitada y una API key de servidor. La facturación de API es separada de ChatGPT.
- Un adulto responsable para revisar la cuenta, permisos, datos que se compartirán y cualquier forma de pago. No se deben eludir los requisitos de edad de ningún servicio.

La API key de OpenAI debe añadirse directamente a Supabase Edge Function Secrets. Nunca la compartas conmigo ni la guardes en GitHub.

## Paso 1 — Crear o abrir el proyecto Supabase

Abre https://supabase.com/dashboard y crea un proyecto o selecciona el que ya usa ADAZ. Guarda el Project URL y obtén una Publishable key (o la clave anon si el proyecto aún utiliza el esquema anterior). Esas dos piezas son las que se introducen después en la pantalla de conexiones de ADAZ.

No compartas la Secret key / service_role key. El backend obtiene las claves administrativas desde el entorno de Supabase; el código admite las variables actuales SUPABASE_SECRET_KEYS y SUPABASE_PUBLISHABLE_KEYS, además de las variables heredadas.

## Paso 2 — Crear las tablas privadas

En el proyecto, abre SQL Editor > New query. Copia el contenido completo de:
https://raw.githubusercontent.com/diazaalejo8-star/Adaz/main/supabase/schema.sql

Ejecuta el SQL. Debe crear:
- adaz_snapshots, con Row Level Security y políticas por usuario.
- adaz_ai_usage, para el límite de consultas de JACOB.

No ejecutes SQL que no reconozcas. Si aparece un error, conserva el mensaje y revísalo antes de continuar.

## Paso 3 — Desplegar la Edge Function

En Supabase abre Edge Functions > Deploy a new function > Via Editor. Crea una función llamada exactamente:
adaz-planner

Reemplaza el contenido de ejemplo por el contenido completo de:
https://raw.githubusercontent.com/diazaalejo8-star/Adaz/main/supabase/functions/adaz-planner/index.ts

Revisa que el editor mantenga el import:
import { createClient } from "npm:@supabase/supabase-js@2";

Pulsa Deploy function. La función se publica en:
https://<PROJECT-REF>.supabase.co/functions/v1/adaz-planner

La función ya valida el JWT del usuario dentro del código. El archivo supabase/config.toml también tiene verify_jwt = true. Conserva la verificación JWT activa en la configuración de la función.

## Paso 4 — Guardar secretos del servidor

Abre Edge Functions > Secrets y añade:
- Key: OPENAI_API_KEY
- Value: la API key creada en el proyecto API de OpenAI por el propietario/responsable.

Opcional:
- Key: OPENAI_MODEL
- Value: gpt-6.1-sol

La función utiliza gpt-6.1-sol por defecto, así que OPENAI_MODEL es opcional. No es necesario guardar manualmente SUPABASE_URL, SUPABASE_PUBLISHABLE_KEYS ni SUPABASE_SECRET_KEYS: Supabase las inyecta en el entorno. El código admite también las variables heredadas SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY.

No coloques la API key de OpenAI en el campo Project URL, Publishable key, JavaScript, GitHub, APK o el chat. La clave solo debe existir como secreto del servidor. Un cambio en Secrets se aplica a las funciones sin volver a desplegarlas.

## Paso 5 — Configurar el acceso por correo

En Authentication > URL Configuration, añade esta URL exacta a Redirect URLs:
https://diazaalejo8-star.github.io/Adaz/

El flujo de ADAZ envía un enlace de un solo uso al correo y redirige a esa dirección. Revisa también que el proveedor Email esté habilitado. Abre el enlace desde el mismo dispositivo donde utilizas ADAZ.

## Paso 6 — Conectar ADAZ

Abre https://diazaalejo8-star.github.io/Adaz/ y entra en JACOB + conexiones (el antiguo apartado IA y conexiones).

En Conexión privada y sincronización:
1. Project URL: pega el Project URL de Supabase.
2. Publishable key / anon key: pega la clave pública del proyecto (no la Secret key).
3. La URL de la función se completa como:
   https://<PROJECT-REF>.supabase.co/functions/v1/adaz-planner
4. Pulsa Guardar conexión.
5. Pulsa Probar configuración.
6. Escribe un correo autorizado y solicita el enlace de acceso.
7. Abre el enlace recibido en ese mismo navegador/dispositivo.

No actives la copia automática de nube como requisito para JACOB. Son funciones diferentes.

## Paso 7 — Autorizar una consulta de prueba

Lee el consentimiento de JACOB antes de activarlo. El resumen enviado incluye tareas, estudio, Aestel Business, Academy, agenda y recordatorios. Los registros personales de gimnasio, natación, sueño y alimentación se mantienen localmente y no se envían al resumen.

Marca el consentimiento solo cuando entiendas lo que se transmite. Escribe una consulta breve, por ejemplo:
"JACOB, revisa los datos registrados de Aestel Business. Separa ventas, costos y resultado estimado, identifica lo que no sabemos todavía y dame tres prioridades de esta semana."

Pulsa Consultar a JACOB. Una respuesta correcta confirma que:
- el correo autenticó al usuario;
- la función Edge recibió el JWT;
- el servidor pudo leer los secretos;
- se comprobó y registró el uso en adaz_ai_usage;
- la OpenAI Responses API devolvió texto.

El endpoint limita a 8 consultas por usuario por hora y cada respuesta tiene máximo 1.400 tokens de salida. Esto no equivale a un tope de gasto mensual. El administrador debe revisar uso y facturación periódicamente.

## Diagnóstico

- 401 / Invalid JWT: inicia sesión de nuevo en ADAZ; confirma verify_jwt y Redirect URLs.
- Missing server-side secrets: comprueba OPENAI_API_KEY en Edge Function Secrets y revisa que Supabase inyecte SUPABASE_URL y las claves de entorno.
- Could not check AI usage: vuelve a ejecutar supabase/schema.sql y comprueba adaz_ai_usage.
- 502 / OpenAI API request failed: revisa que la API key pertenezca a una organización/proyecto con acceso al modelo y facturación habilitada.
- CORS / Origin not allowed: usa el sitio oficial ADAZ con origen https://diazaalejo8-star.github.io; no cambies el origen permitido a *.

La llamada de prueba debe hacerse desde ADAZ después de iniciar sesión. El botón Test de Supabase no tiene automáticamente el JWT de la sesión de ADAZ.

## Privacidad y apagado

La casilla de consentimiento puede desactivarse en cualquier momento. Al hacerlo, ADAZ deja de enviar nuevas consultas a JACOB. Para detener el servicio por completo, el administrador puede deshabilitar/eliminar la Edge Function o retirar el secreto OPENAI_API_KEY. Cerrar la sesión desconecta el usuario actual.

No incluyas en consultas datos de pago, contraseñas, códigos de autenticación, tokens sociales, direcciones personales ni otra información que no haga falta para la pregunta.
