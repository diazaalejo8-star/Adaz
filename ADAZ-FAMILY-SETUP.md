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
3. Copia y ejecuta, en orden, estos archivos del repositorio:
   - `supabase/migrations/202611110001_adaz_family.sql`
   - `supabase/migrations/202611110002_adaz_family_permissions.sql`
4. Revisa que las cinco tablas `adaz_family_*` y `adaz_outing_requests` / `adaz_parent_responses` aparezcan creadas.
5. En **Authentication → URL Configuration**, permite la URL publicada de ADAZ como redirect URL.
6. Usa únicamente el **Project URL** y la clave pública **publishable/anon**. Nunca pegues una `service_role` o una clave secreta en la aplicación.

> La migración está preparada en el repositorio, pero no se ejecuta sola en tu proyecto Supabase. Debe aplicarse y probarse allí antes de usar datos reales.

## 2. Vincular las cuentas

1. En ADAZ Personal, abre **ADAZ Family** desde el acceso superior.
2. Guarda el Project URL y la clave pública. Si ya configuraste la nube en ADAZ Personal, Family puede reutilizar esa configuración en ese mismo dispositivo.
3. Inicia sesión con tu correo usando el enlace enviado por Supabase.
4. En la pestaña ADAZ Personal, escribe el correo del adulto y crea una invitación.
5. Comparte el código directamente con ese adulto.
6. El adulto instala ADAZ Family, introduce el mismo Project URL y clave pública, inicia sesión con el correo invitado y acepta el código.
7. En tu cuenta, activa únicamente las categorías que hayas acordado compartir.

La invitación está ligada al correo y vence en siete días. El correo de la cuenta invitada es una comprobación de acceso, no una verificación legal de identidad; confirma personalmente que corresponde a tu padre, madre o acudiente.

## 3. Publicar y revisar

- El estudiante pulsa **Compartir resumen seleccionado** cuando decide publicar.
- Los datos se etiquetan como **declarados**; la app no finge que un registro fue verificado por terceros.
- Los adultos solo pueden consultar categorías autorizadas y resúmenes publicados.
- Los planes de salida se escriben manualmente; no existe rastreo de ubicación.
- El estudiante puede desactivar categorías o revocar un vínculo.

## 4. Construir las APK de prueba

El workflow `.github/workflows/build-adaz-apks.yml` construye dos APK de depuración:

- `app-personal-debug.apk` — paquete `com.adaz.personal`
- `app-family-debug.apk` — paquete `com.adaz.family`

Después de que GitHub Actions termine correctamente, descarga el artefacto **ADAZ-Personal-and-Family-APKs** desde la ejecución del workflow. Son APK de depuración para pruebas, no APK de lanzamiento firmadas para distribución pública.

## 5. Pruebas antes de confiar en el sistema

- Probar dos cuentas distintas: estudiante y adulto invitado.
- Confirmar que un correo no invitado no puede aceptar el código.
- Confirmar que una cuenta adulta no puede leer categorías desactivadas.
- Confirmar que una cuenta adulta no puede cambiar ni borrar registros del estudiante.
- Confirmar que revocar el vínculo elimina el acceso familiar.
- Publicar un resumen de prueba y comprobar que no aparecen detalles privados.
- Probar los dos APK en dispositivos Android distintos y revisar el inicio de sesión por correo.

No uses información real hasta que las pruebas de permisos y acceso hayan pasado.
