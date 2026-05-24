@AGENTS.md

# Claude-Specific Rules

## Critical Security Checks — Do These EVERY Time

Before writing ANY code that touches auth, data, or APIs:

1. **Am I exposing a secret?** — Check that no `SUPABASE_SERVICE_ROLE_KEY`, `FOOTBALL_DATA_API_KEY`, `VAPID_PRIVATE_KEY`, or `CRON_SECRET` is accessible from the client. Only `NEXT_PUBLIC_*` vars go to the browser.
2. **Am I validating on the server?** — Never trust client-side validation alone. All prediction locks, score ranges, and auth checks must be enforced server-side.
3. **Am I using `getUser()` not `getSession()`?** — `getSession()` reads from the JWT without server verification. Always use `supabase.auth.getUser()` for protected routes.
4. **Is RLS enabled?** — Every table with user data must have Row Level Security enabled and tested.
5. **Am I sanitizing output?** — No `dangerouslySetInnerHTML`. No rendering raw HTML from external sources.

## Code Generation Guidelines

### When creating new components:
- Default to **Server Component** unless it needs `useState`, `useEffect`, `onClick`, or browser APIs.
- Always add `loading.tsx` and `error.tsx` siblings for new route segments.
- Include proper TypeScript types — no `any`, no implicit returns.
- Add JSDoc comments for non-obvious logic.

### When creating API routes:
```typescript
// TEMPLATE: Every API route must follow this pattern
import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({ /* ... */ });

export async function POST(request: NextRequest) {
  // 1. Auth check
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Input validation
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  }

  // 3. Business logic with try/catch
  try {
    // ... DB operations
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('[route-name]', { userId: user.id, error: (error as Error).message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### When creating cron routes:
```typescript
// TEMPLATE: Cron routes must verify the secret
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... cron logic
}
```

### When working with Supabase:
- Use `@supabase/ssr` for client creation — NOT `@supabase/supabase-js` directly.
- Server: `createServerClient()` — reads cookies, validates session server-side.
- Client: `createBrowserClient()` — for Client Components only.
- Service role: ONLY in cron jobs and admin scripts. Never in user-facing code.

## Things to NEVER Do

- ❌ `console.log(process.env)` — logs all secrets
- ❌ `dangerouslySetInnerHTML` — XSS vector
- ❌ `any` type — defeats TypeScript's purpose
- ❌ Store API keys in client code or `NEXT_PUBLIC_*` vars
- ❌ Skip RLS on user data tables
- ❌ Use `getServerSideProps` or `pages/` directory (App Router only)
- ❌ Call external APIs directly from components (proxy through API routes)
- ❌ Commit `.env.local` to git
- ❌ Use inline styles or arbitrary Tailwind values — use the design system
- ❌ Remove existing comments or docstrings unless directly related to the change

## Things to ALWAYS Do

- ✅ Read `node_modules/next/dist/docs/` for current Next.js API reference
- ✅ Validate with Zod before any DB write
- ✅ Use `getUser()` for auth verification
- ✅ Add error boundaries (`error.tsx`) for new routes
- ✅ Test scoring logic changes — it's business-critical
- ✅ Use `next/image` for all images
- ✅ Use `next/font` for typography
- ✅ Set security headers in `next.config.ts`
- ✅ Keep components under 150 lines — split if larger
- ✅ Use semantic HTML elements
