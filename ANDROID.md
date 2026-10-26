# ADAZ en Android: instalación PWA y camino a APK

## Opción inmediata: instalar como aplicación web (recomendada para uso personal)

1. Sube el contenido de esta carpeta a un hosting estático con HTTPS.
2. Abre la URL en Chrome desde el teléfono Android.
3. Usa **Instalar aplicación** / **Añadir a pantalla de inicio**.
4. El icono ADAZ aparecerá como una app separada y abrirá en modo independiente.

La app se puede usar sin publicar en una tienda y no requiere mantener un APK instalado manualmente.

## Si necesitas específicamente un archivo APK

El contenido actual es una PWA y está listo para servir por HTTPS, pero no incluye un APK firmado. Crear un paquete Android Trusted Web Activity a partir de una PWA requiere URL HTTPS pública, empaquetado Android (por ejemplo, Bubblewrap/PWABuilder) y herramientas de compilación Android. Este entorno de construcción no trae Android SDK/Gradle configurados, por lo que no se puede validar honestamente una APK compilada aquí.

Ruta para generar una APK cuando la PWA tenga URL pública:
1. Verifica que `manifest.webmanifest`, `icon.svg`, `sw.js` y el sitio funcionen por HTTPS.
2. Usa la guía oficial de PWABuilder/Bubblewrap para crear el paquete Android.
3. Configura un identificador de paquete propio y una clave de firma bajo tu control.
4. Instala el APK en tu dispositivo y comprueba modo offline, almacenamiento y exportación/importación antes de confiar en él.

Referencia: https://github.com/pwa-builder/PWABuilder/blob/main/docs/builder/android.md
