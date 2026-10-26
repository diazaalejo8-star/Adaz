# Cómo instalar ADAZ en tu Android

## Lo que ya tienes

El archivo `ADAZ-PWA.zip` contiene una app web instalable. Al instalarla desde Chrome, aparecerá un icono ADAZ y se abrirá en una ventana independiente. **No es todavía un archivo APK.**

## Paso 1 — publicar la app con HTTPS

Para que Android la pueda instalar como PWA, la carpeta `ADAZ` tiene que estar en una dirección web segura (HTTPS). Una ruta gratuita es GitHub Pages:

1. Crea una cuenta en GitHub si no tienes una y crea un repositorio nuevo, por ejemplo `adaz`.
2. Descomprime `ADAZ-PWA.zip` en un computador.
3. En el repositorio, utiliza **Add file → Upload files** y sube el contenido de la carpeta `ADAZ` (los archivos `index.html`, `manifest.webmanifest`, `sw.js`, iconos, etc.; no subas solo el ZIP).
4. Entra en **Settings → Pages**.
5. En la sección de publicación, selecciona **Deploy from a branch**, rama `main` y carpeta `/ (root)`, y guarda.
6. GitHub mostrará una URL HTTPS del sitio. Ábrela y verifica que ADAZ cargue antes de seguir.

Los nombres exactos de las opciones de GitHub pueden cambiar.

## Paso 2 — añadir ADAZ al teléfono

1. Abre la URL HTTPS en **Google Chrome** en el Android.
2. Abre el menú de tres puntos.
3. Elige **Instalar aplicación** o **Añadir a pantalla de inicio**.
4. Confirma y abre ADAZ desde el icono nuevo.
5. Registra una sesión de prueba, cierra y vuelve a abrir para comprobar que tus datos siguen allí.

Si Chrome no ofrece la instalación, comprueba que la dirección use HTTPS y que todos los archivos estén en la raíz correcta del sitio.

## Paso 3 — activar los recordatorios y el respaldo

- En ADAZ, toca **Descargar recordatorios (.ics)**.
- Abre/importa el archivo en tu aplicación de calendario y comprueba que los horarios queden en la zona `America/Bogota`.
- Cada domingo, entra en **Revisión semanal** y guarda tu revisión.
- Descarga **Exportar mis datos** y guarda el JSON en un lugar seguro. Para que podamos revisarlo juntos, adjunta manualmente ese JSON en ChatGPT.

## ¿Y la APK?

Para una APK real, una vez que ADAZ esté disponible por HTTPS puedes usar la herramienta oficial de empaquetado PWABuilder/Bubblewrap. Después debes probar la APK en el teléfono y administrar su firma. No incluyo una APK ficticia: en este entorno no hay un Android SDK/Gradle configurado para compilarla y verificarla.

Documentación: https://github.com/pwa-builder/PWABuilder/blob/main/docs/builder/android.md
