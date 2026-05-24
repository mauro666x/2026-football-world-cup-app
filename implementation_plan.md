# 🏆 Mundial 2026 — App de Predicciones y Seguimiento

## Contexto

App web para predicciones y seguimiento en tiempo real del **Mundial FIFA 2026** (11 jun – 19 jul). 48 selecciones, 12 grupos de 4, 104 partidos. Hosts: USA, México, Canadá. Deploy en **Vercel**, datos en **Supabase**, todo en **free tier**.

---

## Decisión Arquitectónica Clave

> [!IMPORTANT]
> **¿NestJS + Next.js o solo Next.js?**
>
> Tras investigar, **recomiendo usar solo Next.js (App Router)** con API Routes para el backend. Razones:
> - NestJS en Vercel corre como una sola serverless function → cold starts lentos (~2-4s)
> - Next.js API Routes son nativas en Vercel → zero-config, mejor performance
> - Supabase ya maneja auth, realtime y DB → no necesitamos un framework backend pesado
> - Para ~20-30 endpoints de un MVP, Next.js API Routes es más que suficiente
> - Un solo repo, un solo deploy, menor complejidad operacional
>
> Si prefieres mantener NestJS, se puede deployar como monorepo pero añade complejidad. **¿Confirmas ir con Next.js only?**

---

## Stack Tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| **Frontend** | Next.js 15 (App Router) + TypeScript | SSR/SSG, nativo en Vercel |
| **Backend** | Next.js API Routes + Supabase Edge Functions | Serverless, zero-config |
| **Base de Datos** | Supabase PostgreSQL | Free: 500MB, API requests ilimitados |
| **Auth** | Supabase Auth | Free: 50K MAUs, email/pass + OAuth |
| **Realtime** | Supabase Realtime | Free: 200 conexiones concurrentes, 2M msgs/mes |
| **Styling** | Tailwind CSS 4 | Minimalista, moderno, rápido |
| **Animaciones** | Framer Motion | Micro-animaciones premium |
| **State** | Zustand | Ligero, sin boilerplate |
| **Data Fetching** | TanStack Query (React Query) | Cache, polling, refetch automático |
| **Notificaciones** | Web Push API + Service Worker (PWA) | 100% gratis, nativo del browser |
| **Banderas** | FlagCDN (flagcdn.com) | Gratis, SVG, sin API key, CDN Cloudflare |
| **Deploy** | Vercel Hobby | Free: 100GB BW, 1M invocaciones |
| **Cron Jobs** | Vercel Cron (free: 2 jobs) | Sincronización periódica de datos |
| **API Fútbol** | Football-Data.org (primaria) + API-Football/RapidAPI (respaldo) | Free tiers con datos del Mundial |

### Límites Free Tier a Monitorear

| Servicio | Límite Crítico | Mitigación |
|----------|---------------|------------|
| Supabase DB | 500 MB | Guardar solo datos esenciales, no cachear APIs en DB |
| Supabase Realtime | 200 conexiones simultáneas | Polling fallback si se satura |
| Football-Data.org | 10 req/min | Cache agresivo en Supabase, cron cada 1-2 min |
| API-Football | 100 req/día | Solo como respaldo cuando la primaria falla |
| Vercel Functions | 60s max, 4h CPU/mes | Funciones lean, evitar procesos pesados |
| Vercel Cron | 2 jobs en free | Un cron para scores, otro para datos generales |

---

## APIs Externas

### Football-Data.org (Primaria)
- **Free tier**: 10 req/min, Mundial incluido
- **Datos**: fixtures, resultados, standings, scorers
- **Limitación**: no tiene lineups ni stats avanzadas en free
- **Código competición**: `WC`

### API-Football via RapidAPI (Secundaria)
- **Free tier**: 100 req/día
- **Datos**: lineups, stats de partidos, head-to-head, datos de jugadores
- **Uso**: precarga de datos estáticos (planteles, históricos) antes del torneo

### FlagCDN
- URL: `https://flagcdn.com/{code}.svg` (ej: `https://flagcdn.com/co.svg`)
- Gratis, sin auth, sin rate limit

### Estrategia de Datos
```
┌─────────────────────────────────────────────────┐
│              CRON JOB (cada 60s)                │
│    Football-Data.org → Supabase (scores)        │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│           SUPABASE (PostgreSQL)                 │
│  - matches, scores, standings (source of truth) │
│  - Realtime broadcasts a clientes conectados    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│           NEXT.JS FRONTEND                      │
│  - Supabase Realtime subscription              │
│  - React Query con polling fallback (30s)       │
│  - Optimistic UI updates                        │
└─────────────────────────────────────────────────┘
```

---

## Modelo de Datos (Supabase PostgreSQL)

```sql
-- Usuarios (manejado por Supabase Auth + perfil extendido)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  points INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Selecciones
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,          -- ISO alpha-2 (ej: 'co', 'ar')
  fifa_code TEXT,              -- Código FIFA (ej: 'COL', 'ARG')
  group_letter CHAR(1),
  flag_url TEXT,               -- flagcdn.com URL
  coach TEXT,
  fifa_ranking INT,
  confederation TEXT           -- UEFA, CONMEBOL, etc.
);

-- Jugadores
CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  team_id INT REFERENCES teams(id),
  name TEXT NOT NULL,
  position TEXT,               -- GK, DF, MF, FW
  number INT,
  birth_date DATE,
  club TEXT,
  photo_url TEXT,
  goals INT DEFAULT 0,
  assists INT DEFAULT 0,
  yellow_cards INT DEFAULT 0,
  red_cards INT DEFAULT 0
);

-- Partidos
CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  external_id INT,             -- ID de la API externa
  stage TEXT NOT NULL,          -- 'GROUP', 'ROUND_32', 'ROUND_16', 'QUARTER', 'SEMI', 'THIRD', 'FINAL'
  group_letter CHAR(1),
  home_team_id INT REFERENCES teams(id),
  away_team_id INT REFERENCES teams(id),
  home_score INT,
  away_score INT,
  home_penalties INT,
  away_penalties INT,
  status TEXT DEFAULT 'SCHEDULED', -- SCHEDULED, LIVE, HALFTIME, FINISHED, POSTPONED
  minute INT,                  -- Minuto actual si está en vivo
  match_date TIMESTAMPTZ NOT NULL,
  venue TEXT,
  city TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Historial de enfrentamientos (precargado)
CREATE TABLE head_to_head (
  id SERIAL PRIMARY KEY,
  team1_id INT REFERENCES teams(id),
  team2_id INT REFERENCES teams(id),
  team1_wins INT DEFAULT 0,
  team2_wins INT DEFAULT 0,
  draws INT DEFAULT 0,
  last_match_date DATE,
  matches_data JSONB          -- Array con detalle de últimos partidos
);

-- Predicciones de usuarios
CREATE TABLE predictions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  match_id INT REFERENCES matches(id),
  predicted_home_score INT NOT NULL,
  predicted_away_score INT NOT NULL,
  points_earned INT DEFAULT 0,
  locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, match_id)
);

-- Predicciones de fase (quién pasa, quién gana)
CREATE TABLE stage_predictions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  stage TEXT NOT NULL,         -- 'GROUP_WINNER', 'GROUP_RUNNER', 'ROUND_32', 'CHAMPION', etc.
  group_letter CHAR(1),
  predicted_team_id INT REFERENCES teams(id),
  is_correct BOOLEAN,
  points_earned INT DEFAULT 0,
  locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, stage, group_letter, predicted_team_id)
);

-- Suscripciones push (para notificaciones)
CREATE TABLE push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  subscription JSONB NOT NULL, -- Web Push subscription object
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Configuración de alarmas por usuario
CREATE TABLE match_alerts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  match_id INT REFERENCES matches(id),
  alert_1h_before BOOLEAN DEFAULT true,
  alert_kickoff BOOLEAN DEFAULT true,
  alert_final BOOLEAN DEFAULT true,
  UNIQUE(user_id, match_id)
);
```

### Row Level Security (RLS)
```sql
-- Usuarios solo ven/editan sus propias predicciones
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own predictions" ON predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own predictions" ON predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own predictions" ON predictions FOR UPDATE USING (auth.uid() = user_id AND locked = false);

-- Todos leen equipos y partidos
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
```

---

## Features

### 🟢 MVP (Must-Have)

#### 1. Autenticación
- Registro/login con email + contraseña (Supabase Auth)
- Perfil de usuario con avatar y display name
- Sesión persistente con JWT

#### 2. Predicciones — Fase de Grupos
- Vista de los 12 grupos con todas las selecciones
- Predecir marcador exacto de cada partido de fase de grupos
- **Lock automático**: predicción se bloquea al inicio del partido
- Puntuación: resultado exacto (5pts), resultado correcto (3pts), 1 equipo correcto (1pt)
- Dashboard con resumen de predicciones y puntos acumulados

#### 3. Predicciones — Eliminación Directa
- Se desbloquean cuando se confirman los clasificados de cada fase
- Predecir ganador de cada llave + marcador
- Predicción del campeón

#### 4. Seguimiento de Partidos en Vivo
- Estado del partido (minuto, score, eventos)
- Actualización via Supabase Realtime (con polling fallback cada 30s)
- Indicador visual de partido en vivo (pulso animado)

#### 5. Información de Equipos
- Ficha de cada selección: bandera, grupo, ranking FIFA, DT
- Plantilla completa con datos de cada jugador
- Stats acumuladas del equipo en el torneo

#### 6. Head-to-Head (Historial)
- Para cada partido: historial de enfrentamientos entre ambos equipos
- Gráfico visual de victorias/empates/derrotas
- Últimos partidos entre ellos con fecha y marcador

#### 7. Tabla de Posiciones
- Tabla de cada grupo actualizada en tiempo real
- Criterios de desempate visualizados (pts, GD, GF, H2H)
- Bracket de eliminación directa interactivo

#### 8. Alarmas / Notificaciones
- Web Push Notifications (PWA con Service Worker)
- Configurar por partido: 1h antes, inicio, final con marcador
- VAPID keys propias → 100% gratis
- Fallback: notificación in-app si no acepta push

#### 9. UI/UX Minimalista Moderno
- Dark mode por defecto con toggle light
- Banderas SVG via FlagCDN
- Micro-animaciones con Framer Motion
- Responsive (mobile-first)
- Tipografía: Inter o Geist (moderna, limpia)

### 🟡 Nice-to-Have (Post-MVP)

| Feature | Descripción |
|---------|-------------|
| **Leaderboard global** | Ranking de todos los usuarios por puntos |
| **Ligas privadas** | Crear grupos con amigos y competir entre ellos |
| **OAuth social** | Login con Google/GitHub (Supabase lo soporta) |
| **Compartir predicciones** | Compartir en redes con imagen generada (OG image) |
| **Stats avanzadas** | xG, posesión, heatmaps (requiere API paga) |
| **Modo offline** | PWA con cache de datos básicos |
| **Multi-idioma** | i18n (español, inglés, portugués) |
| **Logros/badges** | Gamificación por predicciones acertadas consecutivas |
| **Historial de predicciones** | Timeline visual de aciertos y fallos |
| **Predicción bracket completo** | Predecir todo el bracket antes del torneo |

---

## Estructura del Proyecto

```
world-cup-predictions/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── sw.js                  # Service Worker para push
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (fonts, theme)
│   │   ├── page.tsx           # Landing / Dashboard
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── groups/
│   │   │   ├── page.tsx       # Vista de todos los grupos
│   │   │   └── [letter]/page.tsx
│   │   ├── matches/
│   │   │   ├── page.tsx       # Calendario de partidos
│   │   │   └── [id]/page.tsx  # Detalle de partido + H2H
│   │   ├── teams/
│   │   │   ├── page.tsx       # Listado de selecciones
│   │   │   └── [id]/page.tsx  # Ficha de equipo + plantilla
│   │   ├── predictions/
│   │   │   ├── page.tsx       # Mis predicciones
│   │   │   └── bracket/page.tsx
│   │   ├── live/page.tsx      # Partidos en vivo
│   │   ├── leaderboard/page.tsx
│   │   └── api/
│   │       ├── auth/[...supabase]/route.ts
│   │       ├── matches/route.ts
│   │       ├── predictions/route.ts
│   │       ├── sync/route.ts        # Cron: sincronizar scores
│   │       ├── notifications/route.ts
│   │       └── cron/
│   │           ├── sync-scores/route.ts
│   │           └── send-alerts/route.ts
│   ├── components/
│   │   ├── ui/                # Componentes base (Button, Card, Modal, Input)
│   │   ├── match/             # MatchCard, LiveIndicator, ScoreInput
│   │   ├── team/              # TeamCard, PlayerCard, Flag
│   │   ├── prediction/        # PredictionForm, PredictionCard
│   │   ├── bracket/           # BracketView, BracketMatch
│   │   └── layout/            # Navbar, Sidebar, Footer
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts      # Browser client
│   │   │   ├── server.ts      # Server client
│   │   │   └── middleware.ts  # Auth middleware
│   │   ├── api/
│   │   │   ├── football-data.ts  # Football-Data.org client
│   │   │   └── api-football.ts   # API-Football client (backup)
│   │   ├── scoring.ts         # Lógica de puntuación
│   │   ├── notifications.ts   # Web Push helpers
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useRealtimeMatch.ts
│   │   ├── usePredictions.ts
│   │   └── useNotifications.ts
│   ├── store/
│   │   └── useAppStore.ts     # Zustand store
│   └── types/
│       └── index.ts           # TypeScript types
├── supabase/
│   ├── migrations/            # SQL migrations
│   └── seed.sql               # Datos iniciales (equipos, grupos, calendario)
├── next.config.ts
├── tailwind.config.ts
├── vercel.json
├── package.json
└── tsconfig.json
```

---

## Casos Edge

### Predicciones
| Caso | Solución |
|------|----------|
| Usuario intenta predecir después del kickoff | Lock automático basado en `match_date`. Verificación server-side |
| Usuario cambia predicción múltiples veces | Permitido hasta lock. Guardar solo última versión |
| Partido postponido/cancelado | Devolver puntos, marcar predicción como `void` |
| Empate en eliminatoria (penales) | Guardar score de 90 min + score de penales por separado |
| Desempate en grupo por fair play/sorteo | Manejar manualmente, flag `manual_override` en standings |
| Predicción de eliminatoria antes de conocer equipos | Bloquear hasta que API confirme clasificados |

### Datos y APIs
| Caso | Solución |
|------|----------|
| API primaria caída | Fallback a API-Football. Si ambas caen, mostrar último dato cacheado |
| Rate limit alcanzado | Queue de requests con backoff exponencial. Cache agresivo |
| Datos inconsistentes entre APIs | Football-Data.org es source of truth. Validar antes de update |
| Partido sin datos de alineación | Mostrar "Alineación no disponible" con skeleton loader |
| API no cubre stats avanzadas en free | Mostrar solo stats disponibles, no prometer lo que no hay |

### Notificaciones
| Caso | Solución |
|------|----------|
| Usuario no acepta permisos push | Notificación in-app con banner sticky |
| Browser no soporta Push API | Fallback a polling + notificación visual en la app |
| Horario del partido cambia | Re-programar alarmas automáticamente vía cron |
| Múltiples partidos simultáneos | Agrupar notificaciones: "3 partidos comienzan ahora" |

### Auth y Datos de Usuario
| Caso | Solución |
|------|----------|
| Usuario pierde sesión | JWT refresh automático (Supabase lo maneja) |
| Username duplicado | Constraint UNIQUE + validación en registro |
| Usuario borra cuenta | Cascade delete de predicciones y suscripciones |
| Supabase proyecto se pausa (inactividad) | Configurar cron cada 6 días para mantenerlo activo |

### Performance
| Caso | Solución |
|------|----------|
| 200+ usuarios conectados al realtime | Polling fallback automático cuando se detecta saturación |
| Pico de tráfico en partidos importantes | ISR (Incremental Static Regeneration) para páginas estáticas |
| Demasiados datos en 500MB | Purgar datos de H2H antiguos, comprimir JSONB |

---

## Sistema de Puntuación

```
Predicción de Partido:
├── Resultado exacto (2-1 y fue 2-1)     → 5 puntos
├── Resultado correcto (victoria/empate)  → 3 puntos
├── 1 equipo con score correcto           → 1 punto
└── Fallo total                           → 0 puntos

Predicción de Fase:
├── Campeón correcto                      → 20 puntos
├── Finalista correcto                    → 10 puntos
├── Semifinalista correcto                → 5 puntos
├── Equipo pasa de grupo (correcto)       → 2 puntos
└── Ganador de grupo (correcto)           → 3 puntos
```

---

## Fases de Desarrollo

### Fase 1 — Setup y Datos (3-4 días)
- [ ] Inicializar Next.js 15 + TypeScript + Tailwind
- [ ] Configurar Supabase (proyecto, tablas, RLS, auth)
- [ ] Seed de datos: 48 equipos, 12 grupos, calendario completo
- [ ] Integrar Football-Data.org API client
- [ ] Precarga de H2H y planteles (API-Football)

### Fase 2 — Auth y Predicciones (3-4 días)
- [ ] Login/registro con Supabase Auth
- [ ] Perfil de usuario
- [ ] Sistema de predicciones (CRUD + lock)
- [ ] Lógica de puntuación
- [ ] Dashboard de predicciones

### Fase 3 — Visualización y Live (3-4 días)
- [ ] Vista de grupos y tablas de posiciones
- [ ] Fichas de equipos y jugadores
- [ ] Head-to-head por partido
- [ ] Seguimiento en vivo (Supabase Realtime)
- [ ] Cron jobs para sincronización

### Fase 4 — Notificaciones y Polish (2-3 días)
- [ ] PWA manifest + Service Worker
- [ ] Web Push notifications
- [ ] Configuración de alarmas por partido
- [ ] Micro-animaciones y transitions
- [ ] Dark/light mode
- [ ] Testing E2E básico

### Fase 5 — Deploy y QA (1-2 días)
- [ ] Deploy en Vercel
- [ ] Variables de entorno en Vercel Dashboard
- [ ] Configurar vercel.json con cron
- [ ] Testing de performance (Lighthouse)
- [ ] Monitoreo de rate limits

**Total estimado: 12-17 días** (para una persona trabajando dedicada)

---

## Configuración Vercel

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/sync-scores",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/send-alerts",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

> [!WARNING]
> Vercel free tier solo permite **2 cron jobs**. Los usamos para: 1) sincronizar scores cada minuto, 2) enviar alertas cada 5 minutos.

---

## Open Questions

> [!IMPORTANT]
> 1. **¿Next.js only o insistes en NestJS?** — Recomiendo fuertemente Next.js only (ver justificación arriba). NestJS añade complejidad sin beneficio claro para este scope.
> 2. **¿Cuántos usuarios esperas?** — Supabase free soporta 200 conexiones realtime simultáneas. Si esperas más, necesitaríamos polling.
> 3. **¿Quieres OAuth (Google/GitHub) además de email/pass?** — Supabase lo soporta gratis, pero es trabajo adicional.
> 4. **¿Idioma de la app?** — ¿Solo español, solo inglés, o multi-idioma?
> 5. **¿Tailwind CSS está ok?** — Lo recomiendo para el look minimalista moderno. Si prefieres vanilla CSS, se puede pero toma más tiempo.
> 6. **¿Quieres escudos de federaciones o solo banderas?** — Los escudos de federaciones (AFA, FCF, etc.) no son fáciles de obtener gratis con licencia. Las banderas sí están cubiertas con FlagCDN.

---

## Verificación

### Automated
- `npm run build` — verificar que compila sin errores
- `npm run lint` — ESLint + TypeScript strict
- Lighthouse score ≥ 90 en Performance, Accessibility, SEO
- Playwright E2E: flujo de registro → predicción → ver live

### Manual
- Probar flujo completo en mobile (Chrome DevTools)
- Verificar notificaciones push en dispositivo real
- Verificar lock de predicciones cerca del kickoff
- Simular caída de API y verificar fallback
- Verificar que el proyecto Supabase no se pausa
