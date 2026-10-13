# Finanzas Personales

A personal finance web application built with Next.js, React, TypeScript, and Supabase. It brings income, expenses, recurring transactions, and statistics into a dashboard, with account management, Stripe subscription flows, and PWA installation support.

## Product areas

- Income and expense creation, editing, and listing.
- Recurring transaction configuration and processing.
- Dashboard and statistics views.
- Registration, login, password recovery, and profile management.
- Stripe checkout, customer portal, and webhook routes.
- PWA manifest, installation UI, service worker, and offline fallback.

## Stack

Next.js 15 App Router · React 19 · TypeScript · Tailwind CSS · Supabase · Stripe · Chart.js.

## Local development

The repository specifies `pnpm@10.5.2` in `package.json`.

```sh
git clone https://github.com/tymkiwdylan/finanzas-personales.git
cd finanzas-personales
pnpm install
```

Create `.env.local` with your own Supabase configuration:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Configure a development Supabase database to match the types in `src/types/supabase.ts`, and review the incremental SQL files in `migrations/`. The repository does not include a complete initial database migration.

To exercise billing, configure your own Stripe test credentials and webhook signing secret. The variables used by the code include `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET`; live-mode configuration also exists in `src/utils/stripe/config.ts`. Keep server secrets outside version control.

```sh
pnpm dev
```

Open `http://localhost:3000`. Production-mode commands are `pnpm build` and `pnpm start`.

## Repository map

| Location | Purpose |
| --- | --- |
| `src/app/(dashboard)` | Income, expenses, statistics, settings, and profile screens |
| `src/app/auth` | Authentication and password-reset flows |
| `src/app/api` | Stripe checkout, customer portal, and webhook handlers |
| `src/context` | Authentication and budget state |
| `src/utils` | Supabase, Stripe, currency, and service-worker helpers |
| `migrations` | Incremental database changes |

## Further documentation

- [Recurring transaction behavior](docs/recurring-transactions.md)
- [PWA implementation and manual checks](PWA-README.md)
- [Package manager conventions](docs/package-manager.md)
- [Vercel deployment configuration](docs/vercel-deployment.md)

PWA support includes an offline fallback; it should not be interpreted as complete offline transaction synchronization.
