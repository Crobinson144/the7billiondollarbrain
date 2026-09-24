# The 7 Billion Dollar Brain

Website for The 7 Billion Dollar Brain consulting firm: business services with online booking, a store for guides and business packages, monthly subscriptions, basic and premium member accounts, live chat, site search, and an admin panel for editing everything.

**Stack:** Next.js 15 (App Router, TypeScript) on Vercel, PostgreSQL (Supabase) with Drizzle ORM, Stripe (payments, installments, subscriptions), Google Calendar (booking sync), Resend (email), Crisp or Tawk.to (live chat), Tailwind CSS 4.

## What's on the site

| Area | What it does |
| --- | --- |
| Home | Tagline, introduction, log in / create account, featured services |
| Services | Ten services from the spec, each with **Schedule a session now** |
| Booking | Name, address, phone, email, inquiry, service; Monday to Friday, 9 AM to 7 PM Eastern, 30-minute slots. Checks the business calendar for conflicts and adds each booking to it |
| Products | eBooks and video tutorials, business packages (pay in full or 3, 6 or 9 monthly installments), add-ons, and free-quote items |
| Subscriptions | Unlimited consultation (3, 6 or 12 monthly payments) and the Education Pass (monthly, cancel anytime) |
| Members | Basic accounts are free; any subscription that grants premium unlocks premium. The members library opens purchased items, and everything marked "included with premium" |
| About / Contact | Editable About copy and team; live chat, phone, email and a contact form |
| Search | Full-text search across services, products, plans and page copy |
| Accounts | Sign up (with Terms consent), log in, forgot / reset password, email confirmation (when email is on) |
| Legal | Terms of Service, Privacy Policy, Refund and Cancellation Policy, Accessibility; consent is recorded at signup and checkout |
| Admin (`/admin`) | Bookings, messages, orders, members (tier and role), and create / edit / delete for services, products, plans, team and all page text |

The investment and Business in a Box pages are behind a members-only feature flag (`INVESTMENTS_ENABLED`, off by default). The business credit packages and the starter eBook and video catalog are seeded as unpublished drafts; publish each one from the admin panel once it's reviewed and its file or video link is added.

## Run locally

```bash
cp .env.example .env          # set DATABASE_URL at minimum
npm install
npm run db:migrate            # create tables
npm run db:seed               # starting catalog and page copy from the spec
npm run admin:create -- you@example.com "Your Name" "a-long-password"
npm run db:check              # confirm the database is ready
npm run dev                   # http://localhost:3000
```

Payments, calendar, email and chat stay off until their keys are set; the admin panel shows which ones are missing.

## Tests

```bash
npm test                                   # unit tests
TEST_DATABASE_URL=postgres://... npm test  # also runs the Stripe webhook integration test against a disposable database
npm run typecheck
```

Deployment and account setup: see [SETUP.md](SETUP.md).
