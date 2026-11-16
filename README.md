# ADAZ — sistema personal de progreso

ADAZ reúne planificación diaria, estudio, negocio de Oro Laminado, entrenamiento, natación, metas personales y revisión semanal. La edición Personal se publica como PWA y tiene un contenedor Android. Existe una segunda edición Android, Family, para consultar estadísticas de uso autorizadas por el estudiante.

## Módulos actuales

- **Hoy y calendario:** tareas, prioridades y plan personal 2026–2027.
- **ADAZ Academy:** prácticas originales para ICFES, IELTS Academic, fundamentos de Medicina y Negocios/Oro Laminado. Las preguntas originales ADAZ no son oficiales; los recursos oficiales se enlazan desde sus sitios de origen.
- **Negocio:** registro de compras, productos, costos, ventas y pedidos. Los registros deben conciliarse con el inventario y la caja reales.
- **ADAZ Health:** registro de gimnasio y natación, con seguimiento general de actividad y recuperación.
- **Metas y finanzas personales:** objetivos personales separados del capital del negocio.
- **ADAZ Family / Trust:** invitaciones entre cuentas y permiso opcional para compartir la aplicación en primer plano y minutos agregados por aplicación. No comparte capturas, mensajes ni contenido interno de otras apps.
- **Datos locales:** el progreso Personal se guarda en el dispositivo. La exportación/importación JSON permite crear y restaurar respaldos.

## Ejecutar en local

Desde la carpeta raíz ejecuta:

```bash
python -m http.server 8000
```

Abre `http://localhost:8000/`. Algunas funciones PWA/Android requieren HTTPS; abrir el HTML como archivo no equivale a probarlas en producción.

## Android: paquetes de prueba

El proyecto contiene dos sabores Android:

- **ADAZ Personal** (`com.adaz.personal`), que abre `index.html`.
- **ADAZ Family** (`com.adaz.family`), que abre `family.html?role=parent`.

El flujo `.github/workflows/build-adaz-apks.yml` compila variantes debug y publica un artefacto llamado `ADAZ-Personal-and-Family-APKs`. Son paquetes de prueba, no APKs firmadas de lanzamiento. Un build correcto no sustituye la validación en un teléfono Android real.

Para que Family muestre datos se necesita configurar la URL y clave pública de Supabase en ambas apps, usar dos cuentas distintas, aceptar una invitación y activar voluntariamente el permiso de uso desde Personal. Android también solicita el acceso de uso del sistema y una notificación persistente mientras el seguimiento está activo. Sin vínculo, permiso y captura reciente, el panel no tendrá datos.

## Integraciones y límites

- Supabase proporciona autenticación, invitaciones y almacenamiento de estadísticas Family con Row Level Security.
- La Edge Function `adaz-planner` está desplegada, pero JACOB permanece pausado por defecto, con JWT obligatorio y compuerta `ADAZ_ENABLE_JACOB`. No habilitarla sin decisión explícita y prueba del flujo.
- Una cola de borradores de redes sociales no equivale a una integración OAuth ni a publicación automática en Instagram o TikTok.
- Abrir Spotify o enlaces externos no equivale a una integración de control remoto estable.
- Los recordatorios `.ics` dependen de la aplicación de calendario del teléfono; la PWA no garantiza notificaciones cuando está cerrada.

## Privacidad y mantenimiento

No introduzcas claves `service_role`, contraseñas, tokens ni códigos de doble factor en formularios, HTML, JavaScript o APK. Los permisos Family empiezan desactivados y pueden retirarse. Las actualizaciones deben conservar las claves y estructuras de almacenamiento local: nunca se debe borrar el progreso para resolver errores.

Las migraciones de Supabase deben mantenerse sincronizadas con el historial del repositorio y comprobarse antes de modificar RLS o funciones. No reinicies el proyecto ni elimines filas como método de reparación.

