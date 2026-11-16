# ADAZ · arquitectura y estado técnico

Última revisión: 16 de noviembre de 2026

## 1. Producto

ADAZ se publica como PWA en GitHub Pages y se empaqueta en Android mediante dos sabores independientes: ADAZ Personal y ADAZ Family. La interfaz móvil usa navegación compacta y tema oscuro. Los módulos se separan por responsabilidad para limitar el acoplamiento.

## 2. Componentes de ADAZ Personal

`index.html` es el punto de entrada. Carga los módulos de tareas, integraciones, Academy, experiencia, negocio/salud, metas/entrenamiento, calendario, evaluaciones y currículo.

- `adaz-extra.js`: utilidades y mejoras de la vista principal.
- `adaz-integrations.js`: paneles de servicios externos; una opción visible no se debe presentar como conectada hasta completar autorización y prueba.
- `adaz-academy.js` y `adaz-academy-curriculum.js`: lecciones, objetivos y prácticas de ICFES, IELTS Academic, Medicina y Negocios/Oro Laminado.
- `adaz-experience.js`: acceso simplificado a la siguiente acción.
- `adaz-business-health.js`: negocio y seguimiento de entrenamiento/salud.
- `adaz-personal-finance-training.js`: metas personales, finanzas y componentes de entrenamiento.
- `adaz-year-plan.js`: calendario y plan diario/semanal.
- `adaz-calendar-tests.js`: evaluaciones asociadas a hitos del calendario; debe cargarse después de `adaz-year-plan.js`.
- `adaz-family-link.js`: acceso al espacio Family sin incrustar su panel de autenticación en Personal.

`adaz-guided-sessions.js` es código heredado y no forma parte del conjunto cargado por `index.html`. No debe activarse sin revisar selectores, navegación, persistencia y compatibilidad visual.

## 3. Datos y caché

El progreso de ADAZ Personal se guarda en almacenamiento local del navegador/WebView. No se sincroniza automáticamente entre dispositivos. La exportación/importación JSON permite respaldos. Una actualización debe conservar las claves y estructuras existentes; no se debe vaciar `localStorage` para reparar un fallo.

`sw.js` mantiene una caché versionada de recursos. Todo módulo necesario para una función debe estar conectado desde su página y, cuando corresponda, incluido en el shell offline. La validación de GitHub Actions comprueba sintaxis, navegación, orden de carga del reproductor y precarga del recurso.

## 4. Android

El proyecto define dos flavors:

- `personal`: identificador `com.adaz.personal`, inicio en `index.html`.
- `family`: identificador `com.adaz.family`, inicio en `family.html?role=parent`.

El WebView permite navegación interna solo en el host de ADAZ y deriva enlaces externos al navegador. El puente Android ofrece autenticación y funciones de uso únicamente cuando el sistema operativo y los permisos lo permiten.

GitHub Actions puede construir APKs debug independientes. Un artefacto generado correctamente no equivale a una prueba física en Android ni a una APK firmada para lanzamiento.

## 5. ADAZ Family / Trust

Family usa Supabase Auth y una relación entre la cuenta Personal y la cuenta del adulto invitado. La invitación se valida por correo, código de un solo uso y vencimiento. Las políticas RLS limitan la lectura de estadísticas a vínculos activos y al permiso de uso habilitado.

El permiso soportado en esta edición es opcional: aplicación en primer plano y minutos agregados por aplicación. El seguimiento Android corre como servicio visible con notificación persistente. No recopila capturas de pantalla, mensajes, pulsaciones, contenido dentro de otras apps ni ubicación GPS. El permiso empieza desactivado y el estudiante puede detenerlo o revocarlo.

Para que Family muestre datos se necesitan: URL y clave pública válidas en ambas apps, dos cuentas distintas, una invitación aceptada, permiso de uso activado por el estudiante, acceso de uso Android concedido y servicio visible activo. Sin esos pasos, el panel puede permanecer vacío o mostrar que espera la primera captura.

El flujo de consentimiento debe consultar todos los vínculos activos del estudiante; no debe decidir el permiso usando solamente el primer vínculo parental. Las migraciones del proyecto y el esquema remoto deben mantenerse sincronizados. Antes de modificar RLS, RPC o tablas, comprobar el historial de migraciones y verificar con consultas de lectura. No reiniciar el proyecto ni borrar filas para reparar una conexión.

## 6. Academy y autoría

Las preguntas creadas por ADAZ se etiquetan como originales y no oficiales. Los recursos de ICFES e IELTS se enlazan desde sus sitios de origen; no se copian bancos comerciales ni exámenes protegidos completos. Los resultados internos no equivalen a puntajes certificados ni garantizan un resultado futuro.

Las rutas activas son ICFES, IELTS Academic, fundamentos de Medicina y Negocios/Oro Laminado. Ingeniería Financiera no debe reaparecer como ruta activa.

## 7. Negocio, deporte y salud

El módulo de negocio registra operaciones, pero no las verifica automáticamente con bancos, proveedores o redes sociales. Se deben distinguir costo, ventas, margen estimado, utilidad y efectivo disponible. Los borradores de contenido no se publican por sí solos.

ADAZ Health registra gimnasio y natación. En personas adolescentes, el contenido debe priorizar técnica, supervisión, recuperación, alimentación suficiente y bienestar; no debe promover dietas restrictivas, pérdida rápida de peso ni entrenamiento con dolor.

## 8. Integraciones no habilitadas por defecto

- **JACOB / `adaz-planner`:** la función está desplegada, pero queda pausada por defecto con la compuerta `ADAZ_ENABLE_JACOB`; el gateway exige JWT. No se habilita desde la interfaz. Para reactivarla se necesita decisión explícita y revisión de consentimiento, coste y backend.
- **Instagram y TikTok:** una cola de ideas o borradores no equivale a OAuth, lectura de métricas ni publicación.
- **Spotify:** abrir enlaces no equivale a control remoto mediante API. No mostrar estado conectado sin verificar permisos y sesión.

## 9. Comprobaciones para considerar una versión lista

1. La validación JavaScript de GitHub Actions finaliza correctamente.
2. GitHub Pages despliega el commit concreto.
3. El artefacto APK corresponde al commit esperado y abre la URL correcta.
4. En un teléfono real se prueban navegación, persistencia, modo offline y restauración de datos.
5. Family se prueba con cuentas separadas, invitación, consentimiento, sincronización, revocación y estado obsoleto.
6. Las pruebas usan cuentas y datos de prueba; no se exponen claves privadas ni datos personales.

## 10. Hallazgos de auditoría (16 nov 2026)

- Se corrigió el ciclo de vida de ADAZ Family: al cerrar sesión o perderla se detienen los temporizadores de consulta y el monitor local del estudiante; el permiso se muestra solo si existe un vínculo activo.
- Se corrigió la pantalla de resultados de evaluaciones para mostrar las recomendaciones por área que ya se calculaban, pero no se renderizaban.
- El flujo de compilación Android ahora comprueba la sintaxis de todos los módulos `adaz-*.js`, no solo de una selección.
- La base Supabase de producción tiene RLS activado en las tablas Family y uso. No se encontraron filas de Family/uso en la inspección, y los permisos de ejecución de las RPC quedaron limitados a `authenticated`, `postgres` y `service_role`.
- Supabase Advisor mantiene dos avisos sobre funciones `SECURITY DEFINER` accesibles a usuarios autenticados. Son las RPC de invitación y aceptación que la app necesita; deben conservar validación de usuario/correo y revisión periódica. No se amplió su acceso a `anon`.
- La lista de migraciones de Supabase no coincide con los nombres/fechas de los SQL versionados en `supabase/migrations`. No se aplicaron migraciones ni cambios de esquema durante esta auditoría; hace falta reconciliar el historial antes de volver a desplegar la base desde cero.
- La función `adaz-planner` quedó desplegada en versión 2 con JWT obligatorio y una compuerta de servidor: devuelve 404 salvo activación explícita de `ADAZ_ENABLE_JACOB=true`.
- Las APK se compilaron en CI, pero siguen pendientes las pruebas manuales en un Android real, incluidas las pruebas con dos cuentas y revocación de consentimiento.
