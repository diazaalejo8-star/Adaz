# ADAZ TRUST — configuración y pruebas (1.3.2)

## Alcance funcional vigente

ADAZ Trust utiliza dos APK independientes y un mismo proyecto Supabase:

- **ADAZ Personal**: aplicación del estudiante. Desde aquí se crea la invitación y se activa o detiene el permiso de estadísticas.
- **ADAZ Family**: aplicación del padre, madre o acudiente invitado. Su panel solo muestra estadísticas de uso autorizadas.

El adulto puede ver:
- La aplicación en primer plano, cuando la lectura es reciente.
- El tiempo de uso diario agregado por aplicación.
- La hora y antigüedad de la última sincronización.
- El estado del seguimiento.

El adulto **no puede** ver la pantalla, capturas, contenido interno de otras aplicaciones, mensajes, búsquedas, documentos, pulsaciones, fotos, micrófono, cámara ni ubicación. Tampoco puede acceder a resúmenes de estudio, negocio, entrenamiento o planes de salida. Esas funciones antiguas quedan fuera del producto actual y sus políticas de lectura adulta han sido retiradas.

## Estado de Supabase

El proyecto conectado de ADAZ ya recibió las migraciones de Family, uso, endurecimiento de permisos y alcance exclusivo de uso. Las consultas de comprobación confirmaron:

- RLS habilitado en las tablas de Family y uso.
- La cuenta anónima no puede leer `adaz_usage_snapshots`.
- Un adulto solo puede leer snapshots si existe vínculo activo y `permissions.usage = true`.
- Las demás categorías quedan en `false`.
- El acceso de cliente a `adaz_ai_usage` está revocado.
- Los adultos no tienen permisos de inserción ni políticas de lectura para resúmenes o planes antiguos.

Para una instalación nueva en otro proyecto Supabase, ejecuta `supabase/ADAZ-FAMILY-SETUP.sql` completo desde SQL Editor. El archivo incluye el esquema inicial y las restricciones del alcance actual. **No vuelvas a ejecutarlo en el proyecto que ya está configurado**, salvo que estés reconstruyendo el entorno.

Usa únicamente Project URL y clave pública publishable/anon. Nunca coloques una clave `service_role` o una clave secreta dentro de la APK.

## Vincular las dos cuentas

1. Instala ADAZ Personal en el teléfono del estudiante.
2. Instala ADAZ Family en el teléfono del padre, madre o acudiente.
3. Guarda el mismo Project URL y la misma clave pública en cada aplicación. La configuración no se copia automáticamente entre APK.
4. En cada teléfono, solicita el enlace mágico con el correo propio y ábrelo en ese mismo dispositivo para iniciar sesión.
5. En ADAZ Personal, escribe el correo del adulto y genera el código de invitación.
6. Comparte el código directamente con el adulto. El código vence en siete días.
7. En ADAZ Family, el adulto debe iniciar sesión con ese mismo correo destinatario e introducir el código.
8. En ADAZ Personal, activa únicamente **Estadísticas de uso** y guarda el permiso. Por defecto queda desactivado.

La invitación comprueba que la cuenta usa el correo destinatario, pero no constituye verificación legal de identidad. Confirma personalmente que el correo pertenece a tu acudiente.

## Activar estadísticas de uso en Android

1. En ADAZ Personal, abre el panel de ADAZ Family.
2. Pulsa **Autorizar acceso de uso en Android**.
3. En Ajustes de Android, autoriza el acceso especial a estadísticas de uso para ADAZ y vuelve a la app.
4. Activa **Estadísticas de uso** y guarda los cambios.
5. Pulsa **Iniciar seguimiento visible**.
6. Acepta las notificaciones si Android las solicita. Mientras esté activo debe aparecer una notificación persistente de ADAZ TRUST.
7. El servicio envía snapshots aproximadamente cada 20 segundos. ADAZ Family actualiza el panel aproximadamente cada 15 segundos mientras permanece abierto.

El panel deja de presentar una aplicación como actual cuando la lectura supera los 60 segundos. Android puede pausar o limitar servicios por batería, reinicio del teléfono o restricciones del fabricante.

## Detener y retirar el acceso

- Pulsa **Detener** en ADAZ Personal para detener el servicio y retirar la última lectura del panel.
- Desactiva el permiso de estadísticas y guarda los cambios para detener el servicio y retirar el snapshot.
- Revoca el vínculo del adulto desde ADAZ Personal para retirar su acceso.
- Cerrar sesión en ADAZ Personal detiene el servicio y trata de eliminar el último snapshot.
- Si se pierde conexión, ADAZ Family muestra la antigüedad del dato y no lo presenta como actual después de 60 segundos.

Los tokens utilizados por el servicio Android se almacenan cifrados mediante Android Keystore.

## Pruebas de aceptación

- [ ] Crear dos cuentas distintas, una para Personal y otra para Family.
- [ ] Generar un código para el correo exacto del acudiente.
- [ ] Verificar que otro correo no puede aceptar el código.
- [ ] Confirmar que Family abre directamente su panel de adulto, no el panel de estudiante.
- [ ] Con `usage=false`, el adulto no recibe registros de uso.
- [ ] Con `usage=true`, el adulto ve aplicación activa, minutos diarios y antigüedad de la lectura.
- [ ] Confirmar que ADAZ Family no muestra resúmenes, planes de salida ni categorías adicionales.
- [ ] Detener el servicio y verificar que el último snapshot se elimina.
- [ ] Desactivar el permiso y comprobar que el panel deja de mostrar estadísticas.
- [ ] Perder conexión o detener el servicio y confirmar que, pasados 60 segundos, el dato aparece como no reciente.
- [ ] Probar ambas APK en teléfonos físicos distintos.

## Compilación

El workflow `.github/workflows/build-adaz-apks.yml` construye dos APK de depuración:

- `com.adaz.personal` — ADAZ Personal.
- `com.adaz.family` — ADAZ Family.

Las APK debug sirven para pruebas; no son paquetes release firmados para distribución comercial.
