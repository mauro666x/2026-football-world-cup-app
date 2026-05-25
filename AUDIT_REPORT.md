# Reporte de Auditoría: World Cup 2026 Predictions App

Este documento presenta el análisis técnico, de seguridad y de diseño (UI/UX) realizado sobre el proyecto **World Cup 2026 Predictions App**. Se detallan los problemas identificados, el estado actual de las soluciones aplicadas en el repositorio y la base de datos de producción, y las recomendaciones prioritarias para el mantenimiento y despliegue del sistema.

---

## 1. Resumen de Hallazgos y Acciones Realizadas

A continuación se presenta un resumen de los problemas más críticos y el estado actual de su resolución:

| Área | Problema Detectado | Gravedad | Estado | Acción Realizada |
| :--- | :--- | :---: | :---: | :--- |
| **Funcionalidad** | La tabla `matches` estaba vacía (0 registros), rompiendo la funcionalidad principal de predicciones. | **Crítico** | **Resuelto** | Se ejecutó un script de migración que parsed y cargó los 72 partidos de fase de grupos del calendario oficial. |
| **Datos / Lógica** | Las selecciones en la base de datos pertenecían a un sorteo provisional antiguo (ej. Canadá y Uruguay en el Grupo A). | **Alto** | **Resuelto** | Se re-sembró la tabla `teams` con el sorteo oficial del Mundial 2026 (ej. México, Sudáfrica, Corea del Sur y Rep. Checa en el Grupo A). |
| **UI/UX** | El Header/Navbar no reaccionaba al estado de autenticación de Supabase (siempre mostraba "Entrar" y no tenía opción de Logout). | **Alto** | **Resuelto** | Se modificó el Navbar para escuchar dinámicamente el estado de sesión, mostrar los puntos del usuario y su nombre de perfil. |
| **Funcionalidad** | No existía una pantalla de Perfil de usuario ni la opción de Cerrar Sesión. | **Alto** | **Resuelto** | Se implementó la ruta `/profile` con un panel de estadísticas, formulario para editar el `display_name` y botón de Logout. |
| **Calidad de Código** | Carpeta de typo/basura en las rutas de la API (`src/app/api/{auth`). | **Bajo** | **Resuelto** | Se eliminó la carpeta duplicada y con sintaxis corrupta del repositorio. |
| **UI/UX** | En la tabla de grupos, los equipos se mostraban como "Clasificados" o "Eliminados" antes de que el mundial comenzara (0 partidos jugados). | **Medio** | **Resuelto** | Se ajustó la lógica para que los colores de las barras de posición sean neutrales si el conteo de partidos jugados es 0. |

---

## 2. Detalle de Errores y Soluciones Aplicadas

### A. Base de Datos Desactualizada y Vacía (Partidos y Equipos)
* **Diagnóstico:** La tabla `matches` contenía 0 filas, lo que provocaba que la pestaña de predicciones cargara una vista vacía indicando *"No hay partidos próximos"*. Además, los equipos en `teams` estaban asociados a grupos provisionales de desarrollo (como Canadá y Uruguay en el Grupo A, del seed inicial `002_seed_teams.sql`).
* **Solución Aplicada:** Se desarrolló un script (`apply-seeds.js`) en Node.js que:
  1. Limpió en cascada las tablas `matches` y `teams` de producción (evitando romper referencias).
  2. Parseó e insertó los 48 equipos con sus grupos oficiales provenientes de `007_correct_groups_official_draw.sql`.
  3. Parseó e insertó los 72 partidos de fase de grupos con sus correspondientes IDs relacionales desde `008_seed_group_matches.sql`.
* **Resultado:** La base de datos de producción ahora cuenta con las **48 selecciones oficiales** y **72 partidos programados** correctamente configurados.

### B. Glitch de Estado en el Header / Navbar
* **Diagnóstico:** El componente `Navbar.tsx` era completamente estático en relación al estado de sesión de Supabase. El botón "Entrar" persistía incluso después de un inicio de sesión exitoso, bloqueando al usuario el acceso visual a su perfil y sus puntos. Tampoco existía una acción de *Logout*.
* **Solución Aplicada:** Se refactorizó `src/components/layout/Navbar.tsx` usando el cliente del navegador (`@/lib/supabase/client`):
  - Añadido un `useEffect` con `supabase.auth.onAuthStateChange` para actualizar dinámicamente el estado local de `user`.
  - Si el usuario está autenticado, el botón "Entrar" es reemplazado por un **Badge con los puntos acumulados** del usuario (sincronizados desde su perfil en Supabase) y un **Avatar** con las iniciales de su nombre que redirige a `/profile`.
  - Añadido un botón de **Cerrar Sesión** en Desktop y Mobile que ejecuta `supabase.auth.signOut()` y redirige al Home.

### C. Ausencia de la Funcionalidad de Perfil (`/profile`)
* **Diagnóstico:** Los usuarios no contaban con un panel para ver sus estadísticas, su nombre de usuario, correo electrónico, ni actualizar su nombre de muestra en la tabla de clasificaciones (*Leaderboard*).
* **Solución Aplicada:** Se crearon dos nuevos componentes:
  - **`src/app/profile/page.tsx` (Server Component):** Valida la sesión del servidor de forma segura (utilizando `getUser()`), consulta el perfil del usuario (`profiles`) y cuenta sus predicciones totales y acertadas directamente de la base de datos.
  - **`src/app/profile/ProfileClient.tsx` (Client Component):** Renderiza un panel con diseño oscuro premium, mostrando estadísticas clave (miembro desde, predicciones hechas, aciertos, puntos). Incluye un formulario interactivo para que el usuario actualice su `display_name` y un botón de Logout destacado.

### D. Disposición de Equipos y Colores de Posición Ilógicos
* **Diagnóstico:** Cuando un grupo no ha jugado ningún partido (PJ = 0), los colores del indicador de posición (`pos-q` verde, `pos-p` naranja, `pos-o` gris) se aplicaban por defecto según el orden alfabético de la tabla. Esto hacía parecer que el primer y segundo equipo ya estaban clasificados y el cuarto eliminado sin haber jugado.
* **Solución Aplicada:** En `src/app/groups/page.tsx`, se modificó la asignación del color indicador para que sea neutral (`bg-white/10` con título "Por jugar") si el número de partidos jugados de los equipos es cero (`s.played === 0`).
* **Resultado:** La interfaz ahora representa de manera lógica que el grupo está en un estado neutral "sin comenzar" antes de la primera jornada de partidos.

### E. Carpeta Huérfana / Basura en API
* **Diagnóstico:** La presencia de la ruta `src/app/api/{auth/...` con llaves mal estructuradas e incompleta causaba confusión en la estructura y violaba las convenciones de Next.js App Router.
* **Solución Aplicada:** Se eliminó de raíz el directorio `src/app/api/{auth` mediante comando seguro del sistema.

---

## 3. Auditoría de Seguridad

Hemos revisado la arquitectura del Backend y la integración con Supabase. Estos son los puntos clave y recomendaciones:

### 1. Manejo Seguro de Sesión en el Servidor (Respetado)
* **Verificación:** Las llamadas críticas en Server Components y Route Handlers (`src/app/predictions/page.tsx`, `src/app/api/predictions/route.ts`, `src/app/api/notifications/route.ts`) implementan correctamente `supabase.auth.getUser()` en lugar de `getSession()`. Esto evita la suplantación de identidad mediante la verificación de la firma del JWT directamente en los servidores de Supabase.

### 2. Políticas de Seguridad de Base de Datos (RLS)
* **Verificación:** Se validó que las políticas RLS (*Row Level Security*) en Supabase están habilitadas. Las tablas `predictions` y `profiles` restringen la actualización y eliminación únicamente al propietario del token (`auth.uid() = user_id` o `auth.uid() = id`). 
* **Recomendación:** Asegurarse de que no existan políticas permisivas del tipo `ALL` o `USING (true)` en inserciones/actualizaciones en la base de datos de producción.

### 3. Middleware / Proxy (Convención Next.js 16)
* **Verificación:** El proyecto implementa la nueva convención de Next.js 16 a través de `src/proxy.ts` (en lugar de `middleware.ts`), lo que refresca de forma automática la sesión del usuario en cada petición HTTP y redirige las rutas protegidas `/predictions/*` al `/login` en caso de no haber sesión. Esto se validó exitosamente durante el proceso de compilación (`npm run build`).

---

## 4. Próximos Pasos Recomendados

Para garantizar la estabilidad a largo plazo y una excelente experiencia de usuario, sugerimos las siguientes mejoras:

1. **Sincronización Automática de Resultados (Vercel Cron):**
   La API en `/api/cron/sync-scores` está lista, pero requiere de un Cron Job configurado en `vercel.json` o en la consola de Vercel para ejecutarse periódicamente durante el torneo (con el header `Authorization: Bearer ${CRON_SECRET}`).
2. **Alertas de Partidos (Push Notifications):**
   El backend para alertas push está listo en `/api/notifications` y `/api/cron/send-alerts`. Se recomienda implementar el Service Worker en el cliente para completar la integración de notificaciones push de escritorio/móvil.
3. **Manejo del Estado de Puntos en Tiempo Real:**
   El componente `Navbar` ahora lee los puntos actuales del usuario. Se recomienda que al guardar predicciones o cuando cambie un marcador en vivo, se actualice este valor de manera reactiva (o mediante revalidación de datos de TanStack Query).
