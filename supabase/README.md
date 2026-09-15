# Report intake: Supabase and Resend setup

The Report page saves real reports. This is everything needed to switch it on for a
new project, a new laptop, or a new Vercel deployment. About fifteen minutes.

## What the pieces do

| Piece | Job | Without it |
|---|---|---|
| Supabase, table `reports` | Stores every filed report and assigns the case number | On a laptop, reports go to `.cache/reports/` so the flow still works offline. On Vercel, the Report page says reporting is temporarily unavailable. |
| Supabase, bucket `evidence` | Stores the photographs, privately | Photographs are refused. |
| Resend | Emails each report to the founder with photographs attached | The report is still saved and on the map. The email is skipped and logged. |

## 1. Supabase, once per project

1. Create a project at supabase.com. Free tier. Region: Singapore.
2. Open **SQL Editor**, paste the whole of [`migrations/0001_reports.sql`](migrations/0001_reports.sql), run it.
   It creates the table, the case-number trigger and the private `evidence` bucket. It is
   safe to run twice.
3. Open **Project Settings -> API** and copy two values into `.env.local` and into the
   Vercel dashboard (Settings -> Environment Variables, all environments):

   ```
   NEXT_PUBLIC_SUPABASE_URL=       the Project URL
   SUPABASE_SERVICE_ROLE_KEY=      the service_role key. Server only. Never the anon key here.
   ```

Row level security is on and there are no policies, so the public anon key can read and
write nothing. Only the server, with the service role key, touches the table. That is the
whole security model, and it means the service role key must never reach the browser: it is
deliberately NOT prefixed `NEXT_PUBLIC_`, and `npm run security` fails if it ever is.

## 2. Resend, once per project

1. Create an account at resend.com with the email address that should RECEIVE the reports.
   Until EARTHLINK verifies its own domain in Resend, the free tier only delivers to the
   address that owns the account. That is Resend's rule.
2. **API Keys -> Create**. Sending access is enough. Copy it into `.env.local` and Vercel:

   ```
   RESEND_API_KEY=       re_...
   REPORTS_TO_EMAIL=     the address that owns the Resend account
   CONTACT_TO_EMAIL=     optional. Where the contact form goes. Falls back to REPORTS_TO_EMAIL.
   ```

3. Leave `FROM_EMAIL` unset until a domain is verified. The site then sends from Resend's
   onboarding address. Once a domain is verified, set `FROM_EMAIL=EARTHLINK <reports@yourdomain>`.

## 3. Check it

```bash
npm run dev
```

File a report on `/report`. You should see a case number, the case on `/map` and `/cases`,
and an email in the inbox within seconds. On Vercel, redeploy after adding the variables:
environment variables are read at build and at request time, and the map pages are rebuilt
on demand after every report.

## Where the data lives

- **Reports:** Supabase -> Table Editor -> `reports`. Reporter name and contact are the
  private columns; the site never selects them.
- **Photographs:** Supabase -> Storage -> `evidence`, one folder per case number.
- **Changing a case's status:** edit the `status` column in the Table Editor. The public
  case page reads it on the next visit. A proper verification screen is the next build stage.

## New laptop

Nothing above is on the laptop. `.env.local` is gitignored and does not survive a
reformat. Refill it from the two dashboards, never from a chat message or a screenshot.
