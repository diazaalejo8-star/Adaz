# ADAZ Family — configuración y prueba

## Arquitectura

- **ADAZ Personal** abre `index.html` y conserva el plan, Academy, salud, negocio y agenda.
- **ADAZ Family** abre `family.html` con un panel independiente para los adultos invitados.
- Ambas aplicaciones usan el mismo proyecto Supabase, pero cada integrante inicia sesión con su propio correo.
- El panel familiar solo recibe resúmenes que el estudiante publica manualmente y categorías que él activa.
- No se sincronizan conversaciones, contraseñas, notas privadas, datos detallados de salud, clientes, importes comerciales ni ubicación GPS.

## 1. Preparar Supabase

1. Abre el proyecto Supabase que ya usas para ADAZ.
2. En **SQL Editor**, abre una consulta nueva.
3. Abre `supabase/ADAZ-FAMILY-SETUP.sql` en el repositorio, copia todo su contenido y ejecútalo una sola vez. Ese archivo reúne las seis migraciones en orden, incluida `202611120004_adaz_usage_monitoring.sql`.
4. Revisa que las tablas `adaz_family_*`, `adaz_outing_requests`, `adaz_parent_responses` y `adaz_usage_snapshots` aparezcan creadas.
5. En **Authentication → URL Configuration → Redirect URLs**, permite estas rutas de retorno: `https://diazaalejo8-star.github.io/Adaz/`, `https://diazaalejo8-star.github.io/Adaz/family.html*`, `adazpersonal://auth-callback` y `adazfamily://auth-callback`. Las dos últimas devuelven el enlace mágico directamente a su APK correspondiente.
6. Usa únicamente el **Project URL** y la clave pública **publishable/anon**. Nunca pegues una `service_role` o una clave secreta en la aplicación.

> El SQL está preparado en un único archivo, pero no se ejecuta automáticamente en tu proyecto Supabase. Debe aplicarse y probarse allí antes de usar datos reales.

## 2. Vincular las cuentas

1. En ADAZ Personal, abre **ADAZ Family** desde el acceso superior.
2. Guarda el Project URL y la clave pública. Si ya configuraste la nube en ADAZ Personal, Family puede reutilizar esa configuración en ese mismo dispositivo.
3. En cada aplicación, guarda el mismo Project URL y clave pública. Como Android mantiene datos separados por APK, no se copian automáticamente entre teléfonos.
4. Cada integrante escribe su propio correo y pulsa **Enviar enlace de acceso**. En las APK Android, el enlace mágico debe abrir la aplicación correspondiente (ADAZ Personal o ADAZ Family) mediante su esquema propio. En la versión web se mantiene el retorno a GitHub Pages. Personal y Family usan el mismo acceso sin contraseña.
4. En la pestaña ADAZ Personal, escribe el correo del adulto y crea una invitación.
5. Comparte el código directamente con ese adulto.
6. El adulto instala ADAZ Family, introduce el mismo Project URL y clave pública, solicita su enlace de acceso con el correo invitado y, tras iniciar sesión, acepta el código.
7. En tu cuenta, activa únicamente las categorías que hayas acordado compartir.

La invitación está ligada al correo y vence en siete días. El correo de la cuenta invitada es una comprobación de acceso, no una verificación legal de identidad; confirma personalmente que corresponde a tu padre, madre o acudiente.

## 3. Publicar y revisar

- El estudiante pulsa **Compartir resumen seleccionado** cuando decide publicar.
- Los datos se etiquetan como **declarados**; la app no finge que un registro fue verificado por terceros.
- Los adultos solo pueden consultar categorías autorizadas y resúmenes publicados.
- Los planes de salida se escriben manualmente; no existe rastreo de ubicación.
- El estudiante puede desactivar categorías o revocar un vínculo.

## 4. Activar estadísticas de uso en Android

1. Instala la APK ADAZ Personal **1.3.1** reconstruida y abre el acceso **ADAZ Family** desde ADAZ Personal.
2. En la sección de estadísticas de uso, pulsa **Autorizar acceso de uso en Android** y activa el permiso especial para ADAZ.
3. Activa **Estadísticas de uso** en los permisos compartidos y guarda los cambios.
4. Pulsa **Iniciar seguimiento visible**. Acepta el permiso de notificaciones; Android debe mostrar una notificación persistente mientras el servicio esté activo.
5. El servicio registra la aplicación en primer plano y los minutos acumulados por aplicación. Sincroniza los datos con Supabase cada 20 segundos mientras el servicio esté ejecutándose. ADAZ Family actualiza el panel cada 15 segundos cuando está abierto.
6. Para dejar de compartir, desactiva el permiso **Estadísticas de uso** o pulsa **Detener**. Ambas acciones detienen la captura y retiran la última lectura del panel familiar. Cerrar sesión en ADAZ Personal también detiene el seguimiento. Los tokens de sesión usados por el servicio se cifran con Android Keystore.

El panel no captura la pantalla, el contenido de otras aplicaciones, mensajes, pulsaciones, audio, cámara ni ubicación. El permiso debe estar activado y guardado antes de que el botón de inicio permita comenzar. Si la última lectura tiene más de 60 segundos, el panel deja de presentar una aplicación como si siguiera activa y muestra que no hay actualización reciente. Android puede limitar el servicio por batería, reinicio del dispositivo o restricciones del fabricante; revisa la hora de la última captura en ADAZ Family.

## 5. Construir las APK de prueba

El workflow `.github/workflows/build-adaz-apks.yml` construye dos APK independientes:

- `app-personal-debug.apk` — paquete `com.adaz.personal`, abre `index.html`.
- `app-family-debug.apk` — paquete `com.adaz.family`, abre `family.html?role=parent`.

Descarga el artefacto `ADAZ-Personal-and-Family-APKs` desde GitHub Actions. Son APK de depuración para pruebas, no versiones de lanzamiento firmadas. Las dos APK pueden instalarse simultáneamente porque usan identificadores distintos.

## 6. Pruebas antes de confiar en el sistema

- Probar dos cuentas distintas: estudiante y adulto invitado.
- Confirmar que un correo no invitado no puede aceptar el código.
- Confirmar que una cuenta adulta no puede leer categorías desactivadas.
- Confirmar que una cuenta adulta no puede cambiar ni borrar registros del estudiante.
- Confirmar que revocar el vínculo elimina el acceso familiar.
- Publicar un resumen de prueba y comprobar que no aparecen detalles privados.
- Probar la APK Family en un dispositivo Android distinto y revisar el inicio de sesión por correo.
- Verificar que el inicio queda bloqueado si el permiso `usage` está desactivado.
- Verificar que al detener el seguimiento, desactivar el permiso o cerrar sesión se retira la última lectura del panel.
- Dejar el teléfono sin conexión o detener el servicio y comprobar que, tras 60 segundos, el panel no presenta la última aplicación como si fuera actual.
- Comprobar la última hora de captura y el comportamiento cuando se detiene el servicio o se pierde la conexión.

No uses información real hasta que las pruebas de permisos y acceso hayan pasado.
