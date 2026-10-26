# ADAZ — Sistema personal de progreso

ADAZ es una primera versión funcional tipo **PWA** (aplicación web instalable). Su interfaz se adapta a móvil y escritorio. El objetivo es integrar estudios, Aestel Lux, entrenamiento, salud, finanzas personales y revisión semanal sin convertir el día en una lista inabarcable.

## Qué incluye

- **Panel del día:** lista editable de tareas, avance diario, calendario de prioridades y temporizador de enfoque de 25 minutos.
- **Estudios:** sesiones IELTS, Saber 11/ICFES y estudio general; habilidad/área, tiempo efectivo, objetivo concreto, método, resultado porcentual y banda IELTS opcional.
- **Negocio:** registro de ventas, costos, reembolsos, pedidos, anticipos, saldos, contenido publicado y métricas capturadas manualmente.
- **Finanzas del negocio:** cifras históricas editables y advertencia para conciliar caja real antes de reinvertir. Los COP $200.000 de inversión inicial y aproximadamente COP $150.000 de utilidad histórica se usan como referencias aportadas anteriormente, no como saldo actual.
- **Entrenamiento y bienestar:** registro de natación, gimnasio, duración, metros si se conocen, esfuerzo, energía, sueño y estado de ánimo.
- **Revisión semanal:** áreas de vida, carga global, avances, obstáculos y un cambio pequeño para la semana siguiente.
- **Recordatorios:** descarga de un archivo `.ics` para importar en tu calendario y recordarte el cierre diario y traer el progreso a ChatGPT.
- **Fuentes:** materiales oficiales de IELTS e ICFES, más revisiones científicas y guías generales.
- **Datos:** exportación e importación en JSON, almacenamiento local en el navegador y caché de la estructura para uso sin conexión tras la primera carga online.

## Probar en un computador

Desde la carpeta `ADAZ`, ejecuta:

```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000/`. Para la vista inicial, también puedes abrir `index.html` directamente; sin HTTPS no estarán disponibles todas las funciones de instalación PWA/offline.

## Instalar en Android como app

La opción lista en este paquete es instalarla como **PWA**:

1. Publica el contenido de esta carpeta en una URL HTTPS.
2. Abre esa dirección en Chrome para Android.
3. En el menú del navegador, elige **Instalar aplicación** o **Añadir a pantalla de inicio** (el texto varía por versión).
4. Abre ADAZ desde el icono que aparece en la pantalla principal.
5. Importa el archivo `.ics` si deseas recordatorios del calendario y exporta un JSON de respaldo cada semana.

La guía paso a paso está en `INSTALAR-ANDROID.md`.

## Importante: APK

Este paquete **no contiene una APK compilada ni firmada**. La aplicación es una PWA instalable. Para generar una APK tipo Android Trusted Web Activity se necesita que la PWA esté publicada por HTTPS y completar el empaquetado Android con una herramienta como PWABuilder/Bubblewrap y una clave de firma. Este entorno no tiene Android SDK/Gradle preparados para compilar y validar una APK real, así que no sería correcto entregarte un ZIP o HTML llamándolo APK.

Referencia oficial de empaquetado: https://github.com/pwa-builder/PWABuilder/blob/main/docs/builder/android.md

## Privacidad y limitaciones

- No hay cuenta ni sincronización en la nube: los datos quedan en el navegador/dispositivo en que usas ADAZ.
- ADAZ no envía nada automáticamente a ChatGPT. Para revisar avances, exporta el JSON y adjúntalo en la conversación.
- Los recordatorios `.ics` requieren importar el archivo en tu calendario. La app no puede garantizar notificaciones del navegador cuando está cerrada.
- Los horarios son orientativos/editables. La información escolar compartida para el tramo hasta el 13 de noviembre de 2026 está marcada como provisional; no se asumen horarios deportivos exactos.
- No guardes contraseñas, datos bancarios completos, documentos de identidad ni información privada de otras personas.
- Los registros pueden perderse al borrar los datos del navegador. Mantén respaldos.
