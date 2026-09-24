# Setup and deployment

This site needs a server and a database, so it can't run on GitHub Pages. Production runs on **Vercel** (hosting), **Supabase** (Postgres) and **Cloudflare** (DNS for the domain, which stays registered at GoDaddy).

Costs: Vercel's free Hobby plan is for non-commercial use only, and this site sells services, so it needs **Vercel Pro ($20/month)**. Supabase's free plan works to start: the Vercel cron in `vercel.json` queries the database every six hours so the project is never paused for inactivity. The free plan has **no automatic backups**, so move to **Supabase Pro ($25/month, daily backups kept 7 days)** before taking real orders.

## 1. Database (Supabase)
1. Create a project (or use an existing one) in the **East US (North Virginia)** region. Vercel runs the site in Washington, D.C. (`iad1` in `vercel.json`); if your project is in another region, change `regions` in `vercel.json` to the Vercel region closest to it. The free plan allows two active projects.
2. Click **Connect** at the top of the project dashboard. Copy two connection strings and put your database password in each (URL-encode special characters, for example `@` becomes `%40`):
   - **Transaction pooler** (port `6543`): this goes in Vercel as `DATABASE_URL`.
   - **Session pooler** (port `5432`): use this one from your computer for migrations and scripts.
   Don't use the "Direct connection" string (`db.<ref>.supabase.co`); it is IPv6-only and won't work from Vercel.
3. Optional, recommended: under **Project Settings -> Database -> SSL Configuration**, download the certificate and set its contents as `DATABASE_CA_CERT` (with `\n` line breaks) locally and in Vercel. Connections are always encrypted; with the certificate, the server's identity is verified too.
4. From WSL in the project folder, with `DATABASE_URL` set to the **session pooler** string:
   ```bash
   npm ci
   npm run db:migrate
   npm run db:seed
   npm run admin:create -- you@example.com "Your Name" "a-long-password"
   npm run db:check
   ```
   `db:check` should print PASS on every line. Then set `DATABASE_URL` to the **transaction pooler** string and run `npm run db:check` again; that is the connection the live site uses.
5. The site uses its own logins, not Supabase Auth, and never uses Supabase's auto-generated REST API. Row-level security is turned on for every table by the migrations, so that API can't read anything. You can also turn it off entirely under **Project Settings -> Data API**.
6. After any schema change, run `npm run db:migrate` (session pooler string) before deploying.

## 2. Hosting (Vercel)
1. Review the `rebuild-2026-09` branch on GitHub and merge it into `main`. The old GitHub Pages site stops working at that point, so do steps 2-5 and the domain section right after.
2. At vercel.com, upgrade to **Pro**, then **Add New -> Project** and import this GitHub repository. Vercel detects Next.js; keep the defaults.
3. Before the first deploy, add the environment variables from `.env.example`. At minimum:
   - `DATABASE_URL` = the Supabase **transaction pooler** string (port 6543)
   - `APP_URL` = `https://the7billiondollarbrain.com`
   - `INVESTMENTS_ENABLED` = `false`
4. Deploy. Open `https://<your-project>.vercel.app/api/health`; it should show `{"ok":true}`.
5. In the repository's GitHub settings, turn off **Pages** and delete the old `CNAME` file if it is still there.

## Domain (Cloudflare DNS)
The domain is registered at GoDaddy but its DNS is already managed in Cloudflare, so all changes happen in Cloudflare. Nothing changes at GoDaddy.
1. In Vercel: **Project -> Settings -> Domains**, add `the7billiondollarbrain.com` and `www.the7billiondollarbrain.com` (redirect `www` to the root). Vercel shows the DNS records to create.
2. In Cloudflare: **DNS -> Records** for the domain. Delete the old records that point at GitHub Pages (`185.199.x.x` A records, or a CNAME to `github.io`), then add the records Vercel showed.
3. Set every one of those records to **DNS only** (grey cloud). If Cloudflare's proxy (orange cloud) is on, Vercel can't issue the SSL certificate and visitors get redirect loops.
4. In Cloudflare **SSL/TLS -> Overview**, use **Full (strict)**.
5. Wait for Vercel to show the domain as valid (usually minutes), then load the site and `/api/health`.

## 3. Payments (Stripe)
1. In the Stripe dashboard, copy the secret key into `STRIPE_SECRET_KEY`.
2. Add a webhook endpoint `https://the7billiondollarbrain.com/api/stripe/webhook` with these events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`. Copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
3. Turn on the customer portal (Settings → Billing → Customer portal) so members can manage cards and cancel subscriptions from **Manage billing**.
4. Prices come from the admin panel; there's nothing to create in Stripe. Installments bill monthly and stop automatically after the last payment.

## 4. Business calendar (Google Calendar)
1. In Google Cloud, create a project, enable the **Google Calendar API**, and create a **service account** with a JSON key.
2. In Google Calendar, share the business calendar with the service account's email and choose **Make changes to events**.
3. Set `GOOGLE_CALENDAR_ID` (the calendar's ID from its settings), `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_SERVICE_ACCOUNT_KEY` (the key's `private_key`, with `\n` line breaks).

Bookings then skip times that are busy on that calendar, and each new booking is added to it. Cancelling a booking in the admin panel removes the event.

## 5. Email (Resend, optional)
Verify the domain at resend.com, then set `RESEND_API_KEY`, `EMAIL_FROM` and `ADMIN_NOTIFY_EMAIL`. Customers get booking confirmations; you get new bookings and contact messages.

## 6. Live chat (optional)
Create a free Crisp or Tawk.to account and set `NEXT_PUBLIC_CRISP_WEBSITE_ID`, or `NEXT_PUBLIC_TAWK_PROPERTY_ID` and `NEXT_PUBLIC_TAWK_WIDGET_ID`. Answer chats from their mobile apps.

## 7. Contact details
Set `NEXT_PUBLIC_CONTACT_PHONE` and `NEXT_PUBLIC_CONTACT_EMAIL`.

## Before going live
- Replace the seeded copy you want to change in **Admin → Page text**. The About text includes "over 100 years of combined business expertise" from the spec; confirm it or edit it.
- Add eBooks and videos in **Admin → Products** (content links are only shown to buyers and premium members; host the files somewhere that isn't publicly listed).
- The two tradeline packages are unpublished drafts. Publish them when the offering is ready.
- `INVESTMENTS_ENABLED` stays `false` until the investment offering is ready; the page is a members-only placeholder.
