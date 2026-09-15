# EARTHLINK Philippines. Owner's manual

For the person who runs the site and does not write code. Everything here is a click, a
paste, or a message to the developer. Last updated 17 September 2026.

Live site: **https://earthlinkph.vercel.app**
Older link that still works: https://earthlink-ebon.vercel.app

---

## 1. What the site is, in one minute

EARTHLINK is a public register of environmental concerns in the Philippines.

- Anyone can **file a report** in four steps from a phone. It gets a permanent case number,
  a pin on the map, and its own public page. You get an email with every detail and the
  photographs attached.
- The register already holds **46 real 2026 incidents** taken from news reporting and
  official releases, each with its sources on the case page.
- Every number on the dashboard is **calculated** from the cases and missions on the site.
  Nothing is typed in.

What is not built yet: accounts, an admin screen inside the site, and messages back to the
person who reported. For now you handle reports from your email and the database dashboard.

## 2. The dashboards, and which one holds what

You have four accounts. Keep the logins in a password manager, never in a chat or a note.

| Dashboard | What it holds | Where |
|---|---|---|
| **Vercel** | The website itself. Deployments, the settings that turn intake on, the kill switch. | vercel.com, project `earthlink` |
| **Supabase** | Every filed report (the `reports` table) and its photographs (the `evidence` bucket). | supabase.com, project `earthlinkph` |
| **Resend** | Sends the report emails and contact-form messages. Shows what was delivered. | resend.com, your Gmail account |
| **GitHub** | The code. Every change is a commit here, and pushing to `main` publishes the site. | github.com/arabpame/website |

The code lives in git. The reports live in Supabase. The settings live in Vercel. None of
them live on a laptop.

## 3. How to log in

- **Vercel, Supabase, Resend:** log in with the account they were created with. If you did
  not create one of them, ask the developer who did to add your email as a member rather
  than sharing the password.
- There is no login on the website itself. Nothing on the site needs one yet.

## 4. Handling incoming reports, day to day

**When a report is filed you get an email** with the subject `New EARTH report EARTH-2026-NNNN`.
It contains every field, a map link, links to the photographs (valid seven days), and the
photographs as attachments. The reporter's name and contact are in this email and in the
database only. They are never on the public page.

Until EARTHLINK has its own domain, the email can only go to the address that owns the
Resend account, which is your own Gmail. See section 9 to change that once a domain exists.

**To check a report, then move it along:**

1. Open the case page. The link is in the email. Read it, look at the photographs.
2. Open Supabase, **Table Editor**, table `reports`. Find the row by `case_number`.
3. Change `status` to the next stage by double-clicking the cell. The six values, in order:
   `reported`, `verifying`, `referred`, `progress`, `resolved`, `monitoring`. Save.
4. The public case page shows the new status within five minutes.
5. The office you referred it to is not recorded on filed reports yet. Note it in your own
   records. Adding referral notes to the page is the next build stage.
6. Reply to the reporter yourself from the email if they left a contact.

**Duplicates.** If two people report the same problem, keep the first, delete the second
(section 5), and mention the extra report in your reply. Merging on the site itself is the
next build stage.

**Spam or nonsense.** Delete it (section 5). The form already blocks bots and more than five
reports an hour from one connection.

## 5. Deleting a report

Ask the developer to run, from the project folder on their laptop:

```bash
npm run report:delete -- EARTH-2026-0102
```

That removes the row and the photographs together. Deleting the row in the Supabase Table
Editor leaves the photographs behind, so use the command. The public pages drop the case
within five minutes.

## 6. Handling contact-form messages

The Contact page emails you with the subject `EARTHLINK enquiry (topic) from Name`. The
sender's address is set as reply-to, so you answer by replying to the email. Nothing is
stored in the database for these.

## 7. Where emails go, and how to see what was sent

- Reports and enquiries go to the address in the Vercel setting `REPORTS_TO_EMAIL`
  (enquiries use `CONTACT_TO_EMAIL` if that is set).
- To see whether an email actually went out, open Resend, **Emails**. Each row shows the
  subject and a status: delivered, bounced, or opened.
- The Contact page and the footer show your Gmail address for now. When EARTHLINK owns a
  domain, the developer switches them to addresses at that domain in one place.

## 8. Checking the site is running

1. Open https://earthlinkph.vercel.app on your phone. The map should load with pins.
2. Open the Report page and file a test report. You should get a case number and, within a
   minute, the email. Then delete the test (section 5).
3. If step 2 says **"Reporting is temporarily unavailable"**, a setting is missing in Vercel.
   See section 11.

Do this the day before any presentation, on mobile data, not on venue Wi-Fi.

## 9. Changing where the emails go

1. Vercel, project `earthlink`, **Settings, Environment Variables**.
2. Edit `REPORTS_TO_EMAIL`. Until a domain is verified in Resend, this must be the address
   that owns the Resend account, or Resend will refuse to deliver.
3. Vercel, **Deployments**, top deployment, **Redeploy**. Settings only take effect after a
   redeploy.

To send to any address at all, buy a domain, add it in Resend under **Domains**, follow the
verification steps, then set `FROM_EMAIL` in Vercel to an address at that domain and redeploy.

## 10. Updating content

**Wording on a page.** All text lives in the code. Send the developer the page name, the
exact sentence, and the new sentence. Small job.

**Adding a case that was in the news.** Send the developer the news link. They add it to the
research record with its source, run one command, and it appears with the source shown on
its page. Do not ask for a case to be added without a source.

**Adding a mission or event.** Same: send the announcement link and the date.

**Photographs.** Send the developer the original files. They are resized and compressed
before they go on the site.

**A case's status.** You can do this yourself, section 4.

## 11. When something breaks

| What you see | Likely cause | Do this |
|---|---|---|
| "Reporting is temporarily unavailable" on the form | One of the four settings in Vercel is missing or wrong | Vercel, Settings, Environment Variables. Check `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `REPORTS_TO_EMAIL` exist. Redeploy. If unsure, message the developer. |
| Report filed but no email arrived | Resend rejected it, usually the "to" address is not the account owner | Resend, Emails: look for the row and its status. Fix `REPORTS_TO_EMAIL` per section 9. The report is still saved and on the map. |
| "We could not find that city or municipality" | Spelling, or wrong province | Check both fields. For NCR cities write Metro Manila as the province. |
| A page shows an error | A deployment failed or a database outage | Vercel, Deployments: is the top one green? If red, message the developer. The site keeps serving the last good version. |
| The site is down completely | The kill switch was turned on, or a Vercel outage | Vercel, project, Settings, Deployment Protection. Vercel Authentication must be OFF. |
| A deleted case still shows | Pages refresh every five minutes | Wait five minutes, or ask for a redeploy. |

Everything else: message the developer with the page link and a screenshot.

## 12. Deploying updates

You do not deploy. The developer pushes a change to GitHub and Vercel publishes it in about
two minutes. You can watch it in Vercel, **Deployments**. If you ever need to publish again
without a code change (for example after changing a setting), use **Redeploy** on the top
deployment.

## 13. Taking the site offline and back

Only for a real reason. Vercel, project, **Settings, Deployment Protection**, switch
**Vercel Authentication** on. Every visitor then sees a Vercel sign-in and nothing else.
Switch it off to restore. Nothing is deleted either way. The developer can do the same with
`npm run site:offline` and `npm run site:online`.

## 14. Presenting the site

The five-minute route and the live filing script are in [`FILING-A-REPORT.md`](FILING-A-REPORT.md).
Rehearse the filing twice on your phone before the day.

## 15. Privacy and what is public

- Public: the description, category, location to barangay level, dates, status history,
  measured results, and for documented cases their sources.
- Never public: the reporter's name, contact, and the photographs. The photographs stay in a
  private bucket and go only to you by email.
- Reports are handled under the Data Privacy Act of 2012. The privacy notice on the site
  says so, and it is accurate to what the site does. Do not promise more than it says.

## 16. Before-you-publish checklist

- [ ] `npm run verify` passes on the developer's machine.
- [ ] The Report page files a test report on the live site and the email arrives.
- [ ] The test report is deleted afterwards.
- [ ] Every page has been looked at on a phone.
- [ ] No placeholder text anywhere the public can see.
- [ ] Every dashboard number still has its explanation line underneath.

## 17. Questions people ask

**Is the data real?** Yes, twice. Reports filed through the site are stored in a real
database and emailed to you. Every other case is a documented 2026 incident with its sources
on the page.

**Can someone report anonymously?** Yes. The case still gets a number and a public page.

**What happens if an office ignores a referral?** The case stays at "Referred to
authorities" and the public page counts the days it has waited. That pressure is the point.

**Can this be in Filipino?** Not yet. It is recorded as a real limitation on the
accessibility page rather than hidden.

**Why does everything come to my Gmail?** Because that address owns the Resend account, and
Resend delivers only to its owner until a domain is verified. Once you have a domain, any
address can receive the emails.

**What does it cost to run?** Nothing at current volume. Vercel, Supabase and Resend are all
on free tiers. What costs money is build time.
