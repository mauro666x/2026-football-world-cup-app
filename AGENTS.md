<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Project Agent Rules — World Cup 2026 Predictions App

## 1. Architecture & Code Quality

### General Principles
- **TypeScript strict mode** — never use `any`. Use `unknown` + type guards when type is uncertain.
- **Single Responsibility** — each file/function does ONE thing. If a function exceeds ~40 lines, refactor.
- **DRY** — extract shared logic into `src/lib/` utilities or custom hooks in `src/hooks/`.
- **Fail fast** — validate inputs at the boundary (API routes, form handlers). Return early on errors.
- **Immutability** — prefer `const`, `readonly`, and spread operators. Avoid mutations.

### Next.js App Router Conventions
- **Server Components by default** — only add `'use client'` when the component needs interactivity, hooks, or browser APIs.
- **Route Handlers** (`app/api/**/route.ts`) — always validate request body with Zod schemas before processing.
- **Server Actions** — prefer over API routes for form mutations when possible. Always revalidate paths after mutations.
- **Metadata** — export `metadata` or `generateMetadata` from every page for SEO.
- **Loading/Error states** — every route group must have `loading.tsx` and `error.tsx` boundaries.
- **Do NOT use deprecated APIs** — no `getServerSideProps`, `getStaticProps`, or `pages/` directory.

### File & Naming Conventions
```
src/components/    → PascalCase (MatchCard.tsx, LiveIndicator.tsx)
src/hooks/         → camelCase with "use" prefix (useRealtimeMatch.ts)
src/lib/           → camelCase (scoring.ts, supabase/client.ts)
src/types/         → PascalCase for types/interfaces (Match, Prediction)
src/app/api/       → route.ts only (no page.tsx in api directories)
```
- **No barrel exports** (`index.ts` re-exports) — import directly from the source file.
- **Co-locate tests** — `__tests__/ComponentName.test.tsx` next to the component.

### State Management
- **Zustand** for global client state (theme, user preferences, UI state).
- **TanStack Query** for all server state (matches, predictions, teams). Never store API data in Zustand.
- **Supabase Realtime subscriptions** — always clean up in `useEffect` return. Use the `useRealtimeMatch` hook.

---

## 2. Security — CRITICAL

### Authentication & Authorization
- **Never trust the client** — always verify `auth.uid()` server-side in API routes and RLS policies.
- **Supabase client** — use `createServerClient` (from `@supabase/ssr`) in Server Components and API routes. Use `createBrowserClient` only in Client Components.
- **Middleware** — `src/middleware.ts` must protect all `/predictions/*`, `/api/predictions/*`, and `/api/notifications/*` routes.
- **Session validation** — check `supabase.auth.getUser()` (NOT `getSession()`) in every protected API route. `getSession()` reads from JWT without server verification and can be spoofed.

### Environment Variables
- **NEVER expose server secrets to the client** — only `NEXT_PUBLIC_*` variables are safe for the browser.
- **Required server-only env vars**: `SUPABASE_SERVICE_ROLE_KEY`, `FOOTBALL_DATA_API_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET`.
- **Required client env vars**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
- **Never log env vars** — not even partially. No `console.log(process.env)`.
- **`.env.local`** is gitignored. **`.env.local.example`** has placeholder values for onboarding.

### API Security
- **Cron routes** — validate `Authorization: Bearer ${CRON_SECRET}` header. Vercel sends this automatically for configured crons.
- **Rate limiting** — implement in-memory rate limiting on prediction endpoints (max 30 req/min per user).
- **Input validation** — validate ALL inputs with Zod schemas before any DB operation. Reject invalid payloads with 400.
- **SQL injection** — never build raw SQL strings. Always use Supabase query builder or parameterized queries.
- **CORS** — Next.js handles this. Do NOT add permissive `Access-Control-Allow-Origin: *` headers.

### Row Level Security (RLS)
- **RLS is MANDATORY** on every table that stores user data (`predictions`, `stage_predictions`, `push_subscriptions`, `match_alerts`, `profiles`).
- **Public read tables** (`teams`, `matches`, `players`, `head_to_head`) — RLS enabled with `FOR SELECT USING (true)`.
- **Write policies** — always include `WITH CHECK (auth.uid() = user_id)`.
- **Never use the service role key** in client-side code. Only in server-side cron jobs and admin operations.

### Data Protection
- **Prediction locking** — enforce server-side: `WHERE locked = false AND match_date > now()`. Never rely on client-side checks alone.
- **Score validation** — predicted scores must be integers ≥ 0 and ≤ 99. Reject anything else.
- **XSS prevention** — React escapes by default. NEVER use `dangerouslySetInnerHTML`. Sanitize any user-generated content (display_name, username).
- **Username validation** — alphanumeric + underscores only, 3-20 chars, no offensive words filter.

---

## 3. Database Best Practices

### Supabase / PostgreSQL
- **Migrations** — all schema changes go through `supabase/migrations/`. Never modify schema manually in the dashboard for production.
- **Indexes** — add indexes on: `predictions(user_id, match_id)`, `matches(status)`, `matches(match_date)`, `match_alerts(user_id)`.
- **Timestamps** — always use `TIMESTAMPTZ` (with timezone). Store everything in UTC. Convert to user's timezone only in the frontend.
- **Cascading deletes** — `profiles` deletion cascades to `predictions`, `stage_predictions`, `push_subscriptions`, `match_alerts`.
- **Soft deletes** — do NOT use soft deletes. Hard delete to stay within 500MB limit.
- **Connection management** — Supabase handles pooling. Do not create multiple client instances per request.

### Data Integrity
- **Unique constraints** — enforce at DB level, not just application level.
- **CHECK constraints** — `predicted_home_score >= 0`, `predicted_away_score >= 0`.
- **Enums** — use PostgreSQL ENUMs or CHECK constraints for `status`, `stage`, `position` columns.

---

## 4. API Integration

### External APIs (Football-Data.org, API-Football)
- **Never call external APIs from the client** — always proxy through Next.js API routes or cron jobs.
- **Cache aggressively** — store API responses in Supabase. Serve from DB, not from the external API directly.
- **Error handling** — wrap every external API call in try/catch. Log errors with context (endpoint, status code). Return cached data on failure.
- **Rate limit awareness** — implement request counting. If approaching limit, skip non-critical updates.
- **API key rotation** — store keys in env vars. If compromised, rotate immediately via provider dashboard.
- **Timeout** — set fetch timeout to 10s for external APIs. Abort and use cache if exceeded.

---

## 5. UI/UX & Design Standards

### Visual Design
- **Design system** — define all colors, spacing, typography, and shadows in `tailwind.config.ts`. Never use arbitrary values inline.
- **Dark mode first** — design for dark theme, then adapt for light. Use CSS variables for theme tokens.
- **Color palette** — use a cohesive palette. No raw hex colors scattered in components. All colors defined in config.
- **Typography** — use `Inter` or `Geist` font family. Import via `next/font/google` for optimal loading.
- **Spacing** — use Tailwind's spacing scale consistently. No magic numbers.

### Accessibility (a11y)
- **Semantic HTML** — use `<main>`, `<nav>`, `<section>`, `<article>`, `<button>` (not `<div onClick>`).
- **Alt text** — every `<img>` must have descriptive alt text. Flags: `alt="Bandera de Colombia"`.
- **Keyboard navigation** — all interactive elements must be focusable and operable with keyboard.
- **Color contrast** — minimum 4.5:1 ratio for text. Test with Lighthouse accessibility audit.
- **ARIA labels** — add to icon-only buttons and interactive elements without visible text.
- **Focus indicators** — visible focus rings on all interactive elements. Never remove `outline`.

### Performance
- **Images** — use `next/image` for all images. Set explicit `width` and `height`. Use `priority` for above-the-fold.
- **Flags** — load SVGs from FlagCDN via `next/image` with appropriate sizing (never full-size SVGs for small icons).
- **Code splitting** — use `dynamic()` imports for heavy components (bracket view, charts).
- **Bundle size** — monitor with `@next/bundle-analyzer`. Keep total JS < 200KB gzipped.
- **Fonts** — use `next/font` with `display: 'swap'`. Subset to Latin characters.

### Animations (Framer Motion)
- **Respect user preferences** — check `prefers-reduced-motion` and disable animations accordingly.
- **Keep animations subtle** — max 300ms duration for UI transitions. No flashy or distracting effects.
- **Live indicator** — use CSS animation (pulse) instead of Framer Motion to avoid re-renders.
- **Layout animations** — use `layoutId` for shared element transitions between pages.

### Responsive Design
- **Mobile-first** — write base styles for mobile, then add `md:` and `lg:` breakpoints.
- **Touch targets** — minimum 44x44px for all tappable elements.
- **No horizontal scroll** — test at 320px width minimum.
- **Bottom navigation** — use bottom nav on mobile, sidebar on desktop.

---

## 6. Error Handling & Logging

### Error Boundaries
- Every route segment must have `error.tsx` with user-friendly fallback UI.
- Global error boundary in `app/global-error.tsx`.
- **Never show stack traces or internal errors to users** — log them server-side, show generic message to user.

### Logging
- Use `console.error` for errors, `console.warn` for warnings. No `console.log` in production code.
- Include context in error logs: `console.error('[sync-scores]', { matchId, error: err.message })`.
- **Never log sensitive data** — no tokens, passwords, API keys, or full user objects.

---

## 7. Testing

### Minimum Requirements
- **Zod schemas** — unit test all validation schemas with valid and invalid inputs.
- **Scoring logic** — 100% test coverage for `src/lib/scoring.ts`. This is business-critical.
- **API routes** — integration tests for prediction CRUD (create, read, update, lock).
- **E2E** — Playwright test for: register → login → make prediction → verify in dashboard.

### Test Conventions
- Use `vitest` for unit/integration tests.
- Use `@testing-library/react` for component tests.
- Use `playwright` for E2E tests.
- Mock Supabase client in tests — never hit real DB in unit tests.

---

## 8. Git & Deployment

### Git
- **Conventional commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- **Branch strategy**: `main` (production), `develop` (staging), `feat/*` (features).
- **No secrets in git** — `.env.local` is in `.gitignore`. Verify before every commit.
- **PR size** — keep under 400 lines changed. Larger PRs must be split.

### Vercel Deployment
- **Preview deployments** — every PR gets a preview URL. Test there before merging to `main`.
- **Environment variables** — set in Vercel Dashboard, not in code. Different values for Preview vs Production.
- **Cron jobs** — only 2 allowed on free tier. Defined in `vercel.json`.
- **Build output** — `npm run build` must pass with zero errors and zero warnings before deploy.
- **Headers** — set security headers in `next.config.ts`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
